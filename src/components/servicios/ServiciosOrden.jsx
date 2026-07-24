import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import servicioService from '../../services/servicioService';

const fmtPrecio = (valor) =>
  new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(valor) || 0);

/**
 * Sub-panel: servicios del catálogo aplicados a una orden de trabajo.
 * Se usa dentro de Diagnósticos (vista de historial por orden).
 * Solo administrador/mecánico pueden agregar o quitar; el resto de
 * roles autenticados (ej. recepcionista) solo puede ver la lista,
 * igual que el resto de acciones de diagnóstico en este mismo panel.
 *
 * Props:
 *  - ordenId: numero_orden (ej. "ORD-1")
 */
export default function ServiciosOrden({ ordenId }) {
  const { user } = useAuth();
  const puedeEditar = ['admin', 'administrador', 'mecanico'].includes(user?.rol);

  const [aplicados, setAplicados] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [servicioId, setServicioId] = useState('');
  const [minutos, setMinutos] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarAplicados = useCallback(async () => {
    setCargando(true);
    try {
      const res = await servicioService.listarPorOrden(ordenId);
      setAplicados(res.data.data || []);
    } catch {
      setAplicados([]);
    } finally {
      setCargando(false);
    }
  }, [ordenId]);

  useEffect(() => {
    if (!ordenId) return;
    cargarAplicados();
  }, [ordenId, cargarAplicados]);

  useEffect(() => {
    if (!puedeEditar) return;
    servicioService.listar()
      .then(res => setCatalogo(res.data.data || []))
      .catch(() => setCatalogo([]));
  }, [puedeEditar]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!servicioId) return;
    setGuardando(true);
    setError('');
    try {
      await servicioService.registrarEnOrden({
        orden_id: ordenId,
        servicio_id: servicioId,
        tiempo_empleado_minutos: minutos || undefined,
        observaciones: observaciones || undefined,
      });
      setServicioId('');
      setMinutos('');
      setObservaciones('');
      cargarAplicados();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el servicio en la orden.');
    } finally {
      setGuardando(false);
    }
  };

  const handleQuitar = async (id) => {
    if (!window.confirm('¿Quitar este servicio de la orden?')) return;
    try {
      await servicioService.removerDeOrden(id);
      cargarAplicados();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo quitar el servicio.');
    }
  };

  return (
    <div>
      {error && <div className="dt-field-error">{error}</div>}

      {cargando ? (
        <p className="dt-loading">Cargando servicios...</p>
      ) : aplicados.length === 0 ? (
        <p className="dt-empty">Esta orden no tiene servicios aplicados todavía.</p>
      ) : (
        <table className="dt-table" style={{ marginBottom: 16 }}>
          <thead>
            <tr>
              {['Servicio', 'Tiempo', 'Observaciones', 'Precio', puedeEditar ? '' : null].filter(v => v !== null).map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aplicados.map(a => (
              <tr key={a.id}>
                <td className="dt-name">{a.servicio_nombre}</td>
                <td>{a.tiempo_empleado_minutos ? `${a.tiempo_empleado_minutos} min` : '—'}</td>
                <td>{a.observaciones || '—'}</td>
                <td>{fmtPrecio(a.precio_aplicado)}</td>
                {puedeEditar && (
                  <td>
                    <button onClick={() => handleQuitar(a.id)} className="dt-btn dt-btn--danger">Quitar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {puedeEditar && (
        <form onSubmit={handleAgregar} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <select
              required
              className="dt-select-field"
              style={{ width: '100%' }}
              value={servicioId}
              onChange={e => setServicioId(e.target.value)}
            >
              <option value="">Seleccionar servicio del catálogo...</option>
              {catalogo.map(sv => (
                <option key={sv.id} value={sv.id}>{sv.nombre} — {fmtPrecio(sv.precio_base)}</option>
              ))}
            </select>
          </div>
          <div style={{ width: 110 }}>
            <input
              type="number" min={0} placeholder="Minutos"
              className="dt-input"
              value={minutos}
              onChange={e => setMinutos(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <input
              type="text" placeholder="Observaciones (opcional)"
              className="dt-input"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </div>
          <button type="submit" disabled={guardando} className="dt-btn dt-btn--primary">
            {guardando ? 'Agregando...' : '+ Agregar servicio'}
          </button>
        </form>
      )}
    </div>
  );
}
