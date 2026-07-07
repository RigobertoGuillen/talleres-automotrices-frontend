import { useState, useEffect, useCallback } from "react";
import {
  getOrdenes,
  getOrdenesByMecanico,
  createOrden,
  asignarMecanico,
  actualizarEstado,
  cerrarOrden,
  reasignarOrden,
  getOrdenById,
  getMecanicos,
  getClientesSelect,
  getVehiculosByCliente,
} from "../services/ordenesService";

/**
 * Hook principal de órdenes de trabajo.
 * Detecta el rol del usuario y carga solo lo que corresponde.
 * @param {{ id, rol }} user — usuario del AuthContext
 */
export function useOrdenes(user) {
  const [ordenes, setOrdenes]     = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [clientes, setClientes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const esMecanico      = user?.rol === "mecanico";
  const esAdmin         = user?.rol === "admin" || user?.rol === "administrador";
  const esRecepcionista = user?.rol === "recepcionista";

  // ── Carga principal ──────────────────────────────────────────────────────
  const load = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (esMecanico) {
        // Mecánico solo ve sus órdenes asignadas (HU-21)
        data = await getOrdenesByMecanico(user.id);
        // Filtro local por estado si viene del selector
        if (filtros.estado) {
          data = data.filter((o) => o.estado === filtros.estado);
        }
      } else {
        // Admin y recepcionista ven todas, con filtros del backend
        data = await getOrdenes(filtros);
      }
      setOrdenes(data);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Error al cargar órdenes.");
    } finally {
      setLoading(false);
    }
  }, [user, esMecanico]);

  // ── Carga de mecánicos (solo admin) ──────────────────────────────────────
  const loadMecanicos = useCallback(async () => {
    try {
      const data = await getMecanicos();
      setMecanicos(data);
    } catch {
      setMecanicos([]);
    }
  }, []);

  // ── Carga de clientes (recepcionista y admin) ────────────────────────────
  const loadClientes = useCallback(async () => {
    try {
      const data = await getClientesSelect();
      setClientes(data);
    } catch {
      setClientes([]);
    }
  }, []);

  useEffect(() => {
    load();
    if (esAdmin)         { loadMecanicos(); loadClientes(); }
    if (esRecepcionista) { loadClientes(); }
  }, [load, esAdmin, esRecepcionista, loadMecanicos, loadClientes]);

  // ── Crear orden (HU-19) ──────────────────────────────────────────────────
  const add = useCallback(async (payload) => {
    const nueva = await createOrden(payload);
    setOrdenes((prev) => [nueva, ...prev]);
    return nueva;
  }, []);

  // ── Asignar mecánico (HU-20) ─────────────────────────────────────────────
  const asignar = useCallback(async (id, mecanicoId) => {
    const actualizada = await asignarMecanico(id, mecanicoId);
    setOrdenes((prev) => prev.map((o) => (o.id === id ? actualizada : o)));
    return actualizada;
  }, []);

  // ── Actualizar estado (HU-22) ────────────────────────────────────────────
  const updateEstado = useCallback(async (id, payload) => {
    const actualizada = await actualizarEstado(id, payload);
    setOrdenes((prev) => prev.map((o) => (o.id === id ? actualizada : o)));
    return actualizada;
  }, []);

  // ── Cerrar orden (HU-23) ─────────────────────────────────────────────────
  const cerrar = useCallback(async (id) => {
    const actualizada = await cerrarOrden(id);
    setOrdenes((prev) => prev.map((o) => (o.id === id ? actualizada : o)));
    return actualizada;
  }, []);

  // ── Reasignar mecánico (HU-26) ───────────────────────────────────────────
  const reasignar = useCallback(async (id, mecanicoId) => {
    const actualizada = await reasignarOrden(id, mecanicoId);
    setOrdenes((prev) => prev.map((o) => (o.id === id ? actualizada : o)));
    return actualizada;
  }, []);

  // ── Obtener detalle con historial (HU-25) ────────────────────────────────
  const fetchDetalle = useCallback(async (id) => {
    return getOrdenById(id);
  }, []);

  // ── Vehículos de un cliente (para el formulario) ─────────────────────────
  const fetchVehiculos = useCallback(async (clienteId) => {
    return getVehiculosByCliente(clienteId);
  }, []);

  return {
    ordenes, mecanicos, clientes, loading, error,
    load, add, asignar, updateEstado, cerrar, reasignar,
    fetchDetalle, fetchVehiculos,
    esMecanico, esAdmin, esRecepcionista,
  };
}