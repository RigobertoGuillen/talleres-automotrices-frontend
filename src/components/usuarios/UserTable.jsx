import { useState } from "react";
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
  { bg: "rgba(108,99,255,0.18)", color: "#9B8FFF" },
  { bg: "rgba(99,179,237,0.18)", color: "#63B3ED" },
  { bg: "rgba(72,187,120,0.18)", color: "#68D391" },
  { bg: "rgba(246,173,85,0.18)", color: "#F6AD55" },
];

const PAGE_SIZES = [20, 10]; // primera página 20, resto 10

function getPageSizes(total) {
  if (total === 0) return [];
  const sizes = [];
  let remaining = total;
  let first = true;
  while (remaining > 0) {
    const size = first ? PAGE_SIZES[0] : PAGE_SIZES[1];
    sizes.push(Math.min(size, remaining));
    remaining -= size;
    first = false;
  }
  return sizes;
}

export default function UserTable({ users, onEdit, onDelete, onToggle }) {
  const [page, setPage] = useState(0);

  const pageSizes = getPageSizes(users.length);
  const totalPages = pageSizes.length;

  // Calcular offset de la página actual
  const offset = pageSizes.slice(0, page).reduce((a, b) => a + b, 0);
  const pageUsers = users.slice(offset, offset + (pageSizes[page] ?? 10));

  // Resetear página si cambian los usuarios
  const handlePageChange = (p) => {
    setPage(p);
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
        <p className="ut-empty-title">No hay usuarios registrados</p>
        <p className="ut-empty-desc">Agrega el primer usuario para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="ut-grid-wrap">
      {/* Contador de página */}
      <div className="ut-page-info">
        <span>Mostrando <strong>{pageUsers.length}</strong> de <strong>{users.length}</strong> usuarios</span>
        <span className="ut-page-badge">Página {page + 1} de {totalPages}</span>
      </div>

      {/* Grid de tarjetas */}
      <div className="ut-grid">
        {pageUsers.map((user, i) => {
          const av = AVATAR_COLORS[(offset + i) % AVATAR_COLORS.length];
          return (
            <div key={user.id} className="ut-user-card">
              <div className="ut-user-card__top">
                <span
                  className="ut-avatar-lg"
                  style={{ background: av.bg, color: av.color }}
                  aria-hidden="true"
                >
                  {getInitials(user.nombre_completo)}
                </span>
                <span className={`ut-pill ${user.activo ? "activo" : "inactivo"}`}>
                  <span className="ut-dot" />
                  {user.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="ut-user-card__body">
                <p className="ut-user-card__name">{user.nombre_completo || "—"}</p>
                <span className="ut-rol-badge">{user.rol ?? "—"}</span>
              </div>

              <div className="ut-user-card__actions">
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
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="ut-pagination">
          <button
            className="ut-page-btn"
            disabled={page === 0}
            onClick={() => handlePageChange(page - 1)}
          >
            ← Anterior
          </button>

          <div className="ut-page-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`ut-page-num ${i === page ? "ut-page-num--active" : ""}`}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className="ut-page-btn"
            disabled={page === totalPages - 1}
            onClick={() => handlePageChange(page + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
