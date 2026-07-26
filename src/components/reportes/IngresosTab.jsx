import { useState, useEffect, useCallback } from 'react';
import reportesService from '../../services/reportesService';
import { exportarPDF, exportarExcel } from '../../services/exportUtils';
import { s, fmtFecha, fmtMoneda, rangoPorDefecto, BarraSVG } from './styles';

const COLUMNAS = [
  { header: 'Fecha', key: 'periodo' },
  { header: 'Facturas', key: 'facturas' },
  { header: 'Subtotal', key: 'subtotal' },
  { header: 'Impuesto', key: 'impuesto' },
  { header: 'Total', key: 'total' },
];

export default function IngresosTab() {
  const defecto = rangoPorDefecto();
  const [fechaInicio, setFechaInicio] = useState(defecto.fechaInicio);
  const [fechaFin, setFechaFin] = useState(defecto.fechaFin);

  const [porDia, setPorDia] = useState([]);
  const [totales, setTotales] = useState(null);
  const [porMetodoPago, setPorMetodoPago] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await reportesService.ingresos(fechaInicio, fechaFin);
      setPorDia(res.data.data.por_dia || []);
      setTotales(res.data.data.totales || null);
      setPorMetodoPago(res.data.data.por_metodo_pago || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo generar el reporte de ingresos.');
      setPorDia([]);
      setTotales(null);
      setPorMetodoPago([]);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const filaExport = porDia.map(d => ({
    ...d,
    periodo: fmtFecha(d.periodo),
    subtotal: fmtMoneda(d.subtotal),
    impuesto: fmtMoneda(d.impuesto),
    total: fmtMoneda(d.total),
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
  style={s.btnExportar('#dc2626')}
  disabled={porDia.length === 0}
  onClick={() => exportarPDF({
    columnas: COLUMNAS, filas: filaExport,
    nombreArchivo: `ingresos_${fechaInicio}_${fechaFin}`, titulo: 'Reporte de Ingresos'
  })}
>
  Exportar PDF
</button>
<button
  style={s.btnExportar('#16a34a')}
  disabled={porDia.length === 0}
  onClick={() => exportarExcel({
    columnas: COLUMNAS, filas: filaExport,
    nombreArchivo: `ingresos_${fechaInicio}_${fechaFin}`, nombreHoja: 'Ingresos'
  })}
>
  Exportar Excel
</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {cargando ? (
        <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Generando reporte...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={s.tarjeta('#2563eb')}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Facturas emitidas</p>
              <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{totales?.facturas || 0}</p>
            </div>
            <div style={s.tarjeta('#16a34a')}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Ingreso total del período</p>
              <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{fmtMoneda(totales?.total)}</p>
            </div>
            <div style={s.tarjeta('#f59e0b')}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Impuesto cobrado</p>
              <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{fmtMoneda(totales?.impuesto)}</p>
            </div>
          </div>

          {porDia.length === 0 ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay ingresos registrados en ese período.</p>
          ) : (
            <>
              <div className="module" style={{ marginBottom: 16, padding: 20 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#111827' }}>Ingresos por día</p>
                <BarraSVG datos={porDia} campoEtiqueta="periodo" campoValor="total" color="#16a34a" />
              </div>

              {porMetodoPago.length > 0 && (
                <div className="module" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
                  <table style={s.tabla}>
                    <thead>
                      <tr>{['Método de pago', 'Facturas', 'Total'].map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {porMetodoPago.map((m, i) => (
                        <tr key={m.metodo_pago} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                          <td style={s.td}>{m.metodo_pago}</td>
                          <td style={s.td}>{m.facturas}</td>
                          <td style={s.td}>{fmtMoneda(m.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
                <table style={s.tabla}>
                  <thead>
                    <tr>{COLUMNAS.map(c => <th key={c.key} style={s.th}>{c.header}</th>)}</tr>
                  </thead>
                  <tbody>
                    {porDia.map((d, i) => (
                      <tr key={d.periodo} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={s.td}>{fmtFecha(d.periodo)}</td>
                        <td style={s.td}>{d.facturas}</td>
                        <td style={s.td}>{fmtMoneda(d.subtotal)}</td>
                        <td style={s.td}>{fmtMoneda(d.impuesto)}</td>
                        <td style={s.td}><b>{fmtMoneda(d.total)}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
