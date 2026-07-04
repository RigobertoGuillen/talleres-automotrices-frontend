import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOrdenes } from "../../hooks/useOrdenes";
import OrdenForm from "../../components/ordenes/OrdenForm";
import AsignarMecanicoModal from "../../components/ordenes/AsignarMecanicoModal";
import ActualizarEstadoModal from "../../components/ordenes/ActualizarEstadoModal";
import OrdenDetalleModal from "../../components/ordenes/OrdenDetalleModal";
import { crearContextoOrden } from "../../pages/ordenes/state/OrdenState";
import "../../pages/ordenes/ordenes.css";

// ── helpers ────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", year: "2-digit",
  });
}

const PRIORIDAD_LABEL = { 0: "Normal", 1: "Baja", 2: "Media", 3: "Alta" };
const PRIORIDAD_CLASS = {
  0: "or-prioridad--0", 1: "or-prioridad--1",
  2: "or-prioridad--2", 3: "or-prioridad--3",
};

export default function OrdenesModule() {
  const { user } = useAuth();
  const {
    ordenes, mecanicos, clientes, loading, error,
    load, add, asignar, updateEstado, cerrar, reasignar,
    fetchDetalle, fetchVehiculos,
    esMecanico, esAdmin, esRecepcionista,
  } = useOrdenes(user);

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [query, setQuery]           = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const debounceRef = useRef(null);

  function handleSearch(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load({ estado: filtroEstado }), 350);
  }

  function handleFiltroEstado(val) {
    setFiltroEstado(val);
    load({ estado: val });
  }

  // Filtro local por texto
  const filtradas = ordenes.filter((o) => {
    if (!query) return true;
    const hay = [o.numero_orden, o.cliente_nombre, o.placa, o.mecanico_nombre]
      .filter(Boolean).join(" ").toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  // ── Modales ──────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [detalleOrden, setDetalleOrden] = useState(null);
  const [asignarOrden, setAsignarOrden] = useState(null);
  const [reasignarOrden, setReasignarOrden] = useState(null);
  const [estadoOrden, setEstadoOrden]   = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleCrear(payload) {
    setSaving(true);
    try {
      await add(payload);
      showToast("Orden de trabajo creada.");
      setFormOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message ?? "Error al crear.", "error");
    } finally { setSaving(false); }
  }

  async function handleAsignar(payload) {
    setSaving(true);
    try {
      await asignar(asignarOrden.id, payload.mecanico_id);
      showToast("Mecánico asignado correctamente.");
      setAsignarOrden(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? "Error al asignar.", "error");
    } finally { setSaving(false); }
  }

  async function handleReasignar(payload) {
    setSaving(true);
    try {
      await reasignar(reasignarOrden.id, payload.mecanico_id);
      showToast("Mecánico reasignado correctamente.");
      setReasignarOrden(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? "Error al reasignar.", "error");
    } finally { setSaving(false); }
  }

  async function handleEstado(payload) {
    setSaving(true);
    try {
      await updateEstado(estadoOrden.id, payload);
      showToast("Estado actualizado.");
      setEstadoOrden(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? "Error al actualizar.", "error");
    } finally { setSaving(false); }
  }

  async function handleCerrar(id) {
    setSaving(true);
    try {
      await cerrar(id);
      showToast("Orden cerrada y disponible para facturación.");
      setEstadoOrden(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? "Error al cerrar.", "error");
    } finally { setSaving(false); }
  }

  // ── Acciones por fila usando patrón State ─────────────────────────────────
  function renderAcciones(o) {
    /**
     * PATRÓN STATE — OrdenContext decide qué botones mostrar
     * según el estado concreto de cada orden.
     */
    const ctx = crearContextoOrden(o);

    return (
      <div className="or-actions">
        {/* Ver detalle — todos los roles */}
        <button className="or-btn or-btn--ghost" title="Ver detalle"
          onClick={() => setDetalleOrden(o)}>🔍</button>

        {/* PATRÓN STATE — puedeAsignarMecanico() solo true en EstadoRecibido */}
        {esAdmin && !o.mecanico_id && ctx.puedeAsignarMecanico() && (
          <button className="or-btn or-btn--ghost" title="Asignar mecánico"
            onClick={() => setAsignarOrden(o)}>👤</button>
        )}

        {/* PATRÓN STATE — puedeReasignar() true en Recibido y EnReparacion */}
        {esAdmin && o.mecanico_id && ctx.puedeReasignar() && (
          <button className="or-btn or-btn--ghost" title="Reasignar mecánico"
            onClick={() => setReasignarOrden(o)}>🔄</button>
        )}

        {/* PATRÓN STATE — puedeActualizarEstado() false en Entregado (HU-23) */}
        {(esMecanico || esAdmin) && (ctx.puedeActualizarEstado() || ctx.puedeCerrarse()) && (
          <button className="or-btn or-btn--ghost" title="Actualizar estado"
            onClick={() => setEstadoOrden(o)}>✏️</button>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="or-page">

      <div className="or-header">
        <div className="or-header__left">
          <h1>{esMecanico ? "Mis órdenes asignadas" : "Órdenes de trabajo"}</h1>
          <p>{esMecanico
            ? "Órdenes asignadas a ti · organiza tu trabajo"
            : "Gestión de órdenes del taller"}
          </p>
        </div>
        {(esRecepcionista || esAdmin) && (
          <button className="or-btn or-btn--primary" onClick={() => setFormOpen(true)}>
            + Nueva orden
          </button>
        )}
      </div>

      <div className="or-filters">
        <div className="or-search-wrap">
          <span className="or-search-icon">🔍</span>
          <input className="or-search-input" value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nº orden, cliente, placa…" />
        </div>
        <select className="or-filter-select" value={filtroEstado}
          onChange={(e) => handleFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="recibido">Recibido</option>
          <option value="en reparacion">En reparación</option>
          <option value="listo">Listo</option>
          <option value="entregado">Entregado</option>
        </select>
        <span className="or-count">
          {filtradas.length} orden{filtradas.length !== 1 ? "es" : ""}
        </span>
      </div>

      {error && <div className="or-error">⚠ {error}</div>}

      <div className="or-table-card">
        <table className="or-table">
          <thead>
            <tr>
              <th style={{ width: "11%" }}>Nº Orden</th>
              <th style={{ width: "18%" }}>Cliente</th>
              <th style={{ width: "14%" }}>Vehículo</th>
              <th style={{ width: "16%" }}>Mecánico</th>
              <th style={{ width: "13%" }}>Estado</th>
              <th style={{ width: "10%" }}>Prioridad</th>
              <th style={{ width: "9%" }}>Ingreso</th>
              <th style={{ width: "9%" }} className="right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8}>
                <div className="or-loading">Cargando órdenes…</div>
              </td></tr>
            )}

            {!loading && filtradas.length === 0 && (
              <tr><td colSpan={8}>
                <div className="or-empty">
                  <span className="or-empty__icon">🔧</span>
                  <p className="or-empty__title">
                    {query || filtroEstado ? "Sin resultados" : "Sin órdenes registradas"}
                  </p>
                  <p className="or-empty__desc">
                    {query || filtroEstado
                      ? "Intenta con otro criterio."
                      : (esRecepcionista || esAdmin)
                        ? "Crea la primera orden de trabajo."
                        : "No tienes órdenes asignadas aún."}
                  </p>
                  {!query && !filtroEstado && (esRecepcionista || esAdmin) && (
                    <button className="or-btn or-btn--primary"
                      style={{ marginTop: 12 }} onClick={() => setFormOpen(true)}>
                      + Nueva orden
                    </button>
                  )}
                </div>
              </td></tr>
            )}

            {!loading && filtradas.map((o) => {
              // PATRÓN STATE — obtener badge desde el contexto
              const ctx = crearContextoOrden(o);
              return (
                <tr key={o.id}>
                  <td><span className="or-num">#{o.numero_orden ?? o.id}</span></td>
                  <td>
                    <div className="or-name">{o.cliente_nombre ?? "—"}</div>
                  </td>
                  <td>
                    <div className="or-name">{o.placa ?? "—"}</div>
                    <div className="or-sub">{o.modelo ?? ""}</div>
                  </td>
                  <td>
                    {o.mecanico_nombre
                      ? <div className="or-name">{o.mecanico_nombre}</div>
                      : <div className="or-sub" style={{ fontStyle: "italic" }}>Sin asignar</div>}
                  </td>
                  <td>
                    {/* PATRÓN STATE — badge class desde el estado concreto */}
                    <span className={`or-badge ${ctx.getBadgeClass()}`}>
                      {ctx.getLabel()}
                    </span>
                  </td>
                  <td>
                    <span className={`or-prioridad ${PRIORIDAD_CLASS[o.prioridad] ?? "or-prioridad--0"}`}>
                      {PRIORIDAD_LABEL[o.prioridad] ?? "Normal"}
                    </span>
                  </td>
                  <td className="or-fecha">{fmtDate(o.fecha_ingreso)}</td>
                  <td>{renderAcciones(o)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <OrdenForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleCrear}
        saving={saving}
        clientes={clientes}
        fetchVehiculos={fetchVehiculos}
      />

      <AsignarMecanicoModal
        open={!!asignarOrden}
        onClose={() => setAsignarOrden(null)}
        onSave={handleAsignar}
        saving={saving}
        orden={asignarOrden}
        mecanicos={mecanicos}
        esReasignacion={false}
      />

      <AsignarMecanicoModal
        open={!!reasignarOrden}
        onClose={() => setReasignarOrden(null)}
        onSave={handleReasignar}
        saving={saving}
        orden={reasignarOrden}
        mecanicos={mecanicos}
        esReasignacion={true}
      />

      <ActualizarEstadoModal
        open={!!estadoOrden}
        onClose={() => setEstadoOrden(null)}
        onSave={handleEstado}
        onCerrar={handleCerrar}
        saving={saving}
        orden={estadoOrden}
      />

      <OrdenDetalleModal
        open={!!detalleOrden}
        onClose={() => setDetalleOrden(null)}
        orden={detalleOrden}
        fetchHistorial={fetchDetalle}
      />

      {toast && (
        <div className={`or-toast or-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}