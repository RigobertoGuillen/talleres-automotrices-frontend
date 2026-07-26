import { useState, useEffect, useCallback } from 'react';
import reportesService from '../../services/reportesService';
import { exportarPDF, exportarExcel } from '../../services/exportUtils';
import Paginacion from '../../components/clientes/Paginacion';
import { s, fmtFecha, fmtMoneda, rangoPorDefecto } from './styles';

const POR_PAGINA = 8;

const COLUMNAS_DETALLE = [
  { header: 'Orden', key: 'orden_id' },
  { header: 'Servicio', key: 'servicio_nombre' },
  { header: 'Mecánico', key: 'mecanico_nombre' },
  { header: 'Precio aplicado', key: 'precio_aplicado' },
  { header: 'Fecha', key: 'fecha_registro' },
];

export default function ServiciosTab() {
  const defecto = rangoPorDefecto();
  const [fechaInicio, setFechaInicio] = useState(defecto.fechaInicio);
  const [fechaFin, setFechaFin] = useState(defecto.fechaFin);

  const [detalle, setDetalle] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [cantidadTotal, setCantidadTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await reportesService.servicios(fechaInicio, fechaFin);
      setDetalle(res.data.data.detalle || []);
      setResumen(res.data.data.resumen || []);
      setCantidadTotal(res.data.data.cantidad_total || 0);
      setPagina(1);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo generar el reporte de servicios.');
      setDetalle([]);
      setResumen([]);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.max(1, Math.ceil(detalle.length / POR_PAGINA));
  const detallePagina = detalle.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const ingresoTotal = detalle.reduce((acc, d) => acc + (Number(d.precio_aplicado) || 0), 0);

  const filaExport = detalle.map(d => ({
    ...d,
    fecha_registro: fmtFecha(d.fecha_registro),
    precio_aplicado: fmtMoneda(d.precio_aplicado),
  }));

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
        <div style={{ flex: 1 }} />
        <button
          style={s.btnExportar('#16a34a')}
          disabled={detalle.length === 0}
          onClick={() => exportarExcel({
            columnas: COLUMNAS_DETALLE, filas: filaExport,
            nombreArchivo: `servicios_${fechaInicio}_${fechaFin}`, nombreHoja: 'Servicios'
          })}
        >
          Exportar Excel
        </button>
        <button
          style={s.btnExportar('#dc2626')}
          disabled={detalle.length === 0}
          onClick={() => exportarPDF({
            titulo: 'Reporte de servicios realizados',
            subtitulo: `Del ${fmtFecha(fechaInicio)} al ${fmtFecha(fechaFin)}`,
            columnas: COLUMNAS_DETALLE, filas: filaExport,
            nombreArchivo: `servicios_${fechaInicio}_${fechaFin}`
          })}
        >
          Exportar PDF
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={s.tarjeta('#2563eb')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Servicios realizados</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{cantidadTotal}</p>
        </div>
        <div style={s.tarjeta('#16a34a')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Ingreso generado</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{fmtMoneda(ingresoTotal)}</p>
        </div>
      </div>

      {resumen.length > 0 && (
        <div className="module" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <table style={s.tabla}>
            <thead>
              <tr>{['Servicio', 'Cantidad realizada', 'Total generado'].map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {resumen.map((r, i) => (
                <tr key={r.servicio_id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}><b>{r.servicio_nombre}</b></td>
                  <td style={s.td}>{r.cantidad_realizada}</td>
                  <td style={s.td}>{fmtMoneda(r.total_generado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Generando reporte...</p>
        ) : detalle.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay servicios registrados en ese período.</p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>{COLUMNAS_DETALLE.map(c => <th key={c.key} style={s.th}>{c.header}</th>)}</tr>
            </thead>
            <tbody>
              {detallePagina.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}>{d.orden_id}</td>
                  <td style={s.td}>{d.servicio_nombre}</td>
                  <td style={s.td}>{d.mecanico_nombre || '—'}</td>
                  <td style={s.td}>{fmtMoneda(d.precio_aplicado)}</td>
                  <td style={s.td}>{fmtFecha(d.fecha_registro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!cargando && detalle.length > 0 && (
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          totalClientes={detalle.length}
          onCambiarPagina={setPagina}
          entidad="registro"
        />
      )}
    </div>
  );
}
