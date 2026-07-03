import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOrdenes } from "../../hooks/useOrdenes";
import OrdenForm from "../../components/ordenes/OrdenForm";
import AsignarMecanicoModal from "../../components/ordenes/AsignarMecanicoModal";
import ActualizarEstadoModal from "../../components/ordenes/ActualizarEstadoModal";
import OrdenDetalleModal from "../../components/ordenes/OrdenDetalleModal";

/**
 * PATRÓN STATE — uso en OrdenesModule
 * ------------------------------------
 * Importamos crearContextoOrden para que cada fila de la tabla
 * consulte al contexto qué acciones están disponibles para esa orden.
 * Elimina todos los if(orden.estado === "x") en el renderizado.
 */
import { crearContextoOrden } from "./state/OrdenState";
import "../../pages/ordenes/ordenes.css";

// ── helpers ────────────────────────────────────────────────────────────────
const ESTADO_LABEL = {
  recibido: "Recibido", diagnostico: "En diagnóstico",
  reparacion: "En reparación", completado: "Completado",
  cerrado: "Cerrado", cancelado: "Cancelado",
};
const BADGE_CLASS = {
  recibido: "or-badge--recibido", diagnostico: "or-badge--diagnostico",
  reparacion: "or-badge--reparacion", completado: "or-badge--completado",
  cerrado: "or-badge--cerrado", cancelado: "or-badge--cancelado",
};
const PRIORIDAD_LABEL = { 0: "Normal", 1: "Baja", 2: "Media", 3: "Alta" };
const PRIORIDAD_CLASS = {
  0: "or-prioridad--0", 1: "or-prioridad--1",
  2: "or-prioridad--2", 3: "or-prioridad--3",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "2-digit" });
}

