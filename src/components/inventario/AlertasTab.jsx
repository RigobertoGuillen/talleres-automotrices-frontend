import { useState, useEffect, useCallback } from 'react';
import inventarioService from '../../services/inventarioService';
import { s } from './styles';
import Paginacion from '../../components/clientes/Paginacion';

const POR_PAGINA = 8;

const tarjeta = (color) => ({
  background: '#fff', border: `1px solid ${color}30`, borderRadius: 12,
  padding: '16px 20px', flex: 1, minWidth: 160,
});

export default function AlertasTab() {
  const [alertas, setAlertas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await inventarioService.alertasStock();
      setAlertas(res.data.data);
    } catch {
      setError('No se pudieron cargar las alertas de stock.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) return <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando alertas...</p>;
  if (error) return <p style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</p>;
  if (!alertas || alertas.total === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button onClick={cargar} style={s.btnSecundario}>Actualizar</button>
        </div>
        <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          No hay repuestos por debajo de su stock mínimo. Todo en orden.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
          {alertas.total} repuesto(s) en o por debajo de su stock mínimo.
        </p>
        <button onClick={cargar} style={s.btnSecundario}>Actualizar</button>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={tarjeta('#dc2626')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#991b1b', textTransform: 'uppercase' }}>Críticas (sin stock)</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#991b1b' }}>{alertas.criticas.length}</p>
        </div>
        <div style={tarjeta('#f59e0b')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#92400e', textTransform: 'uppercase' }}>Medias</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#92400e' }}>{alertas.medias.length}</p>
        </div>
        <div style={tarjeta('#6b7280')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>Cerca del mínimo</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#374151' }}>{alertas.normales.length}</p>
        </div>
      </div>

      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        <table style={s.tabla}>
          <thead>
            <tr>{['Código', 'Nombre', 'Disponible', 'Mínimo'].map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {alertas.todas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA).map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={s.td}><b>{r.codigo}</b></td>
                <td style={s.td}>{r.nombre}</td>
                <td style={{ ...s.td, color: r.cantidad_disponible === 0 ? '#dc2626' : '#92400e', fontWeight: 700 }}>
                  {r.cantidad_disponible}
                </td>
                <td style={s.td}>{r.cantidad_minima}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={Math.max(1, Math.ceil(alertas.todas.length / POR_PAGINA))}
        totalClientes={alertas.todas.length}
        onCambiarPagina={setPaginaActual}
        entidad="alerta"
      />
    </div>
  );
}
