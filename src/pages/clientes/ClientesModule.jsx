import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useClientes } from "../../hooks/useClientes";
import ClienteForm from "../../components/clientes/ClienteForm";
import HistorialModal from "../../components/clientes/HistorialModal";
import ConfirmDialog from "../../components/clientes/ConfirmDialog";
import "../../pages/clientes/clientes.css";

// ── helpers ────────────────────────────────────────────────────────────────
// El backend devuelve campos aplanados: primer_nombre, primer_apellido,
// colonia, ciudad, departamento — NO como objeto anidado "direcciones"
 
function fullName(c) {
  return [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
    .filter(Boolean).join(" ");
}
 
function initials(c) {
  return `${c.primer_nombre?.[0] ?? ""}${c.primer_apellido?.[0] ?? ""}`.toUpperCase();
}
 
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", year: "2-digit",
  });
}
 
// ── Colores rotativos de avatares ──────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "rgba(108,99,255,0.18)", color: "#9B8FFF" },
  { bg: "rgba(99,179,237,0.18)", color: "#63B3ED" },
  { bg: "rgba(72,187,120,0.18)", color: "#68D391" },
  { bg: "rgba(246,173,85,0.18)", color: "#F6AD55" },
];
 
// ── Paginación variable: primera página 20, resto 10 ──────────────────────
const PAGE_SIZES = [20, 10];
 
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
 
