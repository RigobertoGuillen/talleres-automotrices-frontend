import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import facturacionService from '../../services/facturacionService';
import '../../styles/dashboard-dark.css';

const FORM_VACIO = {
  cai: '', punto_emision: '',
  rango_autorizado_inicio: '', rango_autorizado_fin: '',
  fecha_limite_emision: ''
};

function fmtFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ActualizacionesCai() {
  const { user } = useAuth();
  // Solo el rol administrador puede subir nuevas autorizaciones CAI; el
  // resto de roles con acceso a Facturación (recepcionista) solo consulta.
  const esAdmin = user?.rol === 'admin' || user?.rol === 'administrador';

  const [cais, setCais] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const cargarCais = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await facturacionService.listarCais();
      setCais(res.data.data || []);
    } catch {
      setError('No se pudieron cargar las autorizaciones CAI.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCais();
  }, [cargarCais]);

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setErrorModal('');
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal('');
    try {
      await facturacionService.crearCai(form);
      cerrarModal();
      cargarCais();
    } catch (err) {
      setErrorModal(err.response?.data?.message || 'Error al registrar la autorización CAI.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="dt-page">
      <div className="dt-header">
        <div className="dt-header__left">
          <h1>Actualizaciones CAI</h1>
          <p>Autorizaciones de facturación (SAR) vigentes del taller</p>
        </div>
        {esAdmin && (
          <button onClick={abrirCrear} className="dt-btn dt-btn--primary">+ Nueva Autorización CAI</button>
        )}
      </div>

      {error && <div className="dt-error">{error}</div>}

      <div className="dt-table-card">
        {cargando ? (
          <p className="dt-loading">Cargando autorizaciones...</p>
        ) : cais.length === 0 ? (
          <p className="dt-empty">No hay autorizaciones CAI registradas.</p>
        ) : (
          <table className="dt-table">
            <thead>
              <tr>
                {['CAI', 'Punto de emisión', 'Rango autorizado', 'Fecha límite', 'Estado'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cais.map(c => (
                <tr key={c.id}>
                  <td className="dt-name" style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.cai}</td>
                  <td>{c.punto_emision}</td>
                  <td style={{ fontSize: 12 }}>{c.rango_autorizado_inicio} — {c.rango_autorizado_fin}</td>
                  <td>{fmtFecha(c.fecha_limite_emision)}</td>
                  <td>
                    <span
                      className="dt-badge"
                      style={c.activo
                        ? { background: 'rgba(72,187,120,0.12)', color: '#68D391' }
                        : { background: 'rgba(160,160,160,0.1)', color: '#888' }}
                    >
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && esAdmin && (
        <div className="dt-overlay">
          <div className="dt-modal">
            <div className="dt-modal__header">
              <h3 className="dt-modal__title">Nueva Autorización CAI</h3>
              <button onClick={cerrarModal} className="dt-modal__close">×</button>
            </div>

            {errorModal && <div className="dt-field-error">{errorModal}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Código CAI *</label>
                <input
                  className="dt-input" required
                  placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XX"
                  style={{ fontFamily: 'monospace' }}
                  value={form.cai}
                  onChange={e => setForm(f => ({ ...f, cai: e.target.value.toUpperCase() }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Punto de emisión *</label>
                <input
                  className="dt-input" required placeholder="000-000-00"
                  value={form.punto_emision}
                  onChange={e => setForm(f => ({ ...f, punto_emision: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Rango autorizado inicio *</label>
                  <input
                    className="dt-input" required placeholder="000-000-00-00000001"
                    value={form.rango_autorizado_inicio}
                    onChange={e => setForm(f => ({ ...f, rango_autorizado_inicio: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Rango autorizado fin *</label>
                  <input
                    className="dt-input" required placeholder="000-000-00-00010000"
                    value={form.rango_autorizado_fin}
                    onChange={e => setForm(f => ({ ...f, rango_autorizado_fin: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Fecha límite de emisión *</label>
                <input
                  className="dt-input" type="date" required
                  value={form.fecha_limite_emision}
                  onChange={e => setForm(f => ({ ...f, fecha_limite_emision: e.target.value }))}
                />
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
    </div>
  );
}
