import api from './api';

const servicioService = {
  listar: () => api.get('/servicios'),
  obtener: (id) => api.get(`/servicios/${id}`),
  crear: (data) => api.post('/servicios', data),
  actualizar: (id, data) => api.put(`/servicios/${id}`, data),
  eliminar: (id) => api.delete(`/servicios/${id}`),
  listarPorOrden: (ordenId) => api.get(`/servicios/orden/${ordenId}`),
  registrarEnOrden: (data) => api.post('/servicios/orden', data),
  removerDeOrden: (id) => api.delete(`/servicios/orden/${id}`),
};

export default servicioService;
