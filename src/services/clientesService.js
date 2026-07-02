import api from "../services/api";

/**
 * Obtiene todos los clientes con su dirección asociada.
 * GET /api/clientes
 */
export async function getClientes() {
  const { data } = await api.get("/clientes");
  return data.data;
}

/**
 * Busca clientes por nombre, apellido o texto libre.
 * GET /api/clientes/buscar?q=...
 * @param {string} query
 */
export async function searchClientes(query) {
  const q = query.trim();
  if (!q) return getClientes();
  const { data } = await api.get("/clientes/buscar", { params: { q } });
  return data.data;
}

/**
 * Obtiene un cliente por ID.
 * GET /api/clientes/:id
 * @param {number} id
 */
export async function getClienteById(id) {
  const { data } = await api.get(`/clientes/${id}`);
  return data.data;
}

/**
 * Obtiene un cliente por DNI.
 * GET /api/clientes/dni/:dni
 * @param {string} dni
 */
export async function getClienteByDni(dni) {
  const { data } = await api.get(`/clientes/dni/${dni}`);
  return data.data;
}

/**
 * Crea un nuevo cliente con su dirección.
 * POST /api/clientes
 * @param {{ direccion: object, ...clienteFields }} payload
 */
export async function createCliente(payload) {
  const { data } = await api.post("/clientes", payload);
  return data.data;
}

/**
 * Actualiza los datos de un cliente existente.
 * PUT /api/clientes/:id
 * @param {number} id
 * @param {{ direccion: object, ...clienteFields }} payload
 */
export async function updateCliente(id, payload) {
  const { data } = await api.put(`/clientes/${id}`, payload);
  return data.data;
}

/**
 * Elimina un cliente por ID.
 * Solo administradores. Lanza error si tiene órdenes asociadas.
 * DELETE /api/clientes/:id
 * @param {number} id
 */
export async function deleteCliente(id) {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
}

/**
 * Obtiene el historial de órdenes de trabajo de un cliente.
 * GET /api/clientes/:id/historial
 * @param {number} clienteId
 * @param {{ fecha_inicio?: string, fecha_fin?: string }} filtros
 */
export async function getHistorialCliente(clienteId, filtros = {}) {
  const { data } = await api.get(`/clientes/${clienteId}/historial`, {
    params: filtros,
  });
  return data.data;
}