// ── Componente principal ───────────────────────────────────────────────────
export default function ClientesModule() {
  const { user } = useAuth();
  const esAdmin = user?.rol === "admin" || user?.rol === "administrador";
 
  const { clientes, loading, error, load, add, edit, remove, fetchHistorial } =
    useClientes();
 
  // ── Búsqueda y filtros ────────────────────────────────────────────────────
  const [query, setQuery]   = useState("");
  const [filtro, setFiltro] = useState("");
  const debounceRef = useRef(null);
 
  function handleSearch(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(val, filtro), 350);
  }
 
  function handleFiltro(val) {
    setFiltro(val);
    load(query, val);
  }
 
  // ── Modales ───────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen]             = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [saving, setSaving]                 = useState(false);
  const [toast, setToast]                   = useState(null);
  const [historialCliente, setHistorialCliente] = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleting, setDeleting]             = useState(false);
 
  // ── Paginación ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
 
  const pageSizes    = getPageSizes(clientes.length);
  const totalPages   = pageSizes.length;
  const offset       = pageSizes.slice(0, page).reduce((a, b) => a + b, 0);
  const pageClientes = clientes.slice(offset, offset + (pageSizes[page] ?? 10));
 
  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }
 
  function openNew()   { setEditingCliente(null); setFormOpen(true); }
  function openEdit(c) { setEditingCliente(c);    setFormOpen(true); }
 
  // ── Guardar ───────────────────────────────────────────────────────────────
  async function handleSave(payload) {
    setSaving(true);
    try {
      if (editingCliente) {
        await edit(editingCliente.id, payload);
        showToast("Cliente actualizado correctamente.");
      } else {
        await add(payload);
        showToast("Cliente registrado correctamente.");
        setPage(0);
      }
      setFormOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al guardar.", "error");
    } finally {
      setSaving(false);
    }
  }
 
  // ── Eliminar ──────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      showToast("Cliente eliminado.");
      setDeleteTarget(null);
      const newSizes = getPageSizes(clientes.length - 1);
      if (page >= newSizes.length) setPage(Math.max(0, newSizes.length - 1));
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al eliminar.", "error");
    } finally {
      setDeleting(false);
    }
  }
 
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cl-page">
 
      {/* Header */}
      <div className="cl-header">
        <div className="cl-header__left">
          <h1>Clientes</h1>
          <p>Directorio de clientes del taller</p>
        </div>
        <button className="cl-btn cl-btn--primary" onClick={openNew}>
          + Nuevo cliente
        </button>
      </div>
 
      {/* Filtros */}
      <div className="cl-filters">
        <div className="cl-search-wrap">
          <span className="cl-search-icon">🔍</span>
          <input
            className="cl-search-input"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nombre, DNI, correo…"
          />
        </div>
        <select className="cl-filter-select" value={filtro}
          onChange={(e) => handleFiltro(e.target.value)}>
          <option value="">Todos los registros</option>
          <option value="reciente">Registrados este mes</option>
          <option value="con-correo">Con correo</option>
          <option value="sin-correo">Sin correo</option>
        </select>
        <span className="cl-count">
          {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </span>
      </div>
 
      {/* Error */}
      {error && <div className="cl-error">⚠ {error}</div>}
 
      {/* Loading */}
      {loading && <div className="cl-loading">Cargando clientes…</div>}
 
      {/* Estado vacío */}
      {!loading && clientes.length === 0 && (
        <div className="cl-empty">
          <span className="cl-empty__icon">👥</span>
          <p className="cl-empty__title">
            {query || filtro ? "Sin resultados" : "Sin clientes registrados"}
          </p>
          <p className="cl-empty__desc">
            {query || filtro
              ? "Intenta con otro criterio de búsqueda."
              : "Comienza registrando el primer cliente."}
          </p>
          {!query && !filtro && (
            <button className="cl-btn cl-btn--primary"
              style={{ marginTop: 12 }} onClick={openNew}>
              + Registrar cliente
            </button>
          )}
        </div>
      )}
 
      {/* Grid de tarjetas */}
      {!loading && clientes.length > 0 && (
        <>
          <div className="cl-page-info">
            <span>
              Mostrando <strong>{pageClientes.length}</strong> de{" "}
              <strong>{clientes.length}</strong> clientes
            </span>
            {totalPages > 1 && (
              <span className="cl-page-badge">
                Página {page + 1} de {totalPages}
              </span>
            )}
          </div>
 
          <div className="cl-cards-grid">
            {pageClientes.map((c, i) => {
              const av = AVATAR_COLORS[(offset + i) % AVATAR_COLORS.length];
              // El backend devuelve ciudad/departamento/colonia aplanados
              const ciudad = [c.ciudad, c.departamento].filter(Boolean).join(", ");
 
              return (
                <div key={c.id} className="cl-client-card">
                  <div className="cl-client-card__top">
                    <div className="cl-avatar cl-avatar--lg"
                      style={{ background: av.bg, color: av.color }}>
                      {initials(c)}
                    </div>
                    <div className="cl-client-card__actions">
                      <button className="cl-btn cl-btn--ghost" title="Ver historial"
                        onClick={() => setHistorialCliente(c)}>📋</button>
                      <button className="cl-btn cl-btn--ghost" title="Editar"
                        onClick={() => openEdit(c)}>✏️</button>
                      {esAdmin && (
                        <button className="cl-btn cl-btn--ghost cl-btn--danger"
                          title="Eliminar (solo admin)"
                          onClick={() => setDeleteTarget(c)}>🗑</button>
                      )}
                    </div>
                  </div>
 
                  <div className="cl-client-card__body">
                    {/* Nombre completo desde campos separados */}
                    <p className="cl-client-card__name">{fullName(c)}</p>
                    {/* Colonia aplanada directamente del backend */}
                    {c.colonia && <p className="cl-sub">{c.colonia}</p>}
                  </div>
 
                  <div className="cl-client-card__info">
                    {c.telefono && (
                      <span className="cl-chip">📞 {c.telefono}</span>
                    )}
                    {ciudad && (
                      <span className="cl-chip">📍 {ciudad}</span>
                    )}
                    {c.dni && (
                      <span className="cl-chip">🪪 {c.dni}</span>
                    )}
                    {c.correo ? (
                      <span className="cl-chip">✉ {c.correo}</span>
                    ) : (
                      <span className="cl-chip cl-chip--muted">Sin correo</span>
                    )}
                    <span className="cl-chip">📅 {fmtDate(c.fecha_registro)}</span>
                  </div>
                </div>
              );
            })}
          </div>
 
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="cl-pagination">
              <button className="cl-page-btn" disabled={page === 0}
                onClick={() => setPage(page - 1)}>
                ← Anterior
              </button>
              <div className="cl-page-numbers">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button key={idx}
                    className={`cl-page-num ${idx === page ? "cl-page-num--active" : ""}`}
                    onClick={() => setPage(idx)}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button className="cl-page-btn" disabled={page === totalPages - 1}
                onClick={() => setPage(page + 1)}>
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
 
      {/* Modales */}
      <ClienteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        cliente={editingCliente}
        saving={saving}
      />
 
      <HistorialModal
        open={!!historialCliente}
        onClose={() => setHistorialCliente(null)}
        cliente={historialCliente}
        fetchHistorial={fetchHistorial}
      />
 
      {esAdmin && (
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Eliminar cliente"
          description={
            deleteTarget
              ? `¿Eliminar a ${fullName(deleteTarget)}? Esta acción no se puede deshacer.`
              : ""
          }
          confirmLabel="Eliminar"
        />
      )}
 
      {toast && (
        <div className={`cl-toast cl-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}