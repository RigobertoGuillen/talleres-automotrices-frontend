import { useState, useEffect, useCallback } from 'react';
import { getOrdenes } from '../../services/ordenesService';
import facturacionService from '../../services/facturacionService';
import '../../styles/dashboard-dark.css';

const fmtMonto = (valor) =>
  new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(valor) || 0);

export default function GenerarFactura() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(true);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState('');

  const [preview, setPreview] = useState(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getOrdenes()
      .then(data => setOrdenes((data || []).filter(o => o.estado === 'entregado')))
      .catch(() => setOrdenes([]))
      .finally(() => setCargandoOrdenes(false));
  }, []);

  const cargarPreview = useCallback(async (ordenId) => {
    if (!ordenId) { setPreview(null); return; }
    setCargandoPreview(true);
    setError('');
    try {
      const res = await facturacionService.obtenerDetalleOrden(ordenId);
      setPreview(res.data.data);
    } catch (err) {
      setPreview(null);
      setError(err.response?.data?.message || 'No se pudo cargar el detalle de la orden.');
    } finally {
      setCargandoPreview(false);
    }
  }, []);

  useEffect(() => {
    cargarPreview(ordenSeleccionada);
  }, [ordenSeleccionada, cargarPreview]);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleGenerar = async () => {
    setGenerando(true);
    setError('');
    try {
      await facturacionService.generarFactura(ordenSeleccionada);
      mostrarToast('Factura generada correctamente.');
      cargarPreview(ordenSeleccionada);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar la factura.');
    } finally {
      setGenerando(false);
    }
  };

  const detalle = preview?.yaFacturada ? preview.detalle : preview?.items;
  const factura = preview?.yaFacturada ? preview.factura : null;

  return (
    <div className="dt-page">
      <div className="dt-header">
        <div className="dt-header__left">
          <h1>Generar Factura</h1>
          <p>Revisa el detalle de una orden entregada y genera su factura</p>
        </div>
      </div>

      <div className="dt-filters">
        <select
          className="dt-select"
          style={{ flex: 1 }}
          value={ordenSeleccionada}
          onChange={e => setOrdenSeleccionada(e.target.value)}
        >
          <option value="">
            {cargandoOrdenes ? 'Cargando órdenes...' : 'Seleccionar orden entregada...'}
          </option>
          {ordenes.map(o => (
            <option key={o.id} value={o.numero_orden}>
              #{o.numero_orden} — {o.cliente_nombre ?? '—'}{o.placa ? ` · ${o.placa}` : ''}
            </option>
          ))}
        </select>
      </div>

      {!cargandoOrdenes && ordenes.length === 0 && (
        <p className="dt-empty">No hay órdenes en estado "entregado" disponibles para facturar.</p>
      )}

      {error && <div className="dt-error">{error}</div>}

      {ordenSeleccionada && (
        cargandoPreview ? (
          <p className="dt-loading">Cargando detalle...</p>
        ) : preview && (
          <>
            {preview.yaFacturada && (
              <div className="dt-field-error" style={{ background: 'rgba(72,187,120,0.08)', borderColor: 'rgba(72,187,120,0.3)', color: '#68D391' }}>
                Esta orden ya fue facturada — factura #{factura.numero_factura}, emitida el{' '}
                {new Date(factura.fecha_emision).toLocaleDateString('es-HN')}.
              </div>
            )}

            <p style={{ margin: '0 0 16px', color: '#7B7A9E', fontSize: 13 }}>
              Cliente: <b style={{ color: '#E8E6FF' }}>
                {preview.yaFacturada ? factura.cliente_nombre : preview.orden.cliente_nombre}
              </b>
              {' · DNI: '}{preview.yaFacturada ? factura.cliente_dni : preview.orden.cliente_dni}
            </p>

            <div className="dt-table-card" style={{ marginBottom: 16 }}>
              {detalle.length === 0 ? (
                <p className="dt-empty">Esta orden no tiene servicios ni repuestos aplicados para facturar.</p>
              ) : (
                <table className="dt-table">
                  <thead>
                    <tr>
                      {['Tipo', 'Descripción', 'Cantidad', 'Costo unitario', 'Monto'].map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.map((item, i) => (
                      <tr key={item.id ?? i}>
                        <td>
                          <span className="dt-badge" style={item.tipo === 'servicio'
                            ? { background: 'rgba(108,99,255,0.12)', color: '#9B8FFF' }
                            : { background: 'rgba(251,191,36,0.12)', color: '#FBD000' }}>
                            {item.tipo}
                          </span>
                        </td>
                        <td>{item.descripcion}</td>
                        <td>{item.cantidad}</td>
                        <td>{fmtMonto(item.costo_unitario)}</td>
                        <td>{fmtMonto(item.monto_gravado ?? item.cantidad * item.costo_unitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#9896B8', fontSize: 13 }}>
                  <span>Subtotal gravado 15%</span>
                  <span>{fmtMonto(preview.yaFacturada ? factura.subtotal_gravado_15 : preview.subtotal_gravado_15)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#9896B8', fontSize: 13 }}>
                  <span>ISV 15%</span>
                  <span>{fmtMonto(preview.yaFacturada ? factura.isv_15 : preview.isv_15)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', color: '#E8E6FF', fontSize: 16, fontWeight: 700, borderTop: '1px solid rgba(108,99,255,0.15)', marginTop: 4 }}>
                  <span>Total</span>
                  <span>{fmtMonto(preview.yaFacturada ? factura.total : preview.total)}</span>
                </div>
              </div>
            </div>

            {!preview.yaFacturada && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  onClick={handleGenerar}
                  disabled={generando}
                  className="dt-btn dt-btn--primary"
                >
                  {generando ? 'Generando...' : 'Generar Factura'}
                </button>
              </div>
            )}
          </>
        )
      )}

      {toast && <div className="dt-toast dt-toast--success">{toast}</div>}
    </div>
  );
}
