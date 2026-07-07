/**
 * SRP — ClienteForm tiene una sola responsabilidad:
 * renderizar el formulario de crear/editar cliente
 * con todos los campos de la BD de Honduras.
 */
import { useState, useEffect } from "react";
import {
  validarTelefonoHN,
  validarIdentidadHN,
  formatearTelefonoHN,
} from "../../pages/clientes/validators/ClienteValidators";

const EMPTY = {
  dni: "",
  primer_nombre: "",
  segundo_nombre: "",
  primer_apellido: "",
  segundo_apellido: "",
  telefono: "",
  correo: "",
  calle: "",
  colonia: "",
  ciudad: "",
  departamento: "",
  referencia: "",
};

function fieldFromCliente(c) {
  if (!c) return EMPTY;
  return {
    dni:            c.dni            ?? "",
    primer_nombre:  c.primer_nombre  ?? "",
    segundo_nombre: c.segundo_nombre ?? "",
    primer_apellido:  c.primer_apellido  ?? "",
    segundo_apellido: c.segundo_apellido ?? "",
    telefono:  c.telefono  ?? "",
    correo:    c.correo    ?? "",
    calle:     c.calle       ?? "",
    colonia:   c.colonia     ?? "",
    ciudad:    c.ciudad      ?? "",
    departamento: c.departamento ?? "",
    referencia:   c.referencia   ?? "",
  };
}

/**
 * Props:
 *  - open, onClose, onSave, saving
 *  - cliente: objeto | null (null = crear nuevo)
 */
