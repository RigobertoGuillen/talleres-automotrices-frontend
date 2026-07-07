import { useState, useEffect } from "react";
/**
 * PATRÓN STATE — ActualizarEstadoModal
 * Consulta al OrdenContext qué transiciones son válidas.
 * No hay arrays hardcodeados de estados aquí.
 */
import { crearContextoOrden } from "../../pages/ordenes/state/Ordenstate";

/**
 * Modal para actualizar estado (HU-22) y cerrar orden (HU-23).
 * Props: open, onClose, onSave, onCerrar, saving, orden
 */
export default function ActualizarEstadoModal({ open, onClose, onSave, onCerrar, saving, orden }) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [notas, setNotas]                           = useState("");
  const [error, setError]                           = useState("");

  useEffect(() => {
    if (open) { setEstadoSeleccionado(""); setNotas(""); setError(""); }
  }, [open]);

  if (!open || !orden) return null;

  // PATRÓN STATE — crear contexto desde el estado actual de la orden
  const ctx = crearContextoOrden(orden);
  const transicionesValidas = ctx.getTransicionesValidas();

  function handleSubmit() {
    if (!estadoSeleccionado) { setError("Selecciona el nuevo estado"); return; }
    onSave({ estado: estadoSeleccionado, notas: notas.trim() || null });
  }

  function handleCerrar() {
    onCerrar(orden.id);
  }

  return (
    <div className="or-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="or-modal or-modal--sm">
        <div className="or-modal__header">
          <div>
            <h2 className="or-modal__title">
              {ctx.puedeCerrarse() ? "Entregar / Cerrar orden" : "Actualizar estado"}
            </h2>
            <p className="or-modal__desc">Orden #{orden.numero_orden}</p>
          </div>
          <button className="or-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="or-modal__body">
          {/* Estado actual del patrón State */}
          <div style={{
            background: "rgba(108,99,255,0.07)",
            border: "1px solid rgba(108,99,255,0.15)",
            borderRadius: 8, padding: "10px 12px",
          }}>
            <p style={{ fontSize: 12, color: "#7B7A9E", margin: 0 }}>Estado actual</p>
            <p style={{ fontSize: 13, color: "#E8E6FF", margin: "2px 0 0", fontWeight: 500 }}>
              {ctx.getLabel()}
            </p>
            <p style={{ fontSize: 12, color: "#7B7A9E", margin: "2px 0 0" }}>
              {ctx.getDescripcion()}
            </p>
          </div>

          {/* PATRÓN STATE — esFinal() bloquea modificaciones en entregado (HU-23) */}
          {ctx.esFinal() ? (
            <div style={{ textAlign: "center", padding: "1rem", color: "#5A5880", fontSize: 13 }}>
              Esta orden está cerrada y no puede modificarse.
            </div>

          ) : ctx.puedeCerrarse() ? (
            /* PATRÓN STATE — puedeCerrarse() solo es true en EstadoListo (HU-23) */
            <div style={{
              background: "rgba(72,187,120,0.08)",
              border: "1px solid rgba(72,187,120,0.2)",
              borderRadius: 8, padding: "12px",
            }}>
              <p style={{ fontSize: 13, color: "#68D391", margin: "0 0 6px", fontWeight: 500 }}>
                ✓ La orden está lista para entregarse al cliente.
              </p>
              <p style={{ fontSize: 12, color: "#7B7A9E", margin: 0 }}>
                Al cerrarla quedará como "Entregado" y estará disponible para facturación.
                No podrá modificarse después.
              </p>
            </div>

          ) : transicionesValidas.length > 0 ? (
            /* PATRÓN STATE — transicionesValidas del estado concreto actual */
            <>
              <div className="or-field">
                <label className="or-label">Nuevo estado *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {transicionesValidas.map((estadoDestino) => (
                    <label key={estadoDestino.getKey()} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      cursor: "pointer",
                      background: estadoSeleccionado === estadoDestino.getKey()
                        ? "rgba(108,99,255,0.1)" : "#0D0F1A",
                      border: `1px solid ${estadoSeleccionado === estadoDestino.getKey()
                        ? "rgba(108,99,255,0.4)" : "rgba(108,99,255,0.12)"}`,
                      borderRadius: 8, padding: "10px 12px", transition: "all 0.15s",
                    }}>
                      <input type="radio" name="estado"
                        value={estadoDestino.getKey()}
                        checked={estadoSeleccionado === estadoDestino.getKey()}
                        onChange={() => { setEstadoSeleccionado(estadoDestino.getKey()); setError(""); }}
                        style={{ marginTop: 2, accentColor: "#6C63FF" }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#E8E6FF", margin: 0 }}>
                          {estadoDestino.getLabel()}
                        </p>
                        <p style={{ fontSize: 12, color: "#7B7A9E", margin: "2px 0 0" }}>
                          {estadoDestino.getDescripcion()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {error && <span className="or-field__error">{error}</span>}
              </div>

              <div className="or-field">
                <label className="or-label">Notas del avance</label>
                <textarea className="or-textarea" value={notas}
                  placeholder="Describe el avance realizado…"
                  onChange={(e) => setNotas(e.target.value)}
                  style={{ minHeight: 70 }} />
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem", color: "#5A5880", fontSize: 13 }}>
              No hay transiciones disponibles desde este estado.
            </div>
          )}
        </div>

        <div className="or-modal__footer">
          <button className="or-btn or-btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          {/* PATRÓN STATE — puedeCerrarse() muestra botón de cerrar */}
          {ctx.puedeCerrarse() && (
            <button className="or-btn or-btn--warning" onClick={handleCerrar} disabled={saving}>
              {saving ? "Cerrando…" : "Entregar y cerrar"}
            </button>
          )}
          {/* Mostrar botón actualizar solo si hay transiciones disponibles */}
          {!ctx.puedeCerrarse() && !ctx.esFinal() && transicionesValidas.length > 0 && (
            <button className="or-btn or-btn--primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando…" : "Actualizar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}