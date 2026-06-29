import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useClientes } from "../../hooks/useClientes";
import ClienteForm from "../../components/clientes/ClienteForm";
import HistorialModal from "../../components/clientes/HistorialModal";
import ConfirmDialog from "../../components/clientes/ConfirmDialog";
import "../../pages/clientes/clientes.css";

function fullName(c) {
  return [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
    .filter(Boolean).join(" ");
}
function initials(c) {
  return `${c.primer_nombre?.[0] ?? ""}${c.primer_apellido?.[0] ?? ""}`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", year: "2-digit",
  });
}

export default function ClientesModule() {
  const { user } = useAuth();
  const esAdmin = user?.rol === "admin" || user?.rol === "administrador";

  const { clientes, loading, error, load, add, edit, remove, fetchHistorial } =
    useClientes();

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

  const [formOpen, setFormOpen]             = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [saving, setSaving]                 = useState(false);
  const [toast, setToast]                   = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function openNew()  { setEditingCliente(null); setFormOpen(true); }
  function openEdit(c) { setEditingCliente(c);  setFormOpen(true); }

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (editingCliente) {
        await edit(editingCliente.id, payload);
        showToast("Cliente actualizado correctamente.");
      } else {
        await add(payload);
        showToast("Cliente registrado correctamente.");
      }
      setFormOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al guardar.", "error");
    } finally {
      setSaving(false);
    }
  }

  const [historialCliente, setHistorialCliente] = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [deleting, setDeleting]                 = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      showToast("Cliente eliminado.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al eliminar.", "error");
    } finally {
      setDeleting(false);
    }
  }

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
        <select
          className="cl-filter-select"
          value={filtro}
          onChange={(e) => handleFiltro(e.target.value)}
        >
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

      {/* Tabla */}
      <div className="cl-table-card">
        <table className="cl-table">
          <thead>
            <tr>
              <th style={{ width: "28%" }}>Cliente</th>
              <th style={{ width: "22%" }}>Contacto</th>
              <th style={{ width: "16%" }}>DNI</th>
              <th style={{ width: "14%" }}>Ciudad</th>
              <th style={{ width: "11%" }}>Alta</th>
              <th style={{ width: "9%" }} className="right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>
                  <div className="cl-loading">Cargando clientes…</div>
                </td>
              </tr>
            )}

            {!loading && clientes.length === 0 && (
              <tr>
                <td colSpan={6}>
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
                      <button
                        className="cl-btn cl-btn--primary"
                        style={{ marginTop: 12 }}
                        onClick={openNew}
                      >
                        + Registrar cliente
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!loading && clientes.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="cl-cell-wrap">
                    <div className="cl-avatar">{initials(c)}</div>
                    <div>
                      <div className="cl-name">{fullName(c)}</div>
                      {c.colonia && <div className="cl-sub">{c.colonia}</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cl-name">{c.telefono}</div>
                  <div className="cl-sub">
                    {c.correo ?? <span className="cl-no-correo">Sin correo</span>}
                  </div>
                </td>
                <td className="cl-dni">{c.dni ?? "—"}</td>
                <td>
                  <div className="cl-name">{c.ciudad ?? "—"}</div>
                  <div className="cl-sub">{c.departamento ?? ""}</div>
                </td>
                <td className="cl-fecha">{fmtDate(c.fecha_registro)}</td>
                <td>
                  <div className="cl-actions">
                    <button
                      className="cl-btn cl-btn--ghost"
                      title="Ver historial"
                      onClick={() => setHistorialCliente(c)}
                    >📋</button>
                    <button
                      className="cl-btn cl-btn--ghost"
                      title="Editar"
                      onClick={() => openEdit(c)}
                    >✏️</button>

                    {/* Solo visible para administrador */}
                    {esAdmin && (
                      <button
                        className="cl-btn cl-btn--ghost cl-btn--danger"
                        title="Eliminar (solo admin)"
                        onClick={() => setDeleteTarget(c)}
                      >🗑</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {/* Confirm solo se monta si esAdmin, doble seguro */}
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