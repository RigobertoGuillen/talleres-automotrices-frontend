import { useState, useEffect } from "react";

const EMPTY = {
  dni: "", primer_nombre: "", segundo_nombre: "",
  primer_apellido: "", segundo_apellido: "",
  telefono: "", correo: "",
  calle: "", colonia: "", ciudad: "", departamento: "", referencia: "",
};

function fieldFromCliente(c) {
  if (!c) return EMPTY;
  return {
    dni: c.dni ?? "",
    primer_nombre: c.primer_nombre ?? "",
    segundo_nombre: c.segundo_nombre ?? "",
    primer_apellido: c.primer_apellido ?? "",
    segundo_apellido: c.segundo_apellido ?? "",
    telefono: c.telefono ?? "",
    correo: c.correo ?? "",
    calle: c.calle ?? "",
    colonia: c.colonia ?? "",
    ciudad: c.ciudad ?? "",
    departamento: c.departamento ?? "",
    referencia: c.referencia ?? "",
  };
}

export default function ClienteForm({ open, onClose, onSave, cliente, saving }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) { setForm(fieldFromCliente(cliente)); setErrors({}); }
  }, [open, cliente]);

  if (!open) return null;

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  function validate() {
    const e = {};
    if (!form.primer_nombre.trim())   e.primer_nombre   = "Requerido";
    if (!form.primer_apellido.trim()) e.primer_apellido = "Requerido";
    if (!form.segundo_apellido.trim()) e.segundo_apellido = "Requerido";
    if (!form.telefono.trim())        e.telefono        = "Requerido";
    if (form.dni && !/^\d{13}$/.test(form.dni)) e.dni  = "Debe tener 13 dígitos";
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = "Correo inválido";
    if (!form.calle.trim())  e.calle  = "Requerido";
    if (!form.ciudad.trim()) e.ciudad = "Requerido";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      dni: form.dni || null,
      primer_nombre: form.primer_nombre.trim(),
      segundo_nombre: form.segundo_nombre.trim() || null,
      primer_apellido: form.primer_apellido.trim(),
      segundo_apellido: form.segundo_apellido.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim() || null,
      direccion: {
        id: cliente?.direccion_id,
        calle: form.calle.trim(),
        colonia: form.colonia.trim() || "",
        ciudad: form.ciudad.trim(),
        departamento: form.departamento.trim() || "",
        referencia: form.referencia.trim() || null,
      },
    });
  }

  const isEditing = !!cliente;

  return (
    <div className="cl-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cl-modal">

        <div className="cl-modal__header">
          <div>
            <h2 className="cl-modal__title">
              {isEditing ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <p className="cl-modal__desc">
              {isEditing ? "Actualiza la información del cliente." : "Completa los datos del cliente."}
            </p>
          </div>
          <button className="cl-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="cl-modal__body">

          {/* Identificación */}
          <p className="cl-section-label">Identificación</p>
          <div className="cl-row-3">
            <Field label="DNI (13 dígitos)" error={errors.dni}>
              <input className={`cl-input${errors.dni ? " cl-input--error" : ""}`}
                value={form.dni} maxLength={13} placeholder="0801199900000"
                onChange={(e) => set("dni", e.target.value)} />
            </Field>
            <Field label="Primer nombre *" error={errors.primer_nombre}>
              <input className={`cl-input${errors.primer_nombre ? " cl-input--error" : ""}`}
                value={form.primer_nombre} placeholder="Juan"
                onChange={(e) => set("primer_nombre", e.target.value)} />
            </Field>
            <Field label="Segundo nombre" error={errors.segundo_nombre}>
              <input className="cl-input" value={form.segundo_nombre} placeholder="Carlos"
                onChange={(e) => set("segundo_nombre", e.target.value)} />
            </Field>
          </div>

          <div className="cl-row-2">
            <Field label="Primer apellido *" error={errors.primer_apellido}>
              <input className={`cl-input${errors.primer_apellido ? " cl-input--error" : ""}`}
                value={form.primer_apellido} placeholder="García"
                onChange={(e) => set("primer_apellido", e.target.value)} />
            </Field>
            <Field label="Segundo apellido *" error={errors.segundo_apellido}>
              <input className={`cl-input${errors.segundo_apellido ? " cl-input--error" : ""}`}
                value={form.segundo_apellido} placeholder="López"
                onChange={(e) => set("segundo_apellido", e.target.value)} />
            </Field>
          </div>

          <hr className="cl-divider" />

          {/* Contacto */}
          <p className="cl-section-label">Contacto</p>
          <div className="cl-row-2">
            <Field label="Teléfono *" error={errors.telefono}>
              <input className={`cl-input${errors.telefono ? " cl-input--error" : ""}`}
                value={form.telefono} placeholder="+504 9999-9999"
                onChange={(e) => set("telefono", e.target.value)} />
            </Field>
            <Field label="Correo electrónico" error={errors.correo}>
              <input className={`cl-input${errors.correo ? " cl-input--error" : ""}`}
                type="email" value={form.correo} placeholder="juan@correo.com"
                onChange={(e) => set("correo", e.target.value)} />
            </Field>
          </div>

          <hr className="cl-divider" />

          {/* Dirección */}
          <p className="cl-section-label">Dirección</p>
          <div className="cl-row-2">
            <Field label="Calle *" error={errors.calle}>
              <input className={`cl-input${errors.calle ? " cl-input--error" : ""}`}
                value={form.calle} placeholder="Calle El Hatillo 123"
                onChange={(e) => set("calle", e.target.value)} />
            </Field>
            <Field label="Colonia">
              <input className="cl-input" value={form.colonia} placeholder="Lomas del Guijarro"
                onChange={(e) => set("colonia", e.target.value)} />
            </Field>
          </div>
          <div className="cl-row-2">
            <Field label="Ciudad *" error={errors.ciudad}>
              <input className={`cl-input${errors.ciudad ? " cl-input--error" : ""}`}
                value={form.ciudad} placeholder="Tegucigalpa"
                onChange={(e) => set("ciudad", e.target.value)} />
            </Field>
            <Field label="Departamento">
              <input className="cl-input" value={form.departamento} placeholder="Francisco Morazán"
                onChange={(e) => set("departamento", e.target.value)} />
            </Field>
          </div>
          <Field label="Referencia">
            <input className="cl-input" value={form.referencia}
              placeholder="Frente al parque central…"
              onChange={(e) => set("referencia", e.target.value)} />
          </Field>
        </div>

        <div className="cl-modal__footer">
          <button className="cl-btn cl-btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="cl-btn cl-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="cl-field">
      <label className="cl-label">{label}</label>
      {children}
      {error && <span className="cl-field__error">{error}</span>}
    </div>
  );
}