import { useState, useEffect, useCallback } from "react";
import {
  getOrdenes,
  getOrdenesByMecanico,
  createOrden,
  updateOrden,
  getHistorialOrden,
  getMecanicos,
  getClientesSelect,
  getVehiculosByCliente,
} from "../services/ordenesService";

/**
 * Hook principal de órdenes de trabajo.
 * Acepta el usuario autenticado para filtrar por rol.
 * @param {{ id, rol }} user
 */
export function useOrdenes(user) {
  const [ordenes, setOrdenes]       = useState([]);
  const [mecanicos, setMecanicos]   = useState([]);
  const [clientes, setClientes]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const esMecanico     = user?.rol === "mecanico";
  const esAdmin        = user?.rol === "admin" || user?.rol === "administrador";
  const esRecepcionista = user?.rol === "recepcionista";

  // ── Carga principal ──────────────────────────────────────────────────────
  const load = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (esMecanico) {
        data = await getOrdenesByMecanico(user.id, filtros);
      } else {
        data = await getOrdenes(filtros);
      }
      setOrdenes(data);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Error al cargar órdenes.");
    } finally {
      setLoading(false);
    }
  }, [user, esMecanico]);

  // ── Carga de mecánicos (admin) ───────────────────────────────────────────
  const loadMecanicos = useCallback(async () => {
    try {
      const data = await getMecanicos();
      setMecanicos(data);
    } catch {
      // no bloquea el módulo
    }
  }, []);

  // ── Carga de clientes (recepcionista / admin) ───────────────────────────
  const loadClientes = useCallback(async () => {
    try {
      const data = await getClientesSelect();
      setClientes(data);
    } catch {
      // no bloquea el módulo
    }
  }, []);

  useEffect(() => {
    load();
    if (esAdmin) { loadMecanicos(); loadClientes(); }
    if (esRecepcionista) loadClientes();
  }, [load, esAdmin, esRecepcionista, loadMecanicos, loadClientes]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const add = useCallback(async (payload) => {
    const nueva = await createOrden(payload);
    setOrdenes((prev) => [nueva, ...prev]);
    return nueva;
  }, []);

  const update = useCallback(async (id, payload) => {
    const actualizada = await updateOrden(id, payload);
    setOrdenes((prev) => prev.map((o) => (o.id === id ? actualizada : o)));
    return actualizada;
  }, []);

  const fetchHistorial = useCallback(async (ordenId) => {
    return getHistorialOrden(ordenId);
  }, []);

  const fetchVehiculos = useCallback(async (clienteId) => {
    return getVehiculosByCliente(clienteId);
  }, []);

  return {
    ordenes, mecanicos, clientes, loading, error,
    load, add, update, fetchHistorial, fetchVehiculos,
    esMecanico, esAdmin, esRecepcionista,
  };
}