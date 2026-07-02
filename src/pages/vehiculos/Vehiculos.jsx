import { useState, useEffect, useCallback } from 'react';
import vehiculoService from '../../services/vehiculoService';

const TIPOS = ['Pickup', 'turismo', 'camioneta'];
const FORM_VACIO = { placa: '', marca_id: '', modelo: '', anio: new Date().getFullYear(), color: '', tipo: 'turismo', cliente_id: '' };

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
};

const badgePlaca = { background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, padding: '3px 10px', borderRadius: 6, fontSize: 12 };

const badgeTipo = (tipo) => {
  const m = { Pickup: ['#fef3c7', '#92400e'], turismo: ['#d1fae5', '#065f46'], camioneta: ['#ede9fe', '#5b21b6'] };
  const [bg, color] = m[tipo] || ['#f3f4f6', '#374151'];
  return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

const badgeEstado = (estado) => {
  const m = {
    recibido: ['#dbeafe', '#1e40af'], 'en reparacion': ['#fef3c7', '#92400e'],
    listo: ['#d1fae5', '#065f46'], entregado: ['#f3f4f6', '#374151'],
  };
  const [bg, color] = m[estado] || ['#f3f4f6', '#374151'];
  return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

const btnAccion = (color) => ({
  background: color, color: '#fff', border: 'none',
  padding: '5px 12px', borderRadius: 6, fontSize: 12,
  cursor: 'pointer', marginRight: 6, fontWeight: 500,
});

// ── Componente principal ───────────────────────────────────────────────────────

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculoEditar, setVehiculoEditar] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const [historialVehiculo, setHistorialVehiculo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const cargarVehiculos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await vehiculoService.listar();
      setVehiculos(res.data.data || []);
    } catch {
      setError('No se pudo cargar la lista de vehículos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarVehiculos();
    vehiculoService.marcas()
      .then(res => setMarcas(res.data.data || []))
      .catch(() => setMarcas([]));
  }, [cargarVehiculos]);

  // HU-13: filtrado instantáneo por placa, marca o modelo
  const vehiculosFiltrados = vehiculos.filter(v => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      v.placa?.toLowerCase().includes(q) ||
      v.marca?.toLowerCase().includes(q) ||
      v.modelo?.toLowerCase().includes(q)
    );
  });

  const abrirCrear = () => {
    setVehiculoEditar(null);
    setForm(FORM_VACIO);
    setErrorModal('');
    setModalAbierto(true);
  };

  const abrirEditar = (v) => {
    setVehiculoEditar(v);
    setForm({ placa: v.placa, marca_id: v.marca_id, modelo: v.modelo, anio: v.anio, color: v.color || '', tipo: v.tipo, cliente_id: v.cliente_id || '' });
    setErrorModal('');
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); setVehiculoEditar(null); };

  // HU-10 / HU-11
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal('');
    try {
      const payload = { ...form, marca_id: Number(form.marca_id), anio: Number(form.anio), cliente_id: Number(form.cliente_id) };
      if (vehiculoEditar) {
        await vehiculoService.actualizar(vehiculoEditar.id, payload);
      } else {
        await vehiculoService.crear(payload);
      }
      cerrarModal();
      cargarVehiculos();
    } catch (err) {
      setErrorModal(err.response?.data?.message || 'Error al guardar el vehículo.');
    } finally {
      setGuardando(false);
    }
  };

  // HU-12: ver historial de un vehículo
  const verHistorial = async (v) => {
    setHistorialVehiculo(v);
    setCargandoHistorial(true);
    try {
      const res = await vehiculoService.historial(v.id);
      setHistorial(res.data.data || []);
    } catch {
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cerrarHistorial = () => { setHistorialVehiculo(null); setHistorial([]); };

  // Vista historial
  if (historialVehiculo) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={cerrarHistorial} style={s.btnSecundario}>← Volver</button>
          <div>
            <h2 style={{ margin: 0, color: '#111827', fontSize: 22, fontWeight: 700 }}>
              Historial — {historialVehiculo.placa}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
              {historialVehiculo.marca} {historialVehiculo.modelo} · {historialVehiculo.anio}
            </p>
          </div>
        </div>

        <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
          {cargandoHistorial ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              Este vehículo no tiene órdenes de trabajo registradas.
            </p>
          ) : (
            <table style={s.tabla}>
              <thead>
                <tr>
                  {['N° Orden', 'Fecha Ingreso', 'Problema', 'Estado', 'Mecánico'].map(col => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((h, i) => (
                  <tr key={h.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={s.td}><b>{h.numero_orden || `#${h.id}`}</b></td>
                    <td style={s.td}>{h.fecha_ingreso ? new Date(h.fecha_ingreso).toLocaleDateString('es-SV') : '—'}</td>
                    <td style={{ ...s.td, maxWidth: 260 }}>{h.descripcion_problema}</td>
                    <td style={s.td}><span style={badgeEstado(h.estado)}>{h.estado}</span></td>
                    <td style={s.td}>{h.mecanico || '—'}</td>
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
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: 22, fontWeight: 700 }}>Vehículos</h2>
          <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: 13 }}>Gestión de vehículos del taller</p>
        </div>
        <button onClick={abrirCrear} style={s.btnPrimario}>+ Registrar Vehículo</button>
      </div>

      {/* HU-13: Barra de búsqueda */}
      <div className="module" style={{ padding: '14px 20px', marginBottom: 16, marginTop: 0 }}>
        <input
          type="text"
          placeholder="Buscar por placa, marca o modelo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ ...s.input, fontSize: 14 }}
        />
      </div>

      {/* Tabla */}
      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando vehículos...</p>
        ) : error ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</p>
        ) : vehiculosFiltrados.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            {busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay vehículos registrados.'}
          </p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Placa', 'Marca', 'Modelo', 'Año', 'Color', 'Tipo', 'Acciones'].map(col => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehiculosFiltrados.map((v, i) => (
                <tr key={v.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}><span style={badgePlaca}>{v.placa}</span></td>
                  <td style={s.td}>{v.marca}</td>
                  <td style={s.td}>{v.modelo}</td>
                  <td style={s.td}>{v.anio}</td>
                  <td style={s.td}>{v.color || '—'}</td>
                  <td style={s.td}><span style={badgeTipo(v.tipo)}>{v.tipo}</span></td>
                  <td style={s.td}>
                    <button onClick={() => abrirEditar(v)} style={btnAccion('#2563eb')}>Editar</button>
                    <button onClick={() => verHistorial(v)} style={btnAccion('#16a34a')}>Historial</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal HU-10 / HU-11 */}
      {modalAbierto && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                {vehiculoEditar ? 'Editar Vehículo' : 'Registrar Vehículo'}
              </h3>
              <button onClick={cerrarModal} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            {errorModal && <div style={s.errorBox}>{errorModal}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Placa *</label>
                  <input
                    style={s.input} required placeholder="Ej: P-123ABC"
                    value={form.placa}
                    onChange={e => setForm(f => ({ ...f, placa: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Marca *</label>
                  <select
                    style={s.input} required
                    value={form.marca_id}
                    onChange={e => setForm(f => ({ ...f, marca_id: e.target.value }))}
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Modelo *</label>
                  <input
                    style={s.input} required placeholder="Ej: Corolla"
                    value={form.modelo}
                    onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Año *</label>
                  <input
                    style={s.input} type="number" required
                    min={1950} max={new Date().getFullYear() + 1}
                    value={form.anio}
                    onChange={e => setForm(f => ({ ...f, anio: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Color</label>
                  <input
                    style={s.input} placeholder="Ej: Rojo"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Tipo *</label>
                  <select
                    style={s.input} required
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
                  <label style={s.label}>ID Cliente *</label>
                  <input
                    style={s.input} type="number" required min={1}
                    placeholder="ID numérico del cliente"
                    value={form.cliente_id}
                    onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarModal} style={s.btnSecundario}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ ...s.btnPrimario, opacity: guardando ? 0.6 : 1 }}>
                  {guardando ? 'Guardando...' : vehiculoEditar ? 'Guardar cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
