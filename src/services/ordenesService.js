import api from "../api/axios";

// ── Órdenes ──────────────────────────────────────────────────────────────────

/** GET /api/ordenes — todas las órdenes (admin / recepcionista) */
export async function getOrdenes(filtros = {}) {
  const { data } = await api.get("/ordenes", { params: filtros });
  return data.data;
}

/** GET /api/ordenes/:id — detalle completo de una orden */
export async function getOrdenById(id) {
  const { data } = await api.get(`/ordenes/${id}`);
  return data.data;
}

/** GET /api/ordenes/mecanico/:id — órdenes asignadas a un mecánico */
export async function getOrdenesByMecanico(mecanicoId, filtros = {}) {
  const { data } = await api.get(`/ordenes/mecanico/${mecanicoId}`, { params: filtros });
  return data.data;
}

/**
 * POST /api/ordenes — crear orden de trabajo (HU-19)
 * payload: { vehiculo_id, descripcion_problema, fecha_ingreso, prioridad }
 */
export async function createOrden(payload) {
  const { data } = await api.post("/ordenes", payload);
  return data.data;
}

/**
 * PUT /api/ordenes/:id — actualizar orden
 * Usado para: asignar mecánico (HU-20), actualizar estado (HU-22),
 *             cerrar orden (HU-23), reasignar (HU-26)
 */
export async function updateOrden(id, payload) {
  const { data } = await api.put(`/ordenes/${id}`, payload);
  return data.data;
}

/** GET /api/ordenes/:id/historial — historial de estados (HU-22, HU-25) */
export async function getHistorialOrden(ordenId) {
  const { data } = await api.get(`/ordenes/${ordenId}/historial`);
  return data.data;
}

// ── Auxiliares ────────────────────────────────────────────────────────────────

/** GET /api/clientes — para el selector de clientes en crear orden */
export async function getClientesSelect() {
  const { data } = await api.get("/clientes");
  return data.data;
}

/** GET /api/vehiculos/cliente/:id — vehículos de un cliente */
export async function getVehiculosByCliente(clienteId) {
  const { data } = await api.get(`/vehiculos/cliente/${clienteId}`);
  return data.data;
}

/** GET /api/usuarios?rol=mecanico — mecánicos disponibles */
export async function getMecanicos() {
  const { data } = await api.get("/usuarios", { params: { rol: "mecanico" } });
  return data.data;
}