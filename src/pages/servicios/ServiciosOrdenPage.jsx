import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrdenes, getOrdenesByMecanico } from '../../services/ordenesService';
import diagnosticoService from '../../services/diagnosticoService';
import ServiciosOrden from '../../components/servicios/ServiciosOrden';
import '../../styles/dashboard-dark.css';

const badgeEstadoDiagnostico = (estado) => {
  const m = {
    pendiente: ['rgba(108,99,255,0.12)', '#9B8FFF'],
    'en proceso': ['rgba(251,191,36,0.12)', '#FBD000'],
    completado: ['rgba(72,187,120,0.12)', '#68D391'],
  };
  const [bg, color] = m[estado] || ['rgba(160,160,160,0.1)', '#888'];
  return { background: bg, color };
};

function fmtFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-SV', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ServiciosOrdenPage() {
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const [diagnosticos, setDiagnosticos] = useState([]);
  const [cargandoDiagnosticos, setCargandoDiagnosticos] = useState(false);

  const cargarOrdenes = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = user?.rol === 'mecanico'
        ? await getOrdenesByMecanico(user.id)
        : await getOrdenes();
      setOrdenes(data || []);
    } catch {
      setError('No se pudo cargar la lista de órdenes.');
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]);

  useEffect(() => {
    if (!ordenSeleccionada) {
      setDiagnosticos([]);
      return;
    }
    setCargandoDiagnosticos(true);
    diagnosticoService.porOrden(ordenSeleccionada.numero_orden)
      .then(res => setDiagnosticos(res.data.data || []))
      .catch(() => setDiagnosticos([]))
      .finally(() => setCargandoDiagnosticos(false));
  }, [ordenSeleccionada]);

  return (
    <div className="dt-page">
      <div className="dt-header">
        <div className="dt-header__left">
          <h1>Servicios de Orden</h1>
          <p>Aplica o quita servicios del catálogo en una orden de trabajo</p>
        </div>
      </div>

      <div className="dt-filters">
        <select
          className="dt-select"
          style={{ flex: 1 }}
          value={ordenSeleccionada?.numero_orden || ''}
          onChange={e => {
            const orden = ordenes.find(o => o.numero_orden === e.target.value);
            setOrdenSeleccionada(orden || null);
          }}
        >
          <option value="">
            {cargando ? 'Cargando órdenes...' : 'Seleccionar orden de trabajo...'}
          </option>
          {ordenes.map(o => (
            <option key={o.id} value={o.numero_orden}>
              #{o.numero_orden} — {o.cliente_nombre ?? '—'}{o.placa ? ` · ${o.placa}` : ''}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="dt-error">{error}</div>}

      {!cargando && !error && ordenes.length === 0 && (
        <p className="dt-empty">No hay órdenes de trabajo disponibles.</p>
      )}

      {ordenSeleccionada ? (
        <>
          <p style={{ margin: '0 0 16px', color: '#7B7A9E', fontSize: 13 }}>
            Orden <b style={{ color: '#E8E6FF' }}>#{ordenSeleccionada.numero_orden}</b>
            {ordenSeleccionada.cliente_nombre && <> · {ordenSeleccionada.cliente_nombre}</>}
            {ordenSeleccionada.placa && <> · {ordenSeleccionada.placa}</>}
          </p>

          <h2 style={{ margin: '0 0 12px', color: '#E8E6FF', fontSize: 15, fontWeight: 700 }}>
            Historial de diagnóstico
          </h2>
          <div className="dt-table-card" style={{ marginBottom: 24 }}>
            {cargandoDiagnosticos ? (
              <p className="dt-loading">Cargando diagnósticos...</p>
            ) : diagnosticos.length === 0 ? (
              <p className="dt-empty">Esta orden no tiene diagnósticos registrados.</p>
            ) : (
              <table className="dt-table">
                <thead>
                  <tr>
                    {['Falla', 'Observaciones', 'Recomendaciones', 'Estado', 'Mecánico', 'Registrado'].map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {diagnosticos.map(d => (
                    <tr key={d.id}>
                      <td style={{ maxWidth: 200 }}>{d.descripcion_falla}</td>
                      <td style={{ maxWidth: 200 }}>{d.observaciones || '—'}</td>
                      <td style={{ maxWidth: 220 }}>{d.recomendaciones || '—'}</td>
                      <td><span className="dt-badge" style={badgeEstadoDiagnostico(d.estado)}>{d.estado}</span></td>
                      <td>{d.mecanico || '—'}</td>
                      <td>{fmtFecha(d.fecha_registro)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <h2 style={{ margin: '0 0 12px', color: '#E8E6FF', fontSize: 15, fontWeight: 700 }}>
            Servicios aplicados
          </h2>
          <div className="dt-table-card" style={{ padding: 16 }}>
            <ServiciosOrden ordenId={ordenSeleccionada.numero_orden} />
          </div>
        </>
      ) : (
        !cargando && ordenes.length > 0 && (
          <p className="dt-empty">Selecciona una orden para ver su diagnóstico y gestionar sus servicios.</p>
        )
      )}
    </div>
  );
}
