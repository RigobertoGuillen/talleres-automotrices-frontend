/**
 * ============================================================
 * PRINCIPIO SOLID — SRP (Single Responsibility Principle)
 * ============================================================
 * Este archivo tiene UNA sola responsabilidad:
 * hacer las llamadas HTTP al API de clientes.
 *
 * No valida datos, no maneja estado React, no formatea UI.
 * Si la URL del endpoint cambia, solo se modifica aquí.
 * ============================================================
 */

import api from './api';

/** GET /api/clientes */
export async function apiGetClientes() {
  const { data } = await api.get("/clientes");
  return data.data;
}

/** GET /api/clientes/buscar?q=... */
export async function apiSearchClientes(q) {
  const { data } = await api.get("/clientes/buscar", { params: { q } });
  return data.data;
}

/** GET /api/clientes/:id */
export async function apiGetClienteById(id) {
  const { data } = await api.get(`/clientes/${id}`);
  return data.data;
}

/** POST /api/clientes */
export async function apiCreateCliente(payload) {
  const { data } = await api.post("/clientes", payload);
  return data.data;
}

/** PUT /api/clientes/:id */
export async function apiUpdateCliente(id, payload) {
  const { data } = await api.put(`/clientes/${id}`, payload);
  return data.data;
}

/** DELETE /api/clientes/:id */
export async function apiDeleteCliente(id) {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
}

/** GET /api/clientes/:id/historial */
export async function apiGetHistorial(id, filtros = {}) {
  const { data } = await api.get(`/clientes/${id}/historial`, {
    params: filtros,
  });
  return data.data; // { cliente, historial }
}