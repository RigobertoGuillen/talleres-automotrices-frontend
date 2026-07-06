import api from './api';

// ── Órdenes ───────────────────────────────────────────────────────────────

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
export async function getOrdenesByMecanico(mecanicoId) {
  const { data } = await api.get(`/ordenes/mecanico/${mecanicoId}`);
  return data.data;
}

/**
 * POST /api/ordenes — crear orden (HU-19)
 * payload: { vehiculo_id, descripcion_problema, prioridad }
 */
export async function createOrden(payload) {
  const { data } = await api.post("/ordenes", payload);
  return data.data;
}

/**
 * PATCH /api/ordenes/:id/asignar — asignar mecánico (HU-20)
 * payload: { mecanico_id }
 */
export async function asignarMecanico(id, mecanicoId) {
  const { data } = await api.patch(`/ordenes/${id}/asignar`, {
    mecanico_id: mecanicoId,
  });
  return data.data;
}

/**
 * PATCH /api/ordenes/:id/estado — actualizar estado (HU-22)
 * payload: { estado, notas }
 * Estados válidos: recibido | en reparacion | listo | entregado
 */
export async function actualizarEstado(id, payload) {
  const { data } = await api.patch(`/ordenes/${id}/estado`, payload);
  return data.data;
}

/**
 * PATCH /api/ordenes/:id/cerrar — cerrar orden (HU-23)
 * No requiere body — el backend lo cierra con estado "entregado"
 */
export async function cerrarOrden(id) {
  const { data } = await api.patch(`/ordenes/${id}/cerrar`);
  return data.data;
}

/**
 * PATCH /api/ordenes/:id/reasignar — reasignar mecánico (HU-26)
 * payload: { mecanico_id }
 */
export async function reasignarOrden(id, mecanicoId) {
  const { data } = await api.patch(`/ordenes/${id}/reasignar`, {
    mecanico_id: mecanicoId,
  });
  return data.data;
}

// ── Auxiliares ────────────────────────────────────────────────────────────

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