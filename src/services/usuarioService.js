import api from './api';

export const usuarioService = {
  listar: () => api.get('/usuarios'),
  crear: (data) => api.post('/usuarios', data),
  editar: (id, data) => api.put(`/usuarios/${id}`, data),
  eliminar: (id) => api.delete(`/usuarios/${id}`),
  
  login: async (username, password) => {
    // Cambiamos los nombres de los campos a los que espera el Backend
    const response = await api.post('/auth/login', { 
        nombre_usuario: username, // 'nombre_usuario' es lo que espera el Backend
        contrasena: password      // 'contrasena' es lo que espera el Backend
    });
    return response.data; 
  }
};