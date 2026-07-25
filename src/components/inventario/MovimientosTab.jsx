import { useState, useEffect, useCallback } from 'react';
import inventarioService from '../../services/inventarioService';
import { s, badgeTipoMovimiento } from './styles';
import Paginacion from '../../components/clientes/Paginacion';

const POR_PAGINA = 8;

const FORM_VACIO = { repuesto_id: '', tipo_movimiento: 'entrada', cantidad: '', motivo: '', orden_id: '' };

// `prefill` llega cuando el administrador viene desde la pestaña Solicitudes
// con "Registrar salida" — precarga repuesto, cantidad, orden y tipo=salida.
// `onPrefillConsumido` avisa al padre que ya se aplicó, para no reaplicarlo
// en cada render.
export default function MovimientosTab({ prefill, onPrefillConsumido }) {
  const [movimientos, setMovimientos] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [filtroRepuesto, setFiltroRepuesto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [avisoStock, setAvisoStock] = useState('');

  const cargarMovimientos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = filtroRepuesto
        ? await inventarioService.movimientosPorRepuesto(filtroRepuesto)
        : await inventarioService.listarMovimientos({ limit: 200 });
      setMovimientos(res.data.data || []);
    } catch {
      setError('No se pudo cargar el historial de movimientos.');
    } finally {
      setCargando(false);
    }
  }, [filtroRepuesto]);

  useEffect(() => {
    inventarioService.listarRepuestos()
      .then(res => setRepuestos(res.data.data || []))
      .catch(() => setRepuestos([]));
  }, []);

  useEffect(() => { cargarMovimientos(); }, [cargarMovimientos]);

  useEffect(() => {
    if (!prefill) return;
    setForm({
      repuesto_id: prefill.repuesto_id ?? '',
      tipo_movimiento: prefill.tipo_movimiento || 'salida',
      cantidad: prefill.cantidad ?? '',
      motivo: prefill.motivo || '',
      orden_id: prefill.orden_id || '',
    });
    onPrefillConsumido?.();
  }, [prefill, onPrefillConsumido]);

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroTipo && m.tipo_movimiento !== filtroTipo) return false;
    return true;
  });

  useEffect(() => { setPaginaActual(1); }, [filtroRepuesto, filtroTipo]);

  const totalPaginas = Math.max(1, Math.ceil(movimientosFiltrados.length / POR_PAGINA));
  const movimientosPagina = movimientosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorForm('');
    setAvisoStock('');
    try {
      const res = await inventarioService.crearMovimiento({
        repuesto_id: Number(form.repuesto_id),
        tipo_movimiento: form.tipo_movimiento,
        cantidad: Number(form.cantidad),
        motivo: form.motivo || undefined,
        orden_id: form.orden_id || undefined,
      });
      const stock = res.data.data?.stock;
      if (stock) {
        setAvisoStock(`Movimiento registrado. Nueva existencia: ${stock.cantidad_disponible} unidades.`);
      }
      setForm(FORM_VACIO);
      cargarMovimientos();
    } catch (err) {
      setErrorForm(err.response?.data?.message || 'Error al registrar el movimiento.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="module" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Registrar movimiento</h3>

        {errorForm && <div style={s.errorBox}>{errorForm}</div>}
        {avisoStock && (
          <div style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {avisoStock}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={s.label}>Repuesto *</label>
              <select style={s.input} required
                value={form.repuesto_id} onChange={e => setForm(f => ({ ...f, repuesto_id: e.target.value }))}>
                <option value="">Seleccionar repuesto</option>
                {repuestos.map(r => (
                  <option key={r.id} value={r.id}>{r.codigo} — {r.nombre} (disp: {r.cantidad_disponible})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={s.label}>Tipo *</label>
              <select style={s.input} required
                value={form.tipo_movimiento} onChange={e => setForm(f => ({ ...f, tipo_movimiento: e.target.value }))}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Cantidad *</label>
              <input style={s.input} type="number" required min={1}
                value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
            </div>
            <div>
              <label style={s.label}>Orden (opcional)</label>
              <input style={s.input} placeholder="Ej: ORD-1"
                value={form.orden_id} onChange={e => setForm(f => ({ ...f, orden_id: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={s.label}>Motivo</label>
              <input style={s.input} placeholder="Ej: Compra a proveedor"
                value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
            </div>
            <button type="submit" disabled={guardando} style={{ ...s.btnPrimario, opacity: guardando ? 0.6 : 1, height: 38 }}>
              {guardando ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={{ ...s.input, maxWidth: 260 }} value={filtroRepuesto} onChange={e => setFiltroRepuesto(e.target.value)}>
          <option value="">Todos los repuestos</option>
          {repuestos.map(r => <option key={r.id} value={r.id}>{r.codigo} — {r.nombre}</option>)}
        </select>
        <select style={{ ...s.input, maxWidth: 180 }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Entradas y salidas</option>
          <option value="entrada">Solo entradas</option>
          <option value="salida">Solo salidas</option>
        </select>
      </div>

      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando movimientos...</p>
        ) : error ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</p>
        ) : movimientosFiltrados.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay movimientos registrados.</p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Fecha', 'Repuesto', 'Tipo', 'Cantidad', 'Orden', 'Motivo', 'Usuario'].map(col => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movimientosPagina.map((m, i) => (
                <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}>{m.fecha_hora ? new Date(m.fecha_hora).toLocaleString('es-HN') : '—'}</td>
                  <td style={s.td}>{m.repuesto_nombre || '—'}</td>
                  <td style={s.td}><span style={badgeTipoMovimiento(m.tipo_movimiento)}>{m.tipo_movimiento}</span></td>
                  <td style={s.td}>{m.cantidad}</td>
                  <td style={s.td}>{m.orden_id || '—'}</td>
                  <td style={s.td}>{m.motivo || '—'}</td>
                  <td style={s.td}>{m.usuario_nombre || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalClientes={movimientosFiltrados.length}
        onCambiarPagina={setPaginaActual}
        entidad="movimiento"
      />
    </div>
  );
}
