import { useState, useEffect } from "react";

const BADGE_CLASS = {
  pendiente:  "cl-badge--pendiente",
  en_proceso: "cl-badge--en_proceso",
  completado: "cl-badge--completado",
  cancelado:  "cl-badge--cancelado",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function fullName(c) {
  return [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
    .filter(Boolean).join(" ");
}
function initials(c) {
  return `${c.primer_nombre?.[0] ?? ""}${c.primer_apellido?.[0] ?? ""}`;
}

export default function HistorialModal({ open, onClose, cliente, fetchHistorial }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!open || !cliente) return;
    setLoading(true);
    setError(null);
    fetchHistorial(cliente.id)
      .then((res) => setHistorial(res.historial ?? []))
      .catch((err) => {
        setError(err.response?.data?.message ?? err.message ?? "Error al cargar historial.");
      })
      .finally(() => setLoading(false));
  }, [open, cliente, fetchHistorial]);

  if (!open || !cliente) return null;

  return (
    <div className="cl-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cl-modal">

        {/* Header */}
        <div className="cl-modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div className="cl-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {initials(cliente)}
            </div>
            <div>
              <h2 className="cl-modal__title">{fullName(cliente)}</h2>
              <p className="cl-modal__desc">Historial de servicios · DNI {cliente.dni ?? "—"}</p>
            </div>
          </div>
          <button className="cl-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Chips info */}
        <div className="cl-hist-inforow">
          <span className="cl-chip">📞 {cliente.telefono}</span>
          {cliente.correo && <span className="cl-chip">✉ {cliente.correo}</span>}
          {cliente.ciudad && (
            <span className="cl-chip">
              📍 {cliente.ciudad}{cliente.departamento ? `, ${cliente.departamento}` : ""}
            </span>
          )}
        </div>

        <hr className="cl-divider" style={{ margin: "0 1.4rem" }} />

        <div className="cl-modal__body">
          <p className="cl-section-label">
            Órdenes de trabajo ({historial.length})
          </p>

          {loading && <div className="cl-loading">Cargando historial…</div>}
          {error   && <div className="cl-error">⚠ {error}</div>}

          {!loading && !error && historial.length === 0 && (
            <div className="cl-empty">
              <span className="cl-empty__icon">📋</span>
              <p className="cl-empty__title">Sin órdenes registradas</p>
              <p className="cl-empty__desc">Este cliente no tiene órdenes de trabajo aún.</p>
            </div>
          )}

          {!loading && !error && historial.length > 0 && (
            <div className="cl-hist-list">
              {historial.map((o) => (
                <div key={o.id} className="cl-hist-card">
                  <div className="cl-hist-card__header">
                    <div className="cl-hist-card__left">
                      <span className="cl-orden-num">Orden #{o.id}</span>
                      <span className={`cl-badge ${BADGE_CLASS[o.estado] ?? "cl-badge--default"}`}>
                        {o.estado ?? "pendiente"}
                      </span>
                    </div>
                    <span className="cl-hist-fecha">{fmtDate(o.fecha_ingreso)}</span>
                  </div>
                  <div className="cl-hist-card__body">
                    <div className="cl-info-row">
                      <span className="cl-info-row__label">Vehículo</span>
                      <span className="cl-info-row__value">
                        {o.modelo ?? "—"} · {o.placa ?? "—"}
                      </span>
                    </div>
                    <div className="cl-info-row">
                      <span className="cl-info-row__label">Mecánico</span>
                      <span className="cl-info-row__value">{o.mecanico_nombre ?? "No asignado"}</span>
                    </div>
                    {o.decripcion_falla && (
                      <div className="cl-info-row">
                        <span className="cl-info-row__label">Falla</span>
                        <span className="cl-info-row__value">{o.decripcion_falla}</span>
                      </div>
                    )}
                    {o.diagnostico_observaciones && (
                      <div className="cl-info-row">
                        <span className="cl-info-row__label">Diagnóstico</span>
                        <span className="cl-info-row__value">{o.diagnostico_observaciones}</span>
                      </div>
                    )}
                    {o.fecha_entrega && (
                      <div className="cl-info-row">
                        <span className="cl-info-row__label">Entrega</span>
                        <span className="cl-info-row__value">{fmtDate(o.fecha_entrega)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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