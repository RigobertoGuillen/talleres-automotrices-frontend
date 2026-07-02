import { useState, useEffect, useCallback } from "react";
import {
  getClientes,
  searchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getHistorialCliente,
} from "../services/clientesService";

/**
 * Hook principal para gestión de clientes.
 * Centraliza estado, carga, filtros y operaciones CRUD.
 */
export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (query = "", filtro = "") => {
    setLoading(true);
    setError(null);
    try {
      let data = query ? await searchClientes(query) : await getClientes();

      // Filtros client-side complementarios
      if (filtro === "con-correo") {
        data = data.filter((c) => !!c.correo);
      } else if (filtro === "sin-correo") {
        data = data.filter((c) => !c.correo);
      } else if (filtro === "reciente") {
        const now = new Date();
        data = data.filter((c) => {
          const d = new Date(c.fecha_registro);
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        });
      }

      setClientes(data);
    } catch (err) {
      // Axios guarda el mensaje del backend en err.response.data.message
      const msg =
        err.response?.data?.message ?? err.message ?? "Error al cargar clientes.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (payload) => {
    const nuevo = await createCliente(payload);
    setClientes((prev) => [nuevo, ...prev]);
    return nuevo;
  }, []);

  const edit = useCallback(async (id, payload) => {
    const actualizado = await updateCliente(id, payload);
    setClientes((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
    return actualizado;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteCliente(id);
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /**
   * Devuelve { cliente, historial } tal como lo entrega el backend.
   */
  const fetchHistorial = useCallback(async (clienteId, filtros = {}) => {
    return getHistorialCliente(clienteId, filtros);
  }, []);

  return { clientes, loading, error, load, add, edit, remove, fetchHistorial };
}
