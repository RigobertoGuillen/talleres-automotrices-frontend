import { useState, useEffect, useCallback } from 'react';
import reportesService from '../../services/reportesService';
import Paginacion from '../../components/clientes/Paginacion';
import { s, badgeEstadoOrden, fmtFecha } from './styles';

const POR_PAGINA = 8;
const ESTADOS = ['recibido', 'en reparacion', 'listo'];

export default function OrdenesPendientesTab() {
  const [estado, setEstado] = useState('');
  const [mecanicoId, setMecanicoId] = useState('');
  const [antiguedadMinima, setAntiguedadMinima] = useState(0);

  const [mecanicos, setMecanicos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    reportesService.mecanicosActivos()
      .then(res => setMecanicos(res.data.data || []))
      .catch(() => setMecanicos([]));
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await reportesService.ordenesPendientes({
        estado: estado || undefined,
        mecanico_id: mecanicoId || undefined,
        antiguedad_minima: antiguedadMinima || undefined,
      });
      setOrdenes(res.data.data || []);
      setPagina(1);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo generar el reporte de órdenes pendientes.');
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  }, [estado, mecanicoId, antiguedadMinima]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.max(1, Math.ceil(ordenes.length / POR_PAGINA));
  const ordenesPagina = ordenes.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div>
      <div style={s.filtrosBar}>
        <div>
          <label style={s.label}>Estado</label>
          <select style={{ ...s.input, minWidth: 160 }} value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Todos (no entregadas)</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Mecánico responsable</label>
          <select style={{ ...s.input, minWidth: 200 }} value={mecanicoId} onChange={e => setMecanicoId(e.target.value)}>
            <option value="">Todos</option>
            {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nombre_completo}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Antigüedad mínima (días)</label>
          <input
            type="number" min={0} style={{ ...s.input, width: 140 }}
            value={antiguedadMinima}
            onChange={e => setAntiguedadMinima(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={s.tarjeta('#dc2626')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Órdenes pendientes</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{ordenes.length}</p>
        </div>
      </div>

      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando órdenes pendientes...</p>
        ) : ordenes.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay órdenes pendientes con ese filtro.</p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Orden', 'Vehículo', 'Estado', 'Responsable', 'Ingreso', 'Antigüedad'].map(c => (
                  <th key={c} style={s.th}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenesPagina.map((o, i) => (
                <tr key={o.numero_orden} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}><b>{o.numero_orden}</b></td>
                  <td style={s.td}>{o.placa} · {o.modelo}</td>
                  <td style={s.td}><span style={badgeEstadoOrden(o.estado)}>{o.estado}</span></td>
                  <td style={s.td}>{o.mecanico_nombre || 'Sin asignar'}</td>
                  <td style={s.td}>{fmtFecha(o.fecha_ingreso)}</td>
                  <td style={s.td}>
                    <b style={{ color: o.antiguedad_dias >= 7 ? '#dc2626' : '#374151' }}>
                      {o.antiguedad_dias} día{o.antiguedad_dias !== 1 ? 's' : ''}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!cargando && ordenes.length > 0 && (
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          totalClientes={ordenes.length}
          onCambiarPagina={setPagina}
          entidad="orden"
        />
      )}
    </div>
  );
}