// ── component ──────────────────────────────────────────────────────────────
export default function OrdenesModule() {
  const { user } = useAuth();
  const {
    ordenes, mecanicos, clientes, loading, error,
    load, add, update, fetchHistorial, fetchVehiculos,
    esMecanico, esAdmin, esRecepcionista,
  } = useOrdenes(user);

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [query, setQuery]         = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const debounceRef = useRef(null);

  function handleSearch(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load({ estado: filtroEstado, q: val }), 350);
  }
  function handleFiltroEstado(val) {
    setFiltroEstado(val);
    load({ estado: val, q: query });
  }

  // filtro local por texto (numero_orden, cliente, placa)
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
  const [formOpen, setFormOpen]           = useState(false);
  const [saving, setSaving]               = useState(false);
  const [detalleOrden, setDetalleOrden]   = useState(null);
  const [asignarOrden, setAsignarOrden]   = useState(null);
  const [reasignarOrden, setReasignarOrden] = useState(null);
  const [estadoOrden, setEstadoOrden]     = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleCrear(payload) {
    setSaving(true);
    try {
      await add(payload);
      showToast("Orden de trabajo creada.");
      setFormOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al crear.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAsignar(payload) {
    setSaving(true);
    try {
      await update(asignarOrden.id, { mecanico_id: payload.mecanico_id });
      showToast("Mecánico asignado correctamente.");
      setAsignarOrden(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al asignar.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleReasignar(payload) {
    setSaving(true);
    try {
      await update(reasignarOrden.id, { mecanico_id: payload.mecanico_id, notas_reasignacion: payload.notas_reasignacion });
      showToast("Mecánico reasignado correctamente.");
      setReasignarOrden(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al reasignar.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleEstado(payload) {
    setSaving(true);
    try {
      await update(estadoOrden.id, payload);
      const esCierre = payload.estado === "cerrado";
      showToast(esCierre ? "Orden cerrada y disponible para facturación." : "Estado actualizado.");
      setEstadoOrden(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message ?? "Error al actualizar.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Acciones por fila según rol ──────────────────────────────────────────
  function renderAcciones(o) {
    /**
     * PATRÓN STATE — crearContextoOrden(o) crea un OrdenContext
     * con el estado actual de la orden. A partir de aquí, todas
     * las decisiones de qué botones mostrar se delegan al contexto,
     * que internamente delega al estado concreto correspondiente.
     *
     * Antes (sin patrón): if(o.estado==="cerrado" || o.estado==="cancelado")
     * Ahora (con patrón): ctx.esFinal() — la lógica vive en el estado concreto.
     */
    const ctx = crearContextoOrden(o);

    return (
      <div className="or-actions">
        {/* Ver detalle — disponible para todos los roles siempre */}
        <button className="or-btn or-btn--ghost" title="Ver detalle"
          onClick={() => setDetalleOrden(o)}>🔍</button>

        {/**
          * PATRÓN STATE — puedeAsignarMecanico() está definido en cada
          * estado concreto. Solo retorna true en EstadoRecibido.
          * Reemplaza: esAdmin && !o.mecanico_id && o.estado !== "cerrado"
          */}
        {esAdmin && !o.mecanico_id && ctx.puedeAsignarMecanico() && (
          <button className="or-btn or-btn--ghost" title="Asignar mecánico"
            onClick={() => setAsignarOrden(o)}>👤</button>
        )}

        {/**
          * PATRÓN STATE — puedeReasignar() retorna true en Recibido,
          * Diagnostico y Reparacion, false en Completado, Cerrado y Cancelado.
          * Reemplaza: esAdmin && o.mecanico_id && o.estado !== "cerrado"
          */}
        {esAdmin && o.mecanico_id && ctx.puedeReasignar() && (
          <button className="or-btn or-btn--ghost" title="Reasignar mecánico"
            onClick={() => setReasignarOrden(o)}>🔄</button>
        )}

        {/**
          * PATRÓN STATE — puedeActualizarEstado() retorna false en
          * EstadoCerrado y EstadoCancelado (estados finales), garantizando
          * HU-23: "debe impedir modificaciones posteriores".
          * Reemplaza: (esMecanico || esAdmin) && o.estado !== "cerrado" && o.estado !== "cancelado"
          */}
        {(esMecanico || esAdmin) && ctx.puedeActualizarEstado() && (
          <button className="or-btn or-btn--ghost" title="Actualizar estado"
            onClick={() => setEstadoOrden(o)}>✏️</button>
        )}
      </div>
    );
  }

  // ── Título por rol ───────────────────────────────────────────────────────
  function tituloModulo() {
    if (esMecanico)      return "Mis órdenes asignadas";
    if (esRecepcionista) return "Órdenes de trabajo";
    return "Órdenes de trabajo";
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="or-page">

      {/* Header */}
      <div className="or-header">
        <div className="or-header__left">
          <h1>{tituloModulo()}</h1>
          <p>
            {esMecanico
              ? "Órdenes asignadas a ti · organiza tu trabajo"
              : "Gestión de órdenes del taller"}
          </p>
        </div>
        {/* Solo recepcionista y admin pueden crear */}
        {(esRecepcionista || esAdmin) && (
          <button className="or-btn or-btn--primary" onClick={() => setFormOpen(true)}>
            + Nueva orden
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="or-filters">
        <div className="or-search-wrap">
          <span className="or-search-icon">🔍</span>
          <input
            className="or-search-input"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nº orden, cliente, placa…"
          />
        </div>
        <select className="or-filter-select" value={filtroEstado}
          onChange={(e) => handleFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="recibido">Recibido</option>
          <option value="diagnostico">En diagnóstico</option>
          <option value="reparacion">En reparación</option>
          <option value="completado">Completado</option>
          <option value="cerrado">Cerrado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <span className="or-count">
          {filtradas.length} orden{filtradas.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Error */}
      {error && <div className="or-error">⚠ {error}</div>}

      {/* Tabla */}
      <div className="or-table-card">
        <table className="or-table">
          <thead>
            <tr>
              <th style={{ width: "11%" }}>Nº Orden</th>
              <th style={{ width: "18%" }}>Cliente</th>
              <th style={{ width: "14%" }}>Vehículo</th>
              <th style={{ width: "16%" }}>Mecánico</th>
              <th style={{ width: "12%" }}>Estado</th>
              <th style={{ width: "10%" }}>Prioridad</th>
              <th style={{ width: "10%" }}>Ingreso</th>
              <th style={{ width: "9%" }} className="right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8}><div className="or-loading">Cargando órdenes…</div></td></tr>
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
                      : (esRecepcionista || esAdmin) ? "Crea la primera orden de trabajo." : "No tienes órdenes asignadas aún."}
                  </p>
                  {!query && !filtroEstado && (esRecepcionista || esAdmin) && (
                    <button className="or-btn or-btn--primary" style={{ marginTop: 12 }}
                      onClick={() => setFormOpen(true)}>
                      + Nueva orden
                    </button>
                  )}
                </div>
              </td></tr>
            )}

            {!loading && filtradas.map((o) => (
              <tr key={o.id}>
                <td><span className="or-num">#{o.numero_orden}</span></td>
                <td>
                  <div className="or-name">{o.cliente_nombre ?? "—"}</div>
                  {o.cliente_dni && <div className="or-sub">{o.cliente_dni}</div>}
                </td>
                <td>
                  <div className="or-name">{o.placa ?? "—"}</div>
                  <div className="or-sub">{[o.marca, o.modelo].filter(Boolean).join(" ")}</div>
                </td>
                <td>
                  {o.mecanico_nombre
                    ? <div className="or-name">{o.mecanico_nombre}</div>
                    : <div className="or-sub" style={{ fontStyle: "italic" }}>Sin asignar</div>}
                </td>
                <td>
                  <span className={`or-badge ${BADGE_CLASS[o.estado] ?? ""}`}>
                    {ESTADO_LABEL[o.estado] ?? o.estado}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modales ── */}
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
        saving={saving}
        orden={estadoOrden}
      />

      <OrdenDetalleModal
        open={!!detalleOrden}
        onClose={() => setDetalleOrden(null)}
        orden={detalleOrden}
        fetchHistorial={fetchHistorial}
      />

      {/* Toast */}
      {toast && (
        <div className={`or-toast or-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}