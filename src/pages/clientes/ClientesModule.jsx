import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useClientes } from "../../hooks/useClientes";
import ClienteForm from "../../components/clientes/ClienteForm";
import HistorialModal from "../../components/clientes/HistorialModal";
import ConfirmDialog from "../../components/clientes/ConfirmDialog";
import Paginacion from "../../components/clientes/Paginacion";
import "../../pages/clientes/clientes.css";

// ── helpers ────────────────────────────────────────────────────────────────
// El backend devuelve campos aplanados: primer_nombre, primer_apellido,
// colonia, ciudad, departamento — NO como objeto anidado "direcciones"

function fullName(c) {
  return [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
    .filter(Boolean).join(" ");
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", year: "2-digit",
  });
}

// ── Paginación: 8 clientes por página ──────────────────────────────────────
const PAGE_SIZE = 8;

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
  const [pagina, setPagina] = useState(1); // 1-indexado, igual que <Paginacion>

  const totalPaginas = Math.max(1, Math.ceil(clientes.length / PAGE_SIZE));
  const offset        = (pagina - 1) * PAGE_SIZE;
  const pageClientes  = clientes.slice(offset, offset + PAGE_SIZE);

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
        setPagina(1);
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
      const nuevoTotalPaginas = Math.max(1, Math.ceil((clientes.length - 1) / PAGE_SIZE));
      if (pagina > nuevoTotalPaginas) setPagina(nuevoTotalPaginas);
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

      {/* Tabla de clientes */}
      {!loading && clientes.length > 0 && (
        <>
          <div className="cl-table-card">
            <table className="cl-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Ubicación</th>
                  <th>DNI</th>
                  <th>Correo</th>
                  <th>Registro</th>
                  <th className="right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageClientes.map((c) => {
                  // El backend devuelve ciudad/departamento/colonia aplanados
                  const ciudad = [c.ciudad, c.departamento].filter(Boolean).join(", ");

                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="cl-name">{fullName(c)}</div>
                        {c.colonia && <div className="cl-sub">{c.colonia}</div>}
                      </td>
                      <td>{c.telefono || "—"}</td>
                      <td>{ciudad || "—"}</td>
                      <td>{c.dni || "—"}</td>
                      <td>{c.correo || "—"}</td>
                      <td className="cl-fecha">{fmtDate(c.fecha_registro)}</td>
                      <td>
                        <div className="cl-actions">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Paginacion
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            totalClientes={clientes.length}
            onCambiarPagina={setPagina}
          />
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