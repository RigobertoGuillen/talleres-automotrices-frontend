/**
 * ============================================================
 * PRINCIPIO SOLID — SRP
 * ============================================================
 * Este hook gestiona el estado React del módulo de clientes.
 * Devuelve `clientes` (lista completa) para que ClientesModule
 * maneje su propia paginación con getPageSizes.
 * ============================================================
 */

import { useState, useEffect, useCallback } from "react";
import { ClienteFacade } from "../pages/clientes/facade/ClienteFacade";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── Carga ─────────────────────────────────────────────────────────────────
  const load = useCallback(async (query = "", filtro = "") => {
    setLoading(true);
    setError(null);
    try {
      /**
       * FACADE — obtenerClientes devuelve { clientes, total, paginas }
       * Solo usamos clientes; la paginación la hace ClientesModule.
       */
      const { clientes: data } = await ClienteFacade.obtenerClientes(query, filtro);
      setClientes(data);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Error al cargar clientes.");
      setClientes([]); // garantiza que nunca sea undefined
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Crear ─────────────────────────────────────────────────────────────────
  const add = useCallback(async (form) => {
    const result = await ClienteFacade.crearCliente(form);
    if (!result.success) return result;
    setClientes((prev) => [result.data, ...prev]);
    return result;
  }, []);

  // ── Editar ────────────────────────────────────────────────────────────────
  const edit = useCallback(async (id, form) => {
    const result = await ClienteFacade.actualizarCliente(id, form);
    if (!result.success) return result;
    setClientes((prev) => prev.map((c) => (c.id === id ? result.data : c)));
    return result;
  }, []);

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const remove = useCallback(async (id) => {
    await ClienteFacade.eliminarCliente(id);
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ── Historial ─────────────────────────────────────────────────────────────
  const fetchHistorial = useCallback(async (id, filtros = {}) => {
    return ClienteFacade.obtenerHistorial(id, filtros);
  }, []);

  return { clientes, loading, error, load, add, edit, remove, fetchHistorial };
}