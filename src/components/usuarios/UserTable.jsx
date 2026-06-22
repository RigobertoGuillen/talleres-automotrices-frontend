import "./usertable.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#EAF3DE", color: "#27500A" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#FAEEDA", color: "#633806" },
];

export default function UserTable({ users, onEdit, onDelete, onToggle }) {
  return (
    <div className="ut-card">
      <table className="ut-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="ut-empty">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
          {users.map((user, i) => {
            const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <tr key={user.id}>
                <td>
                  <span
                    className="ut-avatar"
                    style={{ background: av.bg, color: av.color }}
                    aria-hidden="true"
                  >
                    {getInitials(user.nombre_completo)}
                  </span>
                  {user.nombre_completo}
                </td>
                <td>
                  <span className="ut-rol-badge">{user.rol ?? "—"}</span>
                </td>
                <td>
                  <span className={`ut-pill ${user.activo ? "activo" : "inactivo"}`}>
                    <span className="ut-dot" />
                    {user.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <div className="ut-actions">
                    <button
                      className="ut-btn"
                      onClick={() => onEdit(user)}
                      title="Editar usuario"
                    >
                      <i className="ti ti-edit" aria-hidden="true" /> Editar
                    </button>
                    <button
                      className={`ut-btn ${user.activo ? "toggle-on" : "toggle-off"}`}
                      onClick={() => onToggle(user.id, !user.activo)}
                      title={user.activo ? "Desactivar usuario" : "Activar usuario"}
                    >
                      <i
                        className={`ti ${user.activo ? "ti-toggle-right" : "ti-toggle-left"}`}
                        aria-hidden="true"
                      />
                      {user.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      className="ut-btn danger"
                      onClick={() => onDelete(user.id)}
                      title="Eliminar usuario"
                    >
                      <i className="ti ti-trash" aria-hidden="true" /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}