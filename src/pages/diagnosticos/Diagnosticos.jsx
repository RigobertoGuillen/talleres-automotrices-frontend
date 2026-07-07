import { useState, useEffect, useCallback } from 'react';
import diagnosticoService from '../../services/diagnosticoService';

const ESTADOS = ['pendiente', 'en proceso', 'completado'];
const FORM_VACIO = { orden_id: '', descripcion_falla: '', observaciones: '', recomendaciones: '', estado: 'pendiente' };

// ── Estilos compartidos ────────────────────────────────────────────────────────

const s = {
  btnPrimario: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff', border: 'none', padding: '10px 20px',
    borderRadius: 10, fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  btnSecundario: {
    background: '#f3f4f6', color: '#374151',
    border: '1px solid #d1d5db', padding: '10px 20px',
    borderRadius: 10, fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: 11,
    fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  td: { padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#6b7280', letterSpacing: '0.5px',
    textTransform: 'uppercase', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 13, fontFamily: 'Segoe UI, sans-serif',
    outline: 'none', boxSizing: 'border-box', color: '#374151',
    background: '#fff',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 32,
    width: '100%', maxWidth: 600,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    maxHeight: '92vh', overflowY: 'auto',
  },
  errorBox: {
    background: '#fee2e2', color: '#991b1b',
    border: '1px solid #fecaca', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  toast: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 1100,
    background: '#111827', color: '#fff', padding: '12px 20px',
    borderRadius: 10, fontSize: 13, fontWeight: 500,
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
};

const badgeEstado = (estado) => {
  const m = {
    pendiente: ['#dbeafe', '#1e40af'],
    'en proceso': ['#fef3c7', '#92400e'],
    completado: ['#d1fae5', '#065f46'],
  };
  const [bg, color] = m[estado] || ['#f3f4f6', '#374151'];
  return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

const btnAccion = (color) => ({
  background: color, color: '#fff', border: 'none',
  padding: '5px 12px', borderRadius: 6, fontSize: 12,
  cursor: 'pointer', marginRight: 6, fontWeight: 500,
});

function fmtFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-SV', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function Diagnosticos() {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const [observacionesTarget, setObservacionesTarget] = useState(null);
  const [observacionesTexto, setObservacionesTexto] = useState('');
  const [guardandoObs, setGuardandoObs] = useState(false);
  const [errorObs, setErrorObs] = useState('');

  const [ordenHistorial, setOrdenHistorial] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // HU17: listar con busqueda, filtro por estado y orden por fecha
  const cargarDiagnosticos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const filtros = {};
      if (filtroEstado) filtros.estado = filtroEstado;
      if (busqueda.trim()) filtros.q = busqueda.trim();
      const res = await diagnosticoService.listar(filtros);
      setDiagnosticos(res.data.data || []);
    } catch {
      setError('No se pudo cargar la lista de diagnósticos.');
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, busqueda]);

  useEffect(() => {
    const timeout = setTimeout(cargarDiagnosticos, 300);
    return () => clearTimeout(timeout);
  }, [cargarDiagnosticos]);

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setErrorModal('');
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  // HU14: registrar diagnostico
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal('');
    try {
      const payload = { ...form, orden_id: Number(form.orden_id) };
      await diagnosticoService.crear(payload);
      cerrarModal();
      mostrarToast('Diagnóstico registrado correctamente.');
      cargarDiagnosticos();
    } catch (err) {
      setErrorModal(err.response?.data?.message || 'Error al registrar el diagnóstico.');
    } finally {
      setGuardando(false);
    }
  };

  // HU16: cambiar estado del diagnostico
  const cambiarEstado = async (diagnostico, nuevoEstado) => {
    if (nuevoEstado === diagnostico.estado) return;
    try {
      await diagnosticoService.actualizarEstado(diagnostico.id, nuevoEstado);
      mostrarToast('Estado del diagnóstico actualizado correctamente.');
      cargarDiagnosticos();
    } catch (err) {
      mostrarToast(err.response?.data?.message || 'Error al actualizar el estado.');
    }
  };

  // HU15: registrar observaciones
  const abrirObservaciones = (diagnostico) => {
    setObservacionesTarget(diagnostico);
    setObservacionesTexto(diagnostico.observaciones || '');
    setErrorObs('');
  };

  const cerrarObservaciones = () => setObservacionesTarget(null);

  const guardarObservaciones = async (e) => {
    e.preventDefault();
    setGuardandoObs(true);
    setErrorObs('');
    try {
      await diagnosticoService.actualizarObservaciones(observacionesTarget.id, observacionesTexto.trim());
      mostrarToast('Observaciones registradas correctamente.');
      cerrarObservaciones();
      cargarDiagnosticos();
    } catch (err) {
      setErrorObs(err.response?.data?.message || 'Error al registrar observaciones.');
    } finally {
      setGuardandoObs(false);
    }
  };

  // HU14/HU15/HU17: historial de diagnosticos de una orden
  const verHistorialOrden = async (ordenId) => {
    setOrdenHistorial(ordenId);
    setCargandoHistorial(true);
    try {
      const res = await diagnosticoService.porOrden(ordenId);
      setHistorial(res.data.data || []);
    } catch {
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cerrarHistorial = () => { setOrdenHistorial(null); setHistorial([]); };

  // Vista historial por orden
  if (ordenHistorial) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={cerrarHistorial} style={s.btnSecundario}>← Volver</button>
          <div>
            <h2 style={{ margin: 0, color: '#111827', fontSize: 22, fontWeight: 700 }}>
              Historial de diagnósticos — Orden #{ordenHistorial}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
              Ordenado del más reciente al más antiguo
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
          {cargandoHistorial ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              Esta orden no tiene diagnósticos registrados.
            </p>
          ) : (
            <table style={s.tabla}>
              <thead>
                <tr>
                  {['Falla', 'Observaciones', 'Recomendaciones', 'Estado', 'Mecánico', 'Registrado', 'Actualizado'].map(col => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ ...s.td, maxWidth: 220 }}>{d.descripcion_falla}</td>
                    <td style={{ ...s.td, maxWidth: 200 }}>{d.observaciones || '—'}</td>
                    <td style={{ ...s.td, maxWidth: 200 }}>{d.recomendaciones || '—'}</td>
                    <td style={s.td}><span style={badgeEstado(d.estado)}>{d.estado}</span></td>
                    <td style={s.td}>{d.mecanico || '—'}</td>
                    <td style={s.td}>{fmtFecha(d.fecha_registro)}</td>
                    <td style={s.td}>{fmtFecha(d.fecha_actualizacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Vista lista
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: 22, fontWeight: 700 }}>Diagnósticos</h2>
          <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: 13 }}>Diagnósticos técnicos de las órdenes de trabajo</p>
        </div>
        <button onClick={abrirCrear} style={s.btnPrimario}>+ Registrar diagnóstico</button>
      </div>

      {/* HU17: busqueda y filtro por estado */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Buscar por falla, observaciones o recomendaciones..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ ...s.input, flex: 1 }}
        />
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          style={{ ...s.input, width: 200 }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando diagnósticos...</p>
        ) : error ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</p>
        ) : diagnosticos.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            {busqueda || filtroEstado ? 'Sin resultados para ese criterio.' : 'No hay diagnósticos registrados.'}
          </p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Orden', 'Falla', 'Estado', 'Mecánico', 'Registrado', 'Acciones'].map(col => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diagnosticos.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}>#{d.orden_id}</td>
                  <td style={{ ...s.td, maxWidth: 260 }}>{d.descripcion_falla}</td>
                  <td style={s.td}>
                    <select
                      value={d.estado}
                      onChange={e => cambiarEstado(d, e.target.value)}
                      style={{ ...badgeEstado(d.estado), border: 'none', cursor: 'pointer' }}
                    >
                      {ESTADOS.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </td>
                  <td style={s.td}>{d.mecanico || '—'}</td>
                  <td style={s.td}>{fmtFecha(d.fecha_registro)}</td>
                  <td style={s.td}>
                    <button onClick={() => abrirObservaciones(d)} style={btnAccion('#2563eb')}>Observaciones</button>
                    <button onClick={() => verHistorialOrden(d.orden_id)} style={btnAccion('#16a34a')}>Historial orden</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal HU14: registrar diagnostico */}
      {modalAbierto && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111827' }}>Registrar Diagnóstico</h3>
              <button onClick={cerrarModal} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            {errorModal && <div style={s.errorBox}>{errorModal}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>ID Orden de Trabajo *</label>
                <input
                  style={s.input} type="number" required min={1}
                  placeholder="ID numérico de la orden"
                  value={form.orden_id}
                  onChange={e => setForm(f => ({ ...f, orden_id: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Descripción de la falla *</label>
                <textarea
                  style={{ ...s.input, minHeight: 70, resize: 'vertical' }} required
                  placeholder="Describe la falla encontrada"
                  value={form.descripcion_falla}
                  onChange={e => setForm(f => ({ ...f, descripcion_falla: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Observaciones</label>
                <textarea
                  style={{ ...s.input, minHeight: 60, resize: 'vertical' }}
                  placeholder="Observaciones adicionales (opcional)"
                  value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Recomendaciones</label>
                <textarea
                  style={{ ...s.input, minHeight: 60, resize: 'vertical' }}
                  placeholder="Recomendaciones (opcional)"
                  value={form.recomendaciones}
                  onChange={e => setForm(f => ({ ...f, recomendaciones: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Estado</label>
                <select
                  style={s.input}
                  value={form.estado}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                >
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarModal} style={s.btnSecundario}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ ...s.btnPrimario, opacity: guardando ? 0.6 : 1 }}>
                  {guardando ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal HU15: observaciones */}
      {observacionesTarget && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                Observaciones — Orden #{observacionesTarget.orden_id}
              </h3>
              <button onClick={cerrarObservaciones} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            {errorObs && <div style={s.errorBox}>{errorObs}</div>}

            <form onSubmit={guardarObservaciones}>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Observaciones *</label>
                <textarea
                  style={{ ...s.input, minHeight: 120, resize: 'vertical' }} required
                  placeholder="Escribe las observaciones del diagnóstico"
                  value={observacionesTexto}
                  onChange={e => setObservacionesTexto(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarObservaciones} style={s.btnSecundario}>Cancelar</button>
                <button type="submit" disabled={guardandoObs} style={{ ...s.btnPrimario, opacity: guardandoObs ? 0.6 : 1 }}>
                  {guardandoObs ? 'Guardando...' : 'Guardar observaciones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
