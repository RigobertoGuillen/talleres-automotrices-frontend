import { useState, useEffect } from "react";

const EMPTY = {
  cliente_id: "",
  vehiculo_id: "",
  descripcion_problema: "",
  fecha_ingreso: new Date().toISOString().slice(0, 10),
  prioridad: "0",
};

const PRIORIDADES = [
  { value: "0", label: "Normal" },
  { value: "1", label: "Baja" },
  { value: "2", label: "Media" },
  { value: "3", label: "Alta" },
];

/**
 * Modal para crear una nueva orden de trabajo (HU-19).
 * Props:
 *  - open, onClose, onSave, saving
 *  - clientes: array de clientes para el select
 *  - fetchVehiculos: (clienteId) => Promise<vehiculos[]>
 */
export default function OrdenForm({ open, onClose, onSave, saving, clientes, fetchVehiculos }) {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [vehiculos, setVehiculos] = useState([]);
  const [loadingVeh, setLoadingVeh] = useState(false);

  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}); setVehiculos([]); }
  }, [open]);

  useEffect(() => {
    if (!form.cliente_id) { setVehiculos([]); return; }
    setLoadingVeh(true);
    fetchVehiculos(form.cliente_id)
      .then(setVehiculos)
      .catch(() => setVehiculos([]))
      .finally(() => setLoadingVeh(false));
  }, [form.cliente_id, fetchVehiculos]);

  if (!open) return null;

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  function validate() {
    const e = {};
    if (!form.cliente_id)           e.cliente_id           = "Requerido";
    if (!form.vehiculo_id)          e.vehiculo_id          = "Requerido";
    if (!form.descripcion_problema.trim()) e.descripcion_problema = "Requerido";
    if (!form.fecha_ingreso)        e.fecha_ingreso        = "Requerido";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      vehiculo_id: Number(form.vehiculo_id),
      descripcion_problema: form.descripcion_problema.trim(),
      fecha_ingreso: form.fecha_ingreso,
      prioridad: Number(form.prioridad),
    });
  }

  function fullNameCliente(c) {
    return [c.primer_nombre, c.primer_apellido].filter(Boolean).join(" ");
  }

  return (
    <div className="or-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="or-modal">
        <div className="or-modal__header">
          <div>
            <h2 className="or-modal__title">Nueva orden de trabajo</h2>
            <p className="or-modal__desc">Completa los datos para iniciar el proceso de reparación.</p>
          </div>
          <button className="or-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="or-modal__body">
          {/* Cliente y vehículo */}
          <p className="or-section-label">Cliente y vehículo</p>
          <div className="or-row-2">
            <Field label="Cliente *" error={errors.cliente_id}>
              <select
                className={`or-select${errors.cliente_id ? " or-select--error" : ""}`}
                value={form.cliente_id}
                onChange={(e) => { set("cliente_id", e.target.value); set("vehiculo_id", ""); }}
              >
                <option value="">Seleccionar cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{fullNameCliente(c)} — {c.dni}</option>
                ))}
              </select>
            </Field>
            <Field label="Vehículo *" error={errors.vehiculo_id}>
              <select
                className={`or-select${errors.vehiculo_id ? " or-select--error" : ""}`}
                value={form.vehiculo_id}
                onChange={(e) => set("vehiculo_id", e.target.value)}
                disabled={!form.cliente_id || loadingVeh}
              >
                <option value="">
                  {loadingVeh ? "Cargando…" : !form.cliente_id ? "Primero elige cliente" : "Seleccionar vehículo…"}
                </option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.marca} {v.modelo} {v.anio ?? ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <hr className="or-divider" />

          {/* Detalles */}
          <p className="or-section-label">Detalles de la orden</p>
          <div className="or-row-2">
            <Field label="Fecha de ingreso *" error={errors.fecha_ingreso}>
              <input
                className={`or-input${errors.fecha_ingreso ? " or-input--error" : ""}`}
                type="date"
                value={form.fecha_ingreso}
                onChange={(e) => set("fecha_ingreso", e.target.value)}
              />
            </Field>
            <Field label="Prioridad">
              <select className="or-select" value={form.prioridad}
                onChange={(e) => set("prioridad", e.target.value)}>
                {PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Descripción del problema *" error={errors.descripcion_problema}>
            <textarea
              className={`or-textarea${errors.descripcion_problema ? " or-textarea--error" : ""}`}
              value={form.descripcion_problema}
              placeholder="Describe el problema reportado por el cliente…"
              onChange={(e) => set("descripcion_problema", e.target.value)}
            />
          </Field>
        </div>

        <div className="or-modal__footer">
          <button className="or-btn or-btn--secondary" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="or-btn or-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Creando…" : "Crear orden"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="or-field">
      <label className="or-label">{label}</label>
      {children}
      {error && <span className="or-field__error">{error}</span>}
    </div>
  );
}