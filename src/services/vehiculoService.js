import api from './api';

const vehiculoService = {
  listar: () => api.get('/vehiculos'),
  buscar: (q) => api.get('/vehiculos/buscar', { params: { q } }),
  obtener: (id) => api.get(`/vehiculos/${id}`),
  crear: (data) => api.post('/vehiculos', data),
  actualizar: (id, data) => api.put(`/vehiculos/${id}`, data),
  historial: (id) => api.get(`/vehiculos/${id}/historial`),
  marcas: () => api.get('/vehiculos/marcas'),
};

export default vehiculoService;
