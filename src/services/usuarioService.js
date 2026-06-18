import api from './api';

export const usuarioService = {
  listar: () => api.get('/usuarios'),
  crear: (data) => api.post('/usuarios', data),
  editar: (id, data) => api.put(`/usuarios/${id}`, data),
  eliminar: (id) => api.delete(`/usuarios/${id}`),
};