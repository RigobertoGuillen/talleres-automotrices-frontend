import { useState, useEffect, useCallback } from 'react';
import diagnosticoService from '../../services/diagnosticoService';

import Paginacion from '../../components/clientes/Paginacion';

import Paginacion, { getPageSizes } from '../../components/common/Paginacion';
import '../../styles/dashboard-dark.css';


const ESTADOS = ['pendiente', 'en proceso', 'completado'];
const FORM_VACIO = { orden_id: '', descripcion_falla: '', observaciones: '', recomendaciones: '', estado: 'pendiente' };
const PAGE_SIZE = 8;

const badgeEstado = (estado) => {
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

export default function Diagnosticos() {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [pagina, setPagina] = useState(1); // 1-indexado, igual que <Paginacion>

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

  // ── Paginación ────────────────────────────────────────────────────────────
  const [pagina, setPagina] = useState(1);
  const pageSizes    = getPageSizes(diagnosticos.length);
  const totalPaginas = pageSizes.length;
  const offset       = pageSizes.slice(0, pagina - 1).reduce((a, b) => a + b, 0);
  const diagnosticosPagina = diagnosticos.slice(offset, offset + (pageSizes[pagina - 1] ?? 10));

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(Math.max(1, totalPaginas));
  }, [totalPaginas]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => { setPagina(1); }, [filtroEstado, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(diagnosticos.length / PAGE_SIZE));
  const offset = (pagina - 1) * PAGE_SIZE;
  const diagnosticosPagina = diagnosticos.slice(offset, offset + PAGE_SIZE);

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
      <div className="dt-page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={cerrarHistorial} className="dt-btn dt-btn--secondary">← Volver</button>
          <div>
            <h1 style={{ margin: 0, color: '#E8E6FF', fontSize: 22, fontWeight: 700 }}>
              Historial de diagnósticos — Orden #{ordenHistorial}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#7B7A9E', fontSize: 13 }}>
              Ordenado del más reciente al más antiguo
            </p>
          </div>
        </div>

        <div className="dt-table-card">
          {cargandoHistorial ? (
            <p className="dt-loading">Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p className="dt-empty">Esta orden no tiene diagnósticos registrados.</p>
          ) : (
            <table className="dt-table">
              <thead>
                <tr>
                  {['Falla', 'Observaciones', 'Recomendaciones', 'Estado', 'Mecánico', 'Registrado', 'Actualizado'].map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((d) => (
                  <tr key={d.id}>
                    <td style={{ maxWidth: 220 }}>{d.descripcion_falla}</td>
                    <td style={{ maxWidth: 200 }}>{d.observaciones || '—'}</td>
                    <td style={{ maxWidth: 200 }}>{d.recomendaciones || '—'}</td>
                    <td><span className="dt-badge" style={badgeEstado(d.estado)}>{d.estado}</span></td>
                    <td>{d.mecanico || '—'}</td>
                    <td>{fmtFecha(d.fecha_registro)}</td>
                    <td>{fmtFecha(d.fecha_actualizacion)}</td>
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
    <div className="dt-page">
      <div className="dt-header">
        <div className="dt-header__left">
          <h1>Diagnósticos</h1>
          <p>Diagnósticos técnicos de las órdenes de trabajo</p>
        </div>
        <button onClick={abrirCrear} className="dt-btn dt-btn--primary">+ Registrar diagnóstico</button>
      </div>

      {/* HU17: busqueda y filtro por estado */}
      <div className="dt-filters">
        <input
          type="text"
          placeholder="Buscar por falla, observaciones o recomendaciones..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="dt-search-input"
        />
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}
          className="dt-select"
          style={{ width: 200 }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>

      <div className="dt-table-card">
        {cargando ? (
          <p className="dt-loading">Cargando diagnósticos...</p>
        ) : error ? (
          <p className="dt-empty">{error}</p>
        ) : diagnosticos.length === 0 ? (
          <p className="dt-empty">
            {busqueda || filtroEstado ? 'Sin resultados para ese criterio.' : 'No hay diagnósticos registrados.'}
          </p>
        ) : (
          <table className="dt-table">
            <thead>
              <tr>
                {['Orden', 'Falla', 'Estado', 'Mecánico', 'Registrado', 'Acciones'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>

              {diagnosticosPagina.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}>#{d.orden_id}</td>
                  <td style={{ ...s.td, maxWidth: 260 }}>{d.descripcion_falla}</td>
                  <td style={s.td}>

              {diagnosticosPagina.map((d) => (
                <tr key={d.id}>
                  <td>#{d.orden_id}</td>
                  <td style={{ maxWidth: 260 }}>{d.descripcion_falla}</td>
                  <td>

                    <select
                      value={d.estado}
                      onChange={e => cambiarEstado(d, e.target.value)}
                      className="dt-badge"
                      style={{ ...badgeEstado(d.estado), border: 'none', cursor: 'pointer' }}
                    >
                      {ESTADOS.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </td>
                  <td>{d.mecanico || '—'}</td>
                  <td>{fmtFecha(d.fecha_registro)}</td>
                  <td>
                    <button onClick={() => abrirObservaciones(d)} className="dt-btn dt-btn--ghost">Observaciones</button>
                    <button onClick={() => verHistorialOrden(d.orden_id)} className="dt-btn dt-btn--ghost">Historial orden</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


      {!cargando && !error && diagnosticos.length > 0 && (
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          totalClientes={diagnosticos.length}
          onCambiarPagina={setPagina}
          entidad="diagnóstico"
        />
      )}

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        totalItems={diagnosticos.length}
        itemLabel="diagnóstico"
        onCambiarPagina={setPagina}
      />


      {/* Modal HU14: registrar diagnostico */}
      {modalAbierto && (
        <div className="dt-overlay">
          <div className="dt-modal">
            <div className="dt-modal__header">
              <h3 className="dt-modal__title">Registrar Diagnóstico</h3>
              <button onClick={cerrarModal} className="dt-modal__close">×</button>
            </div>

            {errorModal && <div className="dt-field-error">{errorModal}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">ID Orden de Trabajo *</label>
                <input
                  className="dt-input" type="number" required min={1}
                  placeholder="ID numérico de la orden"
                  value={form.orden_id}
                  onChange={e => setForm(f => ({ ...f, orden_id: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Descripción de la falla *</label>
                <textarea
                  className="dt-textarea" required
                  placeholder="Describe la falla encontrada"
                  value={form.descripcion_falla}
                  onChange={e => setForm(f => ({ ...f, descripcion_falla: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Observaciones</label>
                <textarea
                  className="dt-textarea"
                  placeholder="Observaciones adicionales (opcional)"
                  value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Recomendaciones</label>
                <textarea
                  className="dt-textarea"
                  placeholder="Recomendaciones (opcional)"
                  value={form.recomendaciones}
                  onChange={e => setForm(f => ({ ...f, recomendaciones: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Estado</label>
                <select
                  className="dt-select-field"
                  value={form.estado}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                >
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarModal} className="dt-btn dt-btn--secondary">Cancelar</button>
                <button type="submit" disabled={guardando} className="dt-btn dt-btn--primary">
                  {guardando ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal HU15: observaciones */}
      {observacionesTarget && (
        <div className="dt-overlay">
          <div className="dt-modal">
            <div className="dt-modal__header">
              <h3 className="dt-modal__title">
                Observaciones — Orden #{observacionesTarget.orden_id}
              </h3>
              <button onClick={cerrarObservaciones} className="dt-modal__close">×</button>
            </div>

            {errorObs && <div className="dt-field-error">{errorObs}</div>}

            <form onSubmit={guardarObservaciones}>
              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Observaciones *</label>
                <textarea
                  className="dt-textarea" required style={{ minHeight: 120 }}
                  placeholder="Escribe las observaciones del diagnóstico"
                  value={observacionesTexto}
                  onChange={e => setObservacionesTexto(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarObservaciones} className="dt-btn dt-btn--secondary">Cancelar</button>
                <button type="submit" disabled={guardandoObs} className="dt-btn dt-btn--primary">
                  {guardandoObs ? 'Guardando...' : 'Guardar observaciones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="dt-toast dt-toast--success">{toast}</div>}
    </div>
  );
}