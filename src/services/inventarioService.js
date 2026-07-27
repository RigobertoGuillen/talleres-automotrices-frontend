import api from './api';

const inventarioService = {
  // Categorías
  listarCategorias: () => api.get('/inventario/categorias'),
  crearCategoria: (data) => api.post('/inventario/categorias', data),
  actualizarCategoria: (id, data) => api.put(`/inventario/categorias/${id}`, data),
  eliminarCategoria: (id) => api.delete(`/inventario/categorias/${id}`),

  // Repuestos (HU-27)
  listarRepuestos: () => api.get('/inventario/repuestos'),
  obtenerRepuesto: (id) => api.get(`/inventario/repuestos/${id}`),
  buscarRepuestos: (q) => api.get('/inventario/repuestos/buscar', { params: { q } }),
  crearRepuesto: (data) => api.post('/inventario/repuestos', data),
  actualizarRepuesto: (id, data) => api.put(`/inventario/repuestos/${id}`, data),
  eliminarRepuesto: (id) => api.delete(`/inventario/repuestos/${id}`),

  // Stock (HU-29, HU-32)
  consultarStock: (filtros = {}) => api.get('/inventario/stock', { params: filtros }),
  alertasStock: () => api.get('/inventario/stock/alertas'),
  actualizarStockMinimo: (repuestoId, cantidadMinima) =>
    api.put(`/inventario/stock/${repuestoId}/minimo`, { cantidad_minima: cantidadMinima }),

  // Movimientos / Kardex (HU-28, HU-33)
  crearMovimiento: (data) => api.post('/inventario/movimientos', data),
  listarMovimientos: (params = {}) => api.get('/inventario/movimientos', { params }),
  movimientosPorRepuesto: (repuestoId) => api.get(`/inventario/movimientos/repuesto/${repuestoId}`),

  // Solicitudes (HU-30). Sin flujo de aprobación: son bitácora informativa;
  // el ajuste real de stock se hace registrando la salida en el Kardex.
  crearSolicitud: (data) => api.post('/inventario/solicitudes', data),
  solicitudesRecientes: () => api.get('/inventario/solicitudes'),
  solicitudesPorOrden: (ordenId) => api.get(`/inventario/solicitudes/orden/${ordenId}`),
  listarSolicitudes: () => api.get('/inventario/solicitudes'),
};

export default inventarioService;