export default function ClienteForm({ open, onClose, onSave, saving, cliente }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) { setForm(fieldFromCliente(cliente)); setErrors({}); }
  }, [open, cliente]);

  if (!open) return null;

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  function validate() {
    const e = {};

    // DNI hondureño — 13 dígitos obligatorio
    const vDni = validarIdentidadHN(form.dni);
    if (!vDni.valid) e.dni = vDni.message;

    // Nombres y apellidos
    if (!form.primer_nombre.trim())   e.primer_nombre   = "Requerido";
    if (!form.primer_apellido.trim()) e.primer_apellido = "Requerido";
    if (!form.segundo_apellido.trim()) e.segundo_apellido = "Requerido";

    // Teléfono hondureño
    const vTel = validarTelefonoHN(form.telefono);
    if (!vTel.valid) e.telefono = vTel.message;

    // Correo opcional
    if (form.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      e.correo = "Correo electrónico inválido";
    }

    // Dirección — calle y ciudad obligatorias
    if (!form.calle.trim())  e.calle  = "Requerido";
    if (!form.ciudad.trim()) e.ciudad = "Requerido";

    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    onSave({
      dni:              form.dni.trim(),
      primer_nombre:    form.primer_nombre.trim(),
      segundo_nombre:   form.segundo_nombre.trim() || null,
      primer_apellido:  form.primer_apellido.trim(),
      segundo_apellido: form.segundo_apellido.trim(),
      telefono:         formatearTelefonoHN(form.telefono.trim()),
      correo:           form.correo.trim() || null,
      direccion: {
        calle:        form.calle.trim(),
        colonia:      form.colonia.trim()      || "",
        ciudad:       form.ciudad.trim(),
        departamento: form.departamento.trim() || "",
        referencia:   form.referencia.trim()   || null,
      },
    });
  }

  const isEditing = !!cliente;

  return (
    <div className="cl-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cl-modal" style={{ width: "min(580px, 96vw)" }}>
        <div className="cl-modal__header">
          <div>
            <h2 className="cl-modal__title">
              {isEditing ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <p className="cl-modal__desc">
              {isEditing
                ? "Actualiza los datos del cliente."
                : "Registra un nuevo cliente en el sistema."}
            </p>
          </div>
          <button className="cl-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="cl-modal__body">

          {/* ── Identificación ── */}
          <p className="cl-section-label">Identificación</p>

          <Field label="DNI (13 dígitos) *" error={errors.dni}
            hint="Cédula de identidad hondureña">
            <input
              className={`cl-input${errors.dni ? " cl-input--error" : ""}`}
              value={form.dni}
              placeholder="0801199900000"
              maxLength={13}
              onChange={(e) => set("dni", e.target.value.replace(/\D/g, ""))}
            />
          </Field>

          <div className="cl-row-3">
            <Field label="Primer nombre *" error={errors.primer_nombre}>
              <input
                className={`cl-input${errors.primer_nombre ? " cl-input--error" : ""}`}
                value={form.primer_nombre}
                placeholder="Juan"
                onChange={(e) => set("primer_nombre", e.target.value)}
              />
            </Field>
            <Field label="Segundo nombre" error={errors.segundo_nombre}>
              <input
                className="cl-input"
                value={form.segundo_nombre}
                placeholder="Carlos"
                onChange={(e) => set("segundo_nombre", e.target.value)}
              />
            </Field>
            <Field label="" error={null}>
              {/* spacer */}
              <div style={{ height: 38 }} />
            </Field>
          </div>

          <div className="cl-row-2">
            <Field label="Primer apellido *" error={errors.primer_apellido}>
              <input
                className={`cl-input${errors.primer_apellido ? " cl-input--error" : ""}`}
                value={form.primer_apellido}
                placeholder="García"
                onChange={(e) => set("primer_apellido", e.target.value)}
              />
            </Field>
            <Field label="Segundo apellido *" error={errors.segundo_apellido}>
              <input
                className={`cl-input${errors.segundo_apellido ? " cl-input--error" : ""}`}
                value={form.segundo_apellido}
                placeholder="López"
                onChange={(e) => set("segundo_apellido", e.target.value)}
              />
            </Field>
          </div>

          <hr className="cl-divider" />

          {/* ── Contacto ── */}
          <p className="cl-section-label">Contacto</p>

          <div className="cl-row-2">
            <Field label="Teléfono * (HN)" error={errors.telefono}
              hint="Ej. 9999-9999">
              <input
                className={`cl-input${errors.telefono ? " cl-input--error" : ""}`}
                value={form.telefono}
                placeholder="9999-9999"
                maxLength={9}
                onChange={(e) => set("telefono", e.target.value)}
              />
            </Field>
            <Field label="Correo electrónico" error={errors.correo}>
              <input
                className={`cl-input${errors.correo ? " cl-input--error" : ""}`}
                type="email"
                value={form.correo}
                placeholder="juan@correo.com"
                onChange={(e) => set("correo", e.target.value)}
              />
            </Field>
          </div>

          <hr className="cl-divider" />

          {/* ── Dirección ── */}
          <p className="cl-section-label">Dirección</p>

          <div className="cl-row-2">
            <Field label="Calle *" error={errors.calle}>
              <input
                className={`cl-input${errors.calle ? " cl-input--error" : ""}`}
                value={form.calle}
                placeholder="Col. Kennedy, Blvd. Morazán"
                onChange={(e) => set("calle", e.target.value)}
              />
            </Field>
            <Field label="Colonia / Barrio">
              <input
                className="cl-input"
                value={form.colonia}
                placeholder="Kennedy"
                onChange={(e) => set("colonia", e.target.value)}
              />
            </Field>
          </div>

          <div className="cl-row-2">
            <Field label="Ciudad *" error={errors.ciudad}>
              <input
                className={`cl-input${errors.ciudad ? " cl-input--error" : ""}`}
                value={form.ciudad}
                placeholder="Tegucigalpa"
                onChange={(e) => set("ciudad", e.target.value)}
              />
            </Field>
            <Field label="Departamento">
              <input
                className="cl-input"
                value={form.departamento}
                placeholder="Francisco Morazán"
                onChange={(e) => set("departamento", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Referencia">
            <input
              className="cl-input"
              value={form.referencia}
              placeholder="Frente al parque central…"
              onChange={(e) => set("referencia", e.target.value)}
            />
          </Field>

        </div>

        <div className="cl-modal__footer">
          <button className="cl-btn cl-btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="cl-btn cl-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Registrar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div className="cl-field">
      {label && <label className="cl-label">{label}</label>}
      {children}
      {hint && !error && <span style={{ fontSize: 11, color: "#5A5880" }}>{hint}</span>}
      {error && <span className="cl-field__error">{error}</span>}
    </div>
  );
}