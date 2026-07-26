import { useState, useEffect, useCallback } from 'react';
import reportesService from '../../services/reportesService';
import { exportarPDF, exportarExcel } from '../../services/exportUtils';
import Paginacion from '../../components/clientes/Paginacion';
import { s, badgeTipoVehiculo, fmtFecha, rangoPorDefecto, BarraSVG } from './styles';

const POR_PAGINA = 8;

const COLUMNAS = [
  { header: 'Placa', key: 'placa' },
  { header: 'Marca', key: 'marca' },
  { header: 'Modelo', key: 'modelo' },
  { header: 'Año', key: 'anio' },
  { header: 'Tipo', key: 'tipo' },
  { header: 'Cliente', key: 'cliente' },
  { header: 'Órdenes', key: 'total_ordenes' },
  { header: 'Última visita', key: 'ultima_visita' },
];

export default function VehiculosAtendidosTab() {
  const defecto = rangoPorDefecto();
  const [fechaInicio, setFechaInicio] = useState(defecto.fechaInicio);
  const [fechaFin, setFechaFin] = useState(defecto.fechaFin);

  const [detalle, setDetalle] = useState([]);
  const [porTipo, setPorTipo] = useState([]);
  const [cantidad, setCantidad] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await reportesService.vehiculosAtendidos(fechaInicio, fechaFin);
      setDetalle(res.data.data.detalle || []);
      setPorTipo(res.data.data.por_tipo || []);
      setCantidad(res.data.data.cantidad_vehiculos || 0);
      setPagina(1);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo generar el reporte de vehículos atendidos.');
      setDetalle([]);
      setPorTipo([]);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.max(1, Math.ceil(detalle.length / POR_PAGINA));
  const detallePagina = detalle.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const filaExport = detalle.map(v => ({
    ...v,
    marca: v.marca, // ya viene aplanado del backend
    cliente: [v.primer_nombre, v.primer_apellido].filter(Boolean).join(' '),
    ultima_visita: fmtFecha(v.ultima_visita),
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
            columnas: COLUMNAS, filas: filaExport,
            nombreArchivo: `vehiculos_atendidos_${fechaInicio}_${fechaFin}`, nombreHoja: 'Vehículos'
          })}
        >
          Exportar Excel
        </button>
        <button
          style={s.btnExportar('#dc2626')}
          disabled={detalle.length === 0}
          onClick={() => exportarPDF({
            titulo: 'Reporte de vehículos atendidos',
            subtitulo: `Período: ${fmtFecha(fechaInicio)} — ${fmtFecha(fechaFin)}`,
            columnas: COLUMNAS, filas: filaExport,
            nombreArchivo: `vehiculos_atendidos_${fechaInicio}_${fechaFin}`
          })}
        >
          Exportar PDF
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={s.tarjeta('#2563eb')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Período seleccionado</p>
          <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 700, color: '#111827' }}>
            {fmtFecha(fechaInicio)} — {fmtFecha(fechaFin)}
          </p>
        </div>
        <div style={s.tarjeta('#16a34a')}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Vehículos atendidos</p>
          <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, color: '#111827' }}>{cantidad}</p>
        </div>
      </div>

      {porTipo.length > 0 && (
        <div className="module" style={{ marginBottom: 16, padding: 20 }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#111827' }}>Clasificación por tipo</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <BarraSVG datos={porTipo} campoEtiqueta="tipo" campoValor="total_ordenes" color="#2563eb" />
            <table style={{ ...s.tabla, maxWidth: 320 }}>
              <thead>
                <tr>{['Tipo', 'Vehículos', 'Órdenes'].map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {porTipo.map((t, i) => (
                  <tr key={t.tipo} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={s.td}><span style={badgeTipoVehiculo(t.tipo)}>{t.tipo}</span></td>
                    <td style={s.td}>{t.vehiculos_distintos}</td>
                    <td style={s.td}>{t.total_ordenes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Generando reporte...</p>
        ) : detalle.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay vehículos atendidos en ese período.</p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Placa', 'Marca', 'Modelo', 'Año', 'Tipo', 'Cliente', 'Órdenes', 'Última visita'].map(c => (
                  <th key={c} style={s.th}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detallePagina.map((v, i) => (
                <tr key={v.vehiculo_id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}><b>{v.placa}</b></td>
                  <td style={s.td}>{v.marca}</td>
                  <td style={s.td}>{v.modelo}</td>
                  <td style={s.td}>{v.anio}</td>
                  <td style={s.td}><span style={badgeTipoVehiculo(v.tipo)}>{v.tipo}</span></td>
                  <td style={s.td}>{[v.primer_nombre, v.primer_apellido].filter(Boolean).join(' ')}</td>
                  <td style={s.td}>{v.total_ordenes}</td>
                  <td style={s.td}>{fmtFecha(v.ultima_visita)}</td>
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
          entidad="vehículo"
        />
      )}
    </div>
  );
}
