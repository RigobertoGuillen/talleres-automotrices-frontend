import api from './api';

const diagnosticoService = {
  listar: (filtros = {}) => api.get('/diagnosticos', { params: filtros }),
  obtener: (id) => api.get(`/diagnosticos/${id}`),
  porOrden: (ordenId) => api.get(`/diagnosticos/orden/${ordenId}`),
  crear: (data) => api.post('/diagnosticos', data),
  actualizar: (id, data) => api.put(`/diagnosticos/${id}`, data),
  actualizarObservaciones: (id, observaciones) => api.patch(`/diagnosticos/${id}/observaciones`, { observaciones }),
  actualizarEstado: (id, estado) => api.patch(`/diagnosticos/${id}/estado`, { estado }),
};

export default diagnosticoService;
