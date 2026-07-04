import { useState, useEffect } from "react";

const BADGE = {
  recibido:    "or-badge--recibido",
  diagnostico: "or-badge--diagnostico",
  reparacion:  "or-badge--reparacion",
  completado:  "or-badge--completado",
  cerrado:     "or-badge--cerrado",
  cancelado:   "or-badge--cancelado",
};

const ESTADO_LABEL = {
  recibido: "Recibido", diagnostico: "En diagnóstico",
  reparacion: "En reparación", completado: "Completado",
  cerrado: "Cerrado", cancelado: "Cancelado",
};

const PRIORIDAD_LABEL = { 0: "Normal", 1: "Baja", 2: "Media", 3: "Alta" };
const PRIORIDAD_CLASS = { 0: "or-prioridad--0", 1: "or-prioridad--1", 2: "or-prioridad--2", 3: "or-prioridad--3" };

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-HN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Modal de detalle completo de una orden (HU-25).
 * Props:
 *  - open, onClose
 *  - orden: objeto de orden
 *  - fetchHistorial: (id) => Promise<historial[]>
 */
export default function OrdenDetalleModal({ open, onClose, orden, fetchHistorial }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [tab, setTab]             = useState("info");

  useEffect(() => {
    if (!open || !orden) return;
    setTab("info");
    setLoading(true);
    fetchHistorial(orden.id)
      .then(setHistorial)
      .catch(() => setHistorial([]))
      .finally(() => setLoading(false));
  }, [open, orden, fetchHistorial]);

  if (!open || !orden) return null;

  return (
    <div className="or-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="or-modal or-modal--lg">
        <div className="or-modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div>
              <h2 className="or-modal__title">Orden #{orden.numero_orden}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span className={`or-badge ${BADGE[orden.estado] ?? ""}`}>
                  {ESTADO_LABEL[orden.estado] ?? orden.estado}
                </span>
                <span className={`or-prioridad ${PRIORIDAD_CLASS[orden.prioridad] ?? "or-prioridad--0"}`}>
                  · Prioridad {PRIORIDAD_LABEL[orden.prioridad] ?? "Normal"}
                </span>
              </div>
            </div>
          </div>
          <button className="or-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(108,99,255,0.1)", margin: "12px 1.4rem 0", paddingBottom: 0 }}>
          {[["info", "Información"], ["historial", "Historial"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 16px", fontSize: 13, fontWeight: 500,
              color: tab === key ? "#9B8FFF" : "#5A5880",
              borderBottom: tab === key ? "2px solid #6C63FF" : "2px solid transparent",
              marginBottom: -1, transition: "color 0.15s",
            }}>{label}</button>
          ))}
        </div>

        <div className="or-modal__body">
          {tab === "info" && (
            <>
              {/* Cliente */}
              <p className="or-section-label">Cliente</p>
              <div className="or-detail-grid">
                <div className="or-detail-item">
                  <span className="or-detail-label">Nombre</span>
                  <span className="or-detail-value">{orden.cliente_nombre ?? "—"}</span>
                </div>
                <div className="or-detail-item">
                  <span className="or-detail-label">Teléfono</span>
                  <span className="or-detail-value">{orden.cliente_telefono ?? "—"}</span>
                </div>
              </div>
              <hr className="or-divider" />

              {/* Vehículo */}
              <p className="or-section-label">Vehículo</p>
              <div className="or-detail-grid">
                <div className="or-detail-item">
                  <span className="or-detail-label">Placa</span>
                  <span className="or-detail-value">{orden.placa ?? "—"}</span>
                </div>
                <div className="or-detail-item">
                  <span className="or-detail-label">Vehículo</span>
                  <span className="or-detail-value">{[orden.marca, orden.modelo, orden.anio].filter(Boolean).join(" ") || "—"}</span>
                </div>
              </div>
              <hr className="or-divider" />

              {/* Orden */}
              <p className="or-section-label">Detalle de la orden</p>
              <div className="or-detail-grid">
                <div className="or-detail-item">
                  <span className="or-detail-label">Fecha de ingreso</span>
                  <span className="or-detail-value">{fmtDate(orden.fecha_ingreso)}</span>
                </div>
                <div className="or-detail-item">
                  <span className="or-detail-label">Mecánico asignado</span>
                  <span className="or-detail-value">{orden.mecanico_nombre ?? "Sin asignar"}</span>
                </div>
                <div className="or-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="or-detail-label">Descripción del problema</span>
                  <span className="or-detail-value" style={{ lineHeight: 1.5 }}>{orden.descripcion_problema}</span>
                </div>
                {orden.diagnostico && (
                  <div className="or-detail-item" style={{ gridColumn: "1 / -1" }}>
                    <span className="or-detail-label">Diagnóstico</span>
                    <span className="or-detail-value" style={{ lineHeight: 1.5 }}>{orden.diagnostico}</span>
                  </div>
                )}
              </div>

              {orden.estado === "cerrado" && (
                <>
                  <hr className="or-divider" />
                  <div style={{ background: "rgba(72,187,120,0.08)", border: "1px solid rgba(72,187,120,0.2)", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 12, color: "#68D391", margin: 0 }}>
                      ✓ Orden cerrada — disponible para facturación.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {tab === "historial" && (
            <>
              <p className="or-section-label">Historial de estados ({historial.length})</p>
              {loading && <div className="or-loading">Cargando historial…</div>}
              {!loading && historial.length === 0 && (
                <div className="or-empty">
                  <span className="or-empty__icon">📋</span>
                  <p className="or-empty__title">Sin historial registrado</p>
                </div>
              )}
              {!loading && historial.length > 0 && (
                <div className="or-timeline">
                  {historial.map((h) => (
                    <div key={h.id} className="or-timeline-item">
                      <div className="or-timeline-dot" />
                      <div className="or-timeline-content">
                        <div className="or-timeline-header">
                          <span className="or-timeline-estado">
                            {ESTADO_LABEL[h.estado] ?? h.estado}
                          </span>
                          <span className="or-timeline-fecha">{fmtDateTime(h.fecha_hora)}</span>
                        </div>
                        {h.notas && <p className="or-timeline-notas">{h.notas}</p>}
                        {h.usuario_nombre && (
                          <p className="or-timeline-usuario">por {h.usuario_nombre}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="or-modal__footer">
          <button className="or-btn or-btn--secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}