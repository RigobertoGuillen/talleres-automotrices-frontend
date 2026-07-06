/**
 * SRP — HistorialModal tiene una sola responsabilidad:
 * mostrar el historial de órdenes de un cliente.
 */
import { useState, useEffect } from "react";

const ESTADO_BADGE = {
  recibido:       { cls: "cl-badge-recibido",    label: "Recibido" },
  "en reparacion":{ cls: "cl-badge-reparacion",  label: "En reparación" },
  listo:          { cls: "cl-badge-listo",       label: "Listo" },
  entregado:      { cls: "cl-badge-entregado",   label: "Entregado" },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/**
 * Props:
 *  - open, onClose
 *  - cliente: objeto del cliente
 *  - fetchHistorial: (id, filtros) => Promise<{ cliente, historial }>
 */
export default function HistorialModal({ open, onClose, cliente, fetchHistorial }) {
  const [historial, setHistorial]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin]       = useState("");

  useEffect(() => {
    if (!open || !cliente) return;
    cargar();
  }, [open, cliente]);

  async function cargar(filtros = {}) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHistorial(cliente.id, filtros);
      setHistorial(res.historial ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al cargar historial.");
    } finally {
      setLoading(false);
    }
  }

  function handleFiltrar() {
    cargar({ fecha_inicio: fechaInicio || undefined, fecha_fin: fechaFin || undefined });
  }

  if (!open || !cliente) return null;

  return (
    <div className="cl-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cl-modal" style={{ width: "min(620px, 96vw)" }}>
        <div className="cl-modal__header">
          <div>
            <h2 className="cl-modal__title">Historial de servicios</h2>
            <p className="cl-modal__desc">{cliente.nombre}</p>
          </div>
          <button className="cl-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Filtro por fecha */}
        <div style={{ padding: "0 1.4rem 1rem", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="cl-field" style={{ flex: 1, minWidth: 130 }}>
            <label className="cl-label">Desde</label>
            <input className="cl-input" type="date" value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="cl-field" style={{ flex: 1, minWidth: 130 }}>
            <label className="cl-label">Hasta</label>
            <input className="cl-input" type="date" value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <button className="cl-btn cl-btn--secondary" onClick={handleFiltrar}
            style={{ height: 36, marginBottom: 0 }}>
            Filtrar
          </button>
          {(fechaInicio || fechaFin) && (
            <button className="cl-btn cl-btn--ghost" onClick={() => {
              setFechaInicio(""); setFechaFin(""); cargar();
            }} style={{ height: 36 }}>✕</button>
          )}
        </div>

        <hr className="cl-divider" style={{ margin: "0 1.4rem" }} />

        <div className="cl-modal__body">
          <p className="cl-section-label">
            Órdenes registradas ({historial.length})
          </p>

          {loading && <div style={{ textAlign: "center", padding: "1.5rem", color: "#5A5880", fontSize: 13 }}>Cargando historial…</div>}
          {error   && <div className="cl-error">⚠ {error}</div>}

          {!loading && !error && historial.length === 0 && (
            <div className="cl-empty">
              <span className="cl-empty__icon">📋</span>
              <p className="cl-empty__title">Sin órdenes registradas</p>
              <p className="cl-empty__desc">Este cliente no tiene órdenes de trabajo.</p>
            </div>
          )}

          {!loading && !error && historial.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {historial.map((o, i) => {
                const badge = ESTADO_BADGE[o.estado] ?? { cls: "cl-badge-neutral", label: o.estado };
                return (
                  <div key={o.id ?? i} style={{
                    border: "1px solid rgba(108,99,255,0.12)",
                    borderRadius: 10, background: "#0D0F1A", overflow: "hidden",
                  }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderBottom: "1px solid rgba(108,99,255,0.1)",
                      flexWrap: "wrap", gap: 6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E6FF" }}>
                          Orden #{o.numero_orden ?? o.id}
                        </span>
                        <span className={`cl-badge ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "#5A5880" }}>
                        {fmtDate(o.fecha_ingreso)}
                      </span>
                    </div>
                    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
                      <InfoRow label="Vehículo"   value={`${o.modelo ?? "—"} · ${o.placa ?? "—"}`} />
                      <InfoRow label="Mecánico"   value={o.mecanico_nombre ?? "No asignado"} />
                      {o.descripcion_falla && <InfoRow label="Falla"      value={o.descripcion_falla} />}
                      {o.diagnostico_observaciones && <InfoRow label="Diagnóstico" value={o.diagnostico_observaciones} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="cl-modal__footer">
          <button className="cl-btn cl-btn--secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 6, fontSize: 12 }}>
      <span style={{ color: "#5A5880", minWidth: 76, flexShrink: 0 }}>{label}:</span>
      <span style={{ color: "#C8C6E8" }}>{value}</span>
    </div>
  );
}