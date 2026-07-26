import { useState, useEffect, useCallback } from 'react';
import reportesService from '../../services/reportesService';
import { exportarExcel } from '../../services/exportUtils';
import { s, fmtFecha, rangoPorDefecto } from './styles';

const COLUMNAS = [
  { header: 'Mecánico', key: 'mecanico_nombre' },
  { header: 'Órdenes asignadas', key: 'ordenes_asignadas' },
  { header: 'Órdenes completadas', key: 'ordenes_completadas' },
  { header: 'Servicios realizados', key: 'servicios_realizados' },
];

export default function MecanicosTab() {
  const defecto = rangoPorDefecto();
  const [fechaInicio, setFechaInicio] = useState(defecto.fechaInicio);
  const [fechaFin, setFechaFin] = useState(defecto.fechaFin);
  const [mecanicoId, setMecanicoId] = useState('');

  const [mecanicos, setMecanicos] = useState([]);
  const [reporte, setReporte] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportesService.mecanicosActivos()
      .then(res => setMecanicos(res.data.data || []))
      .catch(() => setMecanicos([]));
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await reportesService.reporteMecanicos(fechaInicio, fechaFin, mecanicoId);
      setReporte(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo generar el reporte por mecánico.');
      setReporte([]);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin, mecanicoId]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div>
      <div style={s.filtrosBar}>
        <div>
          <label style={s.label}>Desde</label>
          <input type="date" style={s.input} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Hasta</label>
          <input type="date" style={s.input} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Mecánico</label>
          <select style={{ ...s.input, minWidth: 200 }} value={mecanicoId} onChange={e => setMecanicoId(e.target.value)}>
            <option value="">Todos los mecánicos</option>
            {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nombre_completo}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={s.btnExportar('#16a34a')}
          disabled={reporte.length === 0}
          onClick={() => exportarExcel({
            columnas: COLUMNAS, filas: reporte,
            nombreArchivo: `reporte_mecanicos_${fechaInicio}_${fechaFin}`, nombreHoja: 'Por mecánico'
          })}
        >
          Exportar Excel
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>
        Período: {fmtFecha(fechaInicio)} — {fmtFecha(fechaFin)}
      </p>

      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Generando reporte...</p>
        ) : reporte.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay mecánicos activos para mostrar.</p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>{COLUMNAS.map(c => <th key={c.key} style={s.th}>{c.header}</th>)}</tr>
            </thead>
            <tbody>
              {reporte.map((m, i) => (
                <tr key={m.mecanico_id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}><b>{m.mecanico_nombre}</b></td>
                  <td style={s.td}>{m.ordenes_asignadas}</td>
                  <td style={s.td}>{m.ordenes_completadas}</td>
                  <td style={s.td}>{m.servicios_realizados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
