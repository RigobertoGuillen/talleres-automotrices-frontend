import { useState, useEffect } from "react";

/**
 * PATRÓN STATE — uso en ActualizarEstadoModal
 * --------------------------------------------
 * En lugar de definir manualmente qué estados están disponibles
 * con un objeto hardcodeado, importamos OrdenContext.
 * El modal pregunta al contexto qué transiciones son válidas
 * desde el estado actual, y OrdenContext delega esa consulta
 * al estado concreto correspondiente.
 *
 * Ventaja: si las reglas de transición cambian (ej. ahora
 * Completado también puede volver a Reparación), solo se
 * modifica EstadoCompletado.getTransicionesValidas() en OrdenState.js,
 * sin tocar este modal ni ningún otro componente.
 */
import { crearContextoOrden } from "../../pages/ordenes/state/OrdenState";

/**
 * Modal para actualizar estado de una orden (HU-22) y cerrarla (HU-23).
 * Props:
 *  - open, onClose, onSave, saving
 *  - orden: orden actual
 */
export default function ActualizarEstadoModal({ open, onClose, onSave, saving, orden }) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [notas, setNotas]                           = useState("");
  const [error, setError]                           = useState("");

  useEffect(() => {
    if (open) { setEstadoSeleccionado(""); setNotas(""); setError(""); }
  }, [open]);

  if (!open || !orden) return null;

  /**
   * PATRÓN STATE — crearContextoOrden crea un OrdenContext
   * que internamente resuelve qué clase de estado concreto
   * corresponde a orden.estado y delega todas las consultas a ella.
   */
  const ctx = crearContextoOrden(orden);

  /**
   * PATRÓN STATE — getTransicionesValidas() devuelve la lista
   * de estados destino permitidos según el estado concreto actual.
   * Cada clase de estado concreto define sus propias transiciones,
   * sin if/else en este componente.
   */
  const transicionesValidas = ctx.getTransicionesValidas();

  /**
   * PATRÓN STATE — puedeCerrarse() está definido en EstadoCompletado
   * como true y en todos los demás como false.
   * Esto garantiza HU-23: "solo órdenes completadas pueden cerrarse".
   */
  const esCierre = estadoSeleccionado === "cerrado" && ctx.puedeCerrarse();

  function handleSubmit() {
    if (!estadoSeleccionado) { setError("Selecciona el nuevo estado"); return; }
    onSave({ estado: estadoSeleccionado, notas: notas.trim() || null });
  }

  return (
    <div className="or-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="or-modal or-modal--sm">
        <div className="or-modal__header">
          <div>
            <h2 className="or-modal__title">
              {esCierre ? "Cerrar orden" : "Actualizar estado"}
            </h2>
            <p className="or-modal__desc">Orden #{orden.numero_orden}</p>
          </div>
          <button className="or-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="or-modal__body">
          {/* Estado actual — obtenido del contexto, no de un string hardcodeado */}
          <div style={{
            background: "rgba(108,99,255,0.07)",
            border: "1px solid rgba(108,99,255,0.15)",
            borderRadius: 8, padding: "10px 12px",
          }}>
            <p style={{ fontSize: 12, color: "#7B7A9E", margin: 0 }}>Estado actual</p>
            {/**
              * PATRÓN STATE — getLabel() y getDescripcion() son métodos
              * del estado concreto actual, no strings definidos aquí.
              */}
            <p style={{ fontSize: 13, color: "#E8E6FF", margin: "2px 0 0", fontWeight: 500 }}>
              {ctx.getLabel()}
            </p>
            <p style={{ fontSize: 12, color: "#7B7A9E", margin: "2px 0 0" }}>
              {ctx.getDescripcion()}
            </p>
          </div>

          {/**
            * PATRÓN STATE — esFinal() está definido en EstadoCerrado
            * y EstadoCancelado como true. Cuando es true, el modal
            * muestra un mensaje bloqueante y oculta las opciones.
            * Esto implementa HU-23: "debe impedir modificaciones posteriores".
            */}
          {ctx.esFinal() ? (
            <div style={{ textAlign: "center", padding: "1rem", color: "#5A5880", fontSize: 13 }}>
              Esta orden está en un estado final y no puede modificarse.
            </div>
          ) : transicionesValidas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1rem", color: "#5A5880", fontSize: 13 }}>
              No hay transiciones disponibles desde este estado.
            </div>
          ) : (
            <>
              <div className="or-field">
                <label className="or-label">Nuevo estado *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/**
                    * PATRÓN STATE — iteramos las transicionesValidas que devuelve
                    * el estado concreto actual. Cada elemento es una instancia
                    * de otro estado concreto, con su propia label y descripción.
                    * No hay arrays hardcodeados aquí — todo viene del patrón State.
                    */}
                  {transicionesValidas.map((estadoDestino) => (
                    <label
                      key={estadoDestino.getKey()}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        cursor: "pointer",
                        background: estadoSeleccionado === estadoDestino.getKey()
                          ? "rgba(108,99,255,0.1)" : "#0D0F1A",
                        border: `1px solid ${estadoSeleccionado === estadoDestino.getKey()
                          ? "rgba(108,99,255,0.4)" : "rgba(108,99,255,0.12)"}`,
                        borderRadius: 8, padding: "10px 12px", transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="estado"
                        value={estadoDestino.getKey()}
                        checked={estadoSeleccionado === estadoDestino.getKey()}
                        onChange={() => { setEstadoSeleccionado(estadoDestino.getKey()); setError(""); }}
                        style={{ marginTop: 2, accentColor: "#6C63FF" }}
                      />
                      <div>
                        {/* getLabel() y getDescripcion() del estado destino */}
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
                <label className="or-label">
                  {esCierre ? "Notas de cierre" : "Notas del avance"}
                </label>
                <textarea
                  className="or-textarea"
                  value={notas}
                  placeholder={esCierre
                    ? "Observaciones finales de la orden…"
                    : "Describe el avance realizado…"}
                  onChange={(e) => setNotas(e.target.value)}
                  style={{ minHeight: 70 }}
                />
              </div>

              {/**
                * PATRÓN STATE — puedeCerrarse() es true únicamente
                * en EstadoCompletado, garantizando HU-23 sin ningún
                * if (orden.estado === "completado") en este componente.
                */}
              {esCierre && (
                <div style={{
                  background: "rgba(72,187,120,0.08)",
                  border: "1px solid rgba(72,187,120,0.2)",
                  borderRadius: 8, padding: "10px 12px",
                }}>
                  <p style={{ fontSize: 12, color: "#68D391", margin: 0 }}>
                    ✓ Al cerrar la orden quedará disponible para facturación
                    y no podrá modificarse nuevamente.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="or-modal__footer">
          <button className="or-btn or-btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          {!ctx.esFinal() && transicionesValidas.length > 0 && (
            <button
              className={`or-btn ${esCierre ? "or-btn--warning" : "or-btn--primary"}`}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Guardando…" : esCierre ? "Cerrar orden" : "Actualizar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}