import { useState, useEffect } from "react";

/**
 * Modal para asignar o reasignar mecánico a una orden (HU-20, HU-26).
 * Props:
 *  - open, onClose, onSave, saving
 *  - orden: orden actual
 *  - mecanicos: array de mecánicos disponibles
 *  - esReasignacion: boolean
 */
export default function AsignarMecanicoModal({ open, onClose, onSave, saving, orden, mecanicos, esReasignacion = false }) {
  const [mecanicoId, setMecanicoId] = useState("");
  const [notas, setNotas]           = useState("");
  const [error, setError]           = useState("");

  useEffect(() => {
    if (open) {
      setMecanicoId(orden?.mecanico_id ? String(orden.mecanico_id) : "");
      setNotas("");
      setError("");
    }
  }, [open, orden]);

  if (!open || !orden) return null;

  function handleSubmit() {
    if (!mecanicoId) { setError("Debes seleccionar un mecánico"); return; }
    onSave({ mecanico_id: Number(mecanicoId), notas_reasignacion: notas.trim() || null });
  }

  return (
    <div className="or-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="or-modal or-modal--sm">
        <div className="or-modal__header">
          <div>
            <h2 className="or-modal__title">
              {esReasignacion ? "Reasignar mecánico" : "Asignar mecánico"}
            </h2>
            <p className="or-modal__desc">Orden #{orden.numero_orden}</p>
          </div>
          <button className="or-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="or-modal__body">
          {esReasignacion && orden.mecanico_nombre && (
            <div style={{ background: "rgba(108,99,255,0.07)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ fontSize: 12, color: "#7B7A9E", margin: 0 }}>Mecánico actual</p>
              <p style={{ fontSize: 13, color: "#E8E6FF", margin: "2px 0 0", fontWeight: 500 }}>{orden.mecanico_nombre}</p>
            </div>
          )}

          <div className="or-field">
            <label className="or-label">
              {esReasignacion ? "Nuevo mecánico *" : "Mecánico *"}
            </label>
            <select
              className={`or-select${error ? " or-select--error" : ""}`}
              value={mecanicoId}
              onChange={(e) => { setMecanicoId(e.target.value); setError(""); }}
            >
              <option value="">Seleccionar mecánico…</option>
              {mecanicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre_completo ?? `${m.primer_nombre} ${m.primer_apellido}`}
                </option>
              ))}
            </select>
            {error && <span className="or-field__error">{error}</span>}
          </div>

          {esReasignacion && (
            <div className="or-field">
              <label className="or-label">Motivo de reasignación</label>
              <textarea
                className="or-textarea"
                value={notas}
                placeholder="Describe el motivo del cambio…"
                onChange={(e) => setNotas(e.target.value)}
                style={{ minHeight: 70 }}
              />
            </div>
          )}
        </div>

        <div className="or-modal__footer">
          <button className="or-btn or-btn--secondary" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="or-btn or-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando…" : esReasignacion ? "Reasignar" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}