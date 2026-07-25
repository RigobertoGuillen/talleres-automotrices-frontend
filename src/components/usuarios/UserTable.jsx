import { useState, useEffect } from "react";
import Paginacion from "../../components/clientes/Paginacion";
import "./usertable.css";

const PAGE_SIZE = 8;

export default function UserTable({ users, onEdit, onDelete, onToggle, hayFiltro = false }) {
  const [pagina, setPagina] = useState(1); // 1-indexado, igual que <Paginacion>

  const totalPaginas = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const offset       = (pagina - 1) * PAGE_SIZE;
  const pageUsers    = users.slice(offset, offset + PAGE_SIZE);

  useEffect(() => { setPagina(1); }, [users.length, hayFiltro]);

  const handlePageChange = (p) => {
    setPagina(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (users.length === 0) {
    return (
      <div className="ut-empty-state">
        <div className="ut-empty-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <p className="ut-empty-title">{hayFiltro ? "Sin resultados" : "No hay usuarios registrados"}</p>
        <p className="ut-empty-desc">
          {hayFiltro ? "Intenta con otro nombre o nombre de usuario." : "Agrega el primer usuario para comenzar."}
        </p>
      </div>
    );
  }

  return (
    <div className="ut-wrap">
      <div className="ut-table-card">
        <table className="ut-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageUsers.map((user) => (
              <tr key={user.id}>
                <td className="ut-name">{user.nombre_completo || "—"}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        totalClientes={users.length}
        onCambiarPagina={handlePageChange}
        entidad="usuario"
      />
    </div>
  );
}