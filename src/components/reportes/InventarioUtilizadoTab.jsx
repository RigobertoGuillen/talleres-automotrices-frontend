import { useState, useEffect, useCallback } from 'react';
import reportesService from '../../services/reportesService';
import { exportarPDF, exportarExcel } from '../../services/exportUtils';
import Paginacion from '../../components/clientes/Paginacion';
import { s, fmtFecha, rangoPorDefecto } from './styles';

const POR_PAGINA = 8;

const COLUMNAS = [
  { header: 'Fecha', key: 'fecha_hora' },
  { header: 'Código', key: 'codigo' },
  { header: 'Repuesto', key: 'repuesto_nombre' },
  { header: 'Categoría', key: 'categoria_nombre' },
  { header: 'Cantidad', key: 'cantidad' },
  { header: 'Orden', key: 'orden_id' },
  { header: 'Usuario', key: 'usuario_nombre' },
];

export default function InventarioUtilizadoTab() {
  const defecto = rangoPorDefecto();
  const [fechaInicio, setFechaInicio] = useState(defecto.fechaInicio);
  const [fechaFin, setFechaFin] = useState(defecto.fechaFin);

  const [detalle, setDetalle] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await reportesService.inventarioUtilizado(fechaInicio, fechaFin);
      setDetalle(res.data.data.detalle || []);
      setResumen(res.data.data.resumen || []);
      setPagina(1);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo generar el reporte de inventario utilizado.');
      setDetalle([]);
      setResumen([]);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.max(1, Math.ceil(detalle.length / POR_PAGINA));
  const detallePagina = detalle.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const totalUnidades = resumen.reduce((acc, r) => acc + (Number(r.cantidad_consumida) || 0), 0);

  const filaExport = detalle.map(d => ({ ...d, fecha_hora: fmtFecha(d.fecha_hora) }));

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
            columnas: COLUMNAS, filas: filaExport,
            nombreArchivo: `inventario_utilizado_${fechaInicio}_${fechaFin}`, nombreHoja: 'Inventario utilizado'
          })}
        >
          Exportar Excel
        </button>
        <button
          style={s.btnExportar('#dc2626')}
          disabled={detalle.length === 0}
          onClick={() => exportarPDF({
            titulo: 'Reporte de inventario utilizado',
            subtitulo: `Del ${fmtFecha(fechaInicio)} al ${fmtFecha(fechaFin)}`,
            columnas: COLUMNAS, filas: filaExport,
            nombreArchivo: `inventario_utilizado_${fechaInicio}_${fechaFin}`
          })}
        >
          Exportar PDF
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={s.tarjeta('#2563eb')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Repuestos distintos consumidos</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{resumen.length}</p>
        </div>
        <div style={s.tarjeta('#dc2626')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Unidades totales consumidas</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{totalUnidades}</p>
        </div>
      </div>

      {resumen.length > 0 && (
        <div className="module" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <table style={s.tabla}>
            <thead>
              <tr>{['Código', 'Repuesto', 'Cantidad consumida', 'Movimientos'].map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {resumen.map((r, i) => (
                <tr key={r.repuesto_id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}><b>{r.codigo}</b></td>
                  <td style={s.td}>{r.repuesto_nombre}</td>
                  <td style={s.td}>{r.cantidad_consumida}</td>
                  <td style={s.td}>{r.movimientos}</td>
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
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay consumo de repuestos en ese período.</p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>{COLUMNAS.map(c => <th key={c.key} style={s.th}>{c.header}</th>)}</tr>
            </thead>
            <tbody>
              {detallePagina.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}>{fmtFecha(d.fecha_hora)}</td>
                  <td style={s.td}>{d.codigo}</td>
                  <td style={s.td}>{d.repuesto_nombre}</td>
                  <td style={s.td}>{d.categoria_nombre || '—'}</td>
                  <td style={s.td}>{d.cantidad}</td>
                  <td style={s.td}>{d.orden_id || '—'}</td>
                  <td style={s.td}>{d.usuario_nombre || '—'}</td>
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
          entidad="movimiento"
        />
      )}
    </div>
  );
}
