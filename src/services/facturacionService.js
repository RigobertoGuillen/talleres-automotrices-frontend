import api from './api';

const facturacionService = {
  listarCais: () => api.get('/facturacion/cai'),
  obtenerCaiActivo: () => api.get('/facturacion/cai/activo'),
  crearCai: (data) => api.post('/facturacion/cai', data),
  obtenerDetalleOrden: (ordenId) => api.get(`/facturacion/ordenes/${ordenId}/detalle`),
  generarFactura: (ordenId) => api.post(`/facturacion/ordenes/${ordenId}/generar`),
  listarFacturas: () => api.get('/facturacion/facturas'),
  obtenerFactura: (id) => api.get(`/facturacion/facturas/${id}`),
  registrarPago: (id, metodo_pago) => api.patch(`/facturacion/facturas/${id}/pago`, { metodo_pago }),
};

export default facturacionService;
