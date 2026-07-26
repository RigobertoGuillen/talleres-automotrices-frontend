import api from './api';

const reportesService = {
  // HU-39
  servicios: (fechaInicio, fechaFin) =>
    api.get('/reportes/servicios', { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),

  // HU-40
  vehiculosAtendidos: (fechaInicio, fechaFin) =>
    api.get('/reportes/vehiculos-atendidos', { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),

  // HU-41
  inventarioUtilizado: (fechaInicio, fechaFin) =>
    api.get('/reportes/inventario-utilizado', { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),

  // HU-42
  ingresos: (fechaInicio, fechaFin) =>
    api.get('/reportes/ingresos', { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),

  // HU-43
  mecanicosActivos: () => api.get('/reportes/mecanicos/activos'),
  reporteMecanicos: (fechaInicio, fechaFin, mecanicoId) =>
    api.get('/reportes/mecanicos', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin, mecanico_id: mecanicoId || undefined }
    }),

  // HU-44
  ordenesPendientes: (filtros = {}) =>
    api.get('/reportes/ordenes-pendientes', { params: filtros }),

  // HU-45
  dashboard: () => api.get('/reportes/dashboard'),
};

export default reportesService;
