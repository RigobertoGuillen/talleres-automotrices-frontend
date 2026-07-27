import { useState, useEffect, useCallback } from 'react';
import inventarioService from '../../services/inventarioService';
import { s, btnAccion } from './styles';
import Paginacion from '../../components/clientes/Paginacion';
import { useAuth } from '../../context/AuthContext';
import { getOrdenesByMecanico } from '../../services/ordenesService';

const POR_PAGINA = 8;

const FORM_VACIO = { orden_id: '', repuesto_id: '', cantidad_solicitada: '' };

// NOTA: solicitudes_repuestos no tiene columnas de estado (no se puede
// alterar el esquema), así que aquí no hay "aprobar" ni "rechazar": la
// solicitud es un registro informativo de qué pidió el mecánico. El
// administrador, tras revisarla, registra la salida real en la pestaña
// Kardex —el botón "Registrar salida" de abajo lo lleva directo ahí con
// el repuesto, la cantidad y la orden ya prellenados.
export default function SolicitudesTab({ esAdministrador, esMecanico, onRegistrarSalida }) {
  const { user } = useAuth();
  const [repuestos, setRepuestos] = useState([]);
  const [ordenesAsignadas, setOrdenesAsignadas] = useState([]);

  

  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [avisoForm, setAvisoForm] = useState('');

  const [ordenConsulta, setOrdenConsulta] = useState('');
  const [solicitudesOrden, setSolicitudesOrden] = useState(null);

  const [recientes, setRecientes] = useState([]);
  const [cargandoRecientes, setCargandoRecientes] = useState(false);
  const [errorRecientes, setErrorRecientes] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    if (!esMecanico || !user?.id) return;
    getOrdenesByMecanico(user.id)
      .then(data => setOrdenesAsignadas((data || []).filter(o => o.estado !== 'entregado')))
      .catch(() => setOrdenesAsignadas([]));
  }, [esMecanico, user?.id]);

  useEffect(() => {
    inventarioService.listarRepuestos()
      .then(res => setRepuestos(res.data.data || []))
      .catch(() => setRepuestos([]));
  }, []);

  const cargarRecientes = useCallback(async () => {
    if (!esAdministrador) return;
    setCargandoRecientes(true);
    setErrorRecientes('');
    try {
      const res = await inventarioService.solicitudesRecientes();
      setRecientes(res.data.data || []);
    } catch {
      setErrorRecientes('No se pudieron cargar las solicitudes recientes.');
    } finally {
      setCargandoRecientes(false);
    }
  }, [esAdministrador]);

  useEffect(() => { cargarRecientes(); }, [cargarRecientes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorForm('');
    setAvisoForm('');
    try {
      const res = await inventarioService.crearSolicitud({
        orden_id: form.orden_id.trim(),
        repuesto_id: Number(form.repuesto_id),
        cantidad_solicitada: Number(form.cantidad_solicitada),
      });
      setAvisoForm(`Solicitud #${res.data.data.id} registrada. El administrador la verá para preparar la salida.`);
      setForm(FORM_VACIO);
      cargarRecientes();
    } catch (err) {
      setErrorForm(err.response?.data?.message || 'Error al crear la solicitud.');
    } finally {
      setGuardando(false);
    }
  };

  const consultarOrden = async (e) => {
    e.preventDefault();
    if (!ordenConsulta.trim()) return;
    try {
      const res = await inventarioService.solicitudesPorOrden(ordenConsulta.trim());
      setSolicitudesOrden(res.data.data || []);
    } catch {
      setSolicitudesOrden([]);
    }
  };

  return (
    <div>
      {esMecanico && (
        <div className="module" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Solicitar repuesto</h3>
          {errorForm && <div style={s.errorBox}>{errorForm}</div>}
          {avisoForm && (
            <div style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {avisoForm}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={s.label}>Orden de trabajo *</label>
                <select style={s.input} required
                  value={form.orden_id} onChange={e => setForm(f => ({ ...f, orden_id: e.target.value }))}>
                  <option value="">Seleccionar orden</option>
                  {ordenesAsignadas.map(o => (
                    <option key={o.numero_orden} value={o.numero_orden}>
                      {o.numero_orden} — {o.placa ?? '—'} ({o.cliente_nombre ?? 'sin cliente'})
                    </option>
                  ))}
                </select>
              </div>
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
                <label style={s.label}>Cantidad *</label>
                <input style={s.input} type="number" required min={1}
                  value={form.cantidad_solicitada} onChange={e => setForm(f => ({ ...f, cantidad_solicitada: e.target.value }))} />
              </div>
              <button type="submit" disabled={guardando} style={{ ...s.btnPrimario, opacity: guardando ? 0.6 : 1, height: 38 }}>
                {guardando ? 'Enviando...' : 'Solicitar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="module" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Consultar solicitudes por orden</h3>
        <form onSubmit={consultarOrden} style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...s.input, maxWidth: 240 }} placeholder="Número de orden (Ej: ORD-1)"
            value={ordenConsulta} onChange={e => setOrdenConsulta(e.target.value)} />
          <button type="submit" style={s.btnSecundario}>Buscar</button>
        </form>
        {solicitudesOrden && (
          solicitudesOrden.length === 0 ? (
            <p style={{ marginTop: 14, fontSize: 13, color: '#9ca3af' }}>Esa orden no tiene solicitudes registradas.</p>
          ) : (
            <table style={{ ...s.tabla, marginTop: 14 }}>
              <thead>
                <tr>{['Repuesto', 'Cantidad', 'Fecha'].map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {solicitudesOrden.map(sol => (
                  <tr key={sol.id}>
                    <td style={s.td}>{sol.repuesto_codigo} — {sol.repuesto_nombre}</td>
                    <td style={s.td}>{sol.cantidad_solicitada}</td>
                    <td style={s.td}>{sol.fecha_solicitud ? new Date(sol.fecha_solicitud).toLocaleString('es-HN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {esAdministrador && (
        <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Solicitudes recientes</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
              Registro informativo de los últimos pedidos. Usa "Registrar salida" para descontar el stock en el Kardex.
            </p>
          </div>
          {errorRecientes && <div style={{ ...s.errorBox, margin: 16 }}>{errorRecientes}</div>}
          {cargandoRecientes ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando solicitudes...</p>
          ) : recientes.length === 0 ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No hay solicitudes registradas todavía.</p>
          ) : (
            <table style={s.tabla}>
              <thead>
                <tr>
                  {['Orden', 'Repuesto', 'Cantidad', 'Mecánico', 'Fecha', 'Acciones'].map(col => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recientes.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA).map((sol, i) => (
                  <tr key={sol.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={s.td}>{sol.orden_id}</td>
                    <td style={s.td}>{sol.repuesto_codigo} — {sol.repuesto_nombre}</td>
                    <td style={s.td}>{sol.cantidad_solicitada}</td>
                    <td style={s.td}>{sol.mecanico_nombre || '—'}</td>
                    <td style={s.td}>{sol.fecha_solicitud ? new Date(sol.fecha_solicitud).toLocaleString('es-HN') : '—'}</td>
                    <td style={s.td}>
                      <button onClick={() => onRegistrarSalida?.(sol)} style={btnAccion('#2563eb')}>
                        Registrar salida
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ padding: '0 20px 16px' }}>
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={Math.max(1, Math.ceil(recientes.length / POR_PAGINA))}
              totalClientes={recientes.length}
              onCambiarPagina={setPaginaActual}
              entidad="solicitud"
            />
          </div>
        </div>
      )}
    </div>
  );
}
