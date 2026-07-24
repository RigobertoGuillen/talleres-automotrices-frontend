import { useState, useEffect, useCallback } from 'react';
import facturacionService from '../../services/facturacionService';
import Paginacion, { getPageSizes } from '../../components/common/Paginacion';
import '../../styles/dashboard-dark.css';

const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

const fmtMonto = (valor) =>
  new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(valor) || 0);

function fmtFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-HN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [facturaDetalle, setFacturaDetalle] = useState(null);
  const [detalleItems, setDetalleItems] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [metodoPago, setMetodoPago] = useState('');
  const [registrandoPago, setRegistrandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const cargarFacturas = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await facturacionService.listarFacturas();
      setFacturas(res.data.data || []);
    } catch {
      setError('No se pudieron cargar las facturas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarFacturas();
  }, [cargarFacturas]);

  const facturasFiltradas = facturas.filter(f => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      f.numero_factura?.toLowerCase().includes(q) ||
      f.cliente_nombre?.toLowerCase().includes(q) ||
      f.orden_id?.toLowerCase().includes(q)
    );
  });

  const [pagina, setPagina] = useState(1);
  const pageSizes = getPageSizes(facturasFiltradas.length);
  const totalPaginas = pageSizes.length;
  const offset = pageSizes.slice(0, pagina - 1).reduce((a, b) => a + b, 0);
  const facturasPagina = facturasFiltradas.slice(offset, offset + (pageSizes[pagina - 1] ?? 10));

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(Math.max(1, totalPaginas));
  }, [totalPaginas]); // eslint-disable-line react-hooks/exhaustive-deps

  const verDetalle = async (factura) => {
    setFacturaDetalle(factura);
    setCargandoDetalle(true);
    setMetodoPago('');
    setErrorPago('');
    try {
      const res = await facturacionService.obtenerFactura(factura.id);
      setDetalleItems(res.data.data.detalle || []);
      setFacturaDetalle(res.data.data.factura);
    } catch {
      setDetalleItems([]);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => { setFacturaDetalle(null); setDetalleItems([]); };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!metodoPago) return;
    setRegistrandoPago(true);
    setErrorPago('');
    try {
      const res = await facturacionService.registrarPago(facturaDetalle.id, metodoPago);
      setFacturaDetalle(res.data.data);
      setFacturas(prev => prev.map(f => f.id === res.data.data.id ? { ...f, metodo_pago: res.data.data.metodo_pago } : f));
    } catch (err) {
      setErrorPago(err.response?.data?.message || 'Error al registrar el pago.');
    } finally {
      setRegistrandoPago(false);
    }
  };

  return (
    <div className="dt-page">
      <div className="dt-header">
        <div className="dt-header__left">
          <h1>Facturas</h1>
          <p>Facturas emitidas por el taller</p>
        </div>
      </div>

      <div className="dt-filters">
        <input
          type="text"
          placeholder="Buscar por N° de factura, cliente u orden..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="dt-search-input"
        />
      </div>

      {error && <div className="dt-error">{error}</div>}

      <div className="dt-table-card">
        {cargando ? (
          <p className="dt-loading">Cargando facturas...</p>
        ) : facturasFiltradas.length === 0 ? (
          <p className="dt-empty">
            {busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay facturas generadas todavía.'}
          </p>
        ) : (
          <table className="dt-table">
            <thead>
              <tr>
                {['N° Factura', 'Orden', 'Cliente', 'Total', 'Método de pago', 'Emisión', ''].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturasPagina.map(f => (
                <tr key={f.id}>
                  <td className="dt-name" style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.numero_factura}</td>
                  <td>#{f.orden_id}</td>
                  <td>{f.cliente_nombre}</td>
                  <td>{fmtMonto(f.total)}</td>
                  <td>{f.metodo_pago || <span style={{ fontStyle: 'italic', color: '#5A5880' }}>Pendiente de cobro</span>}</td>
                  <td>{fmtFecha(f.fecha_emision)}</td>
                  <td>
                    <button onClick={() => verDetalle(f)} className="dt-btn dt-btn--ghost">Ver detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        totalItems={facturasFiltradas.length}
        itemLabel="factura"
        onCambiarPagina={setPagina}
      />

      {facturaDetalle && (
        <div className="dt-overlay">
          <div className="dt-modal" style={{ maxWidth: 640 }}>
            <div className="dt-modal__header">
              <h3 className="dt-modal__title">Factura {facturaDetalle.numero_factura}</h3>
              <button onClick={cerrarDetalle} className="dt-modal__close">×</button>
            </div>

            <p style={{ margin: '0 0 16px', color: '#7B7A9E', fontSize: 13 }}>
              Orden #{facturaDetalle.orden_id} · {facturaDetalle.cliente_nombre} · DNI {facturaDetalle.cliente_dni}
              <br />CAI: <span style={{ fontFamily: 'monospace' }}>{facturaDetalle.cai_codigo}</span>
            </p>

            {cargandoDetalle ? (
              <p className="dt-loading">Cargando detalle...</p>
            ) : (
              <table className="dt-table" style={{ marginBottom: 16 }}>
                <thead>
                  <tr>
                    {['Tipo', 'Descripción', 'Cant.', 'Costo', 'Monto'].map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalleItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.tipo}</td>
                      <td>{item.descripcion}</td>
                      <td>{item.cantidad}</td>
                      <td>{fmtMonto(item.costo_unitario)}</td>
                      <td>{fmtMonto(item.monto_gravado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E8E6FF', fontSize: 16, fontWeight: 700, borderTop: '1px solid rgba(108,99,255,0.15)', paddingTop: 10 }}>
              <span>Total</span>
              <span>{fmtMonto(facturaDetalle.total)}</span>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(108,99,255,0.1)' }}>
              {facturaDetalle.metodo_pago ? (
                <p style={{ margin: 0, fontSize: 13, color: '#68D391' }}>
                  ✓ Pagada — método: <b style={{ textTransform: 'capitalize' }}>{facturaDetalle.metodo_pago}</b>
                </p>
              ) : (
                <form onSubmit={handleRegistrarPago} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  {errorPago && <div className="dt-field-error" style={{ width: '100%' }}>{errorPago}</div>}
                  <div style={{ flex: '1 1 200px' }}>
                    <label className="dt-label">Registrar cobro — método de pago</label>
                    <select
                      required
                      className="dt-select-field"
                      style={{ width: '100%' }}
                      value={metodoPago}
                      onChange={e => setMetodoPago(e.target.value)}
                    >
                      <option value="">Seleccionar método...</option>
                      {METODOS_PAGO.map(m => (
                        <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={registrandoPago} className="dt-btn dt-btn--primary">
                    {registrandoPago ? 'Registrando...' : 'Registrar pago'}
                  </button>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={cerrarDetalle} className="dt-btn dt-btn--secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
