import { useState } from "react";
import "./userform.css";

const ROLES = [
  { id: "1", nombre: "Administrador", desc: "Acceso total", icon: "ti-shield-check" },
  { id: "2", nombre: "Mecánico",       desc: "Órdenes de trabajo", icon: "ti-tool"         },
  { id: "3", nombre: "Recepcionista",  desc: "Atención al cliente", icon: "ti-headset"      },
];

export default function UserForm({ onSave, initial, onCancel }) {
  const [form, setForm] = useState(
    initial ?? { nombre_completo: "", nombre_usuario: "", correo: "", contrasena: "", rol_id: "" }
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="uf-card">
      <p className="uf-section-label">
        {initial ? "Editar usuario" : "Nuevo usuario"}
      </p>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="uf-grid">
          <div className="uf-group">
            <label htmlFor="nombre_completo">Nombre completo</label>
            <input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              placeholder="Ej. María López"
              value={form.nombre_completo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="uf-group">
            <label htmlFor="nombre_usuario">Usuario</label>
            <input
              id="nombre_usuario"
              name="nombre_usuario"
              type="text"
              placeholder="Ej. mlopez"
              value={form.nombre_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="uf-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="uf-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={handleChange}
              required={!initial}
            />
          </div>

          <div className="uf-group uf-full">
            <label>Rol</label>
            <div className="uf-role-grid">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`uf-role-card${form.rol_id === r.id ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, rol_id: r.id })}
                >
                  <i className={`ti ${r.icon} uf-role-icon`} aria-hidden="true" />
                  <span>
                    <span className="uf-role-name">{r.nombre}</span>
                    <span className="uf-role-desc">{r.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            {/* campo oculto para validación nativa */}
            <input
              type="text"
              name="rol_id"
              value={form.rol_id}
              onChange={() => {}}
              required
              style={{ opacity: 0, height: 0, position: "absolute", pointerEvents: "none" }}
              tabIndex={-1}
            />
          </div>
        </div>

        <div className="uf-actions">
          {onCancel && (
            <button type="button" className="uf-btn" onClick={onCancel}>
              <i className="ti ti-x" aria-hidden="true" /> Cancelar
            </button>
          )}
          <button type="submit" className="uf-btn uf-btn-primary">
            <i className="ti ti-check" aria-hidden="true" /> Guardar usuario
          </button>
        </div>
      </form>
    </div>
  );
}