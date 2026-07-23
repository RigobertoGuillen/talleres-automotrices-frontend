import { useState, useEffect, useCallback } from 'react';
import vehiculoService from '../../services/vehiculoService';
import { apiSearchClientes } from '../../services/clientesService';
import Paginacion, { getPageSizes } from '../../components/common/Paginacion';
import '../../styles/dashboard-dark.css';

const TIPOS = ['Pickup', 'turismo', 'camioneta'];
const FORM_VACIO = { placa: '', marca: '', modelo: '', anio: new Date().getFullYear(), color: '', tipo: 'turismo', cliente_id: '' };

const badgeTipo = (tipo) => {
  const m = {
    Pickup: ['rgba(251,191,36,0.12)', '#FBD000'],
    turismo: ['rgba(72,187,120,0.12)', '#68D391'],
    camioneta: ['rgba(108,99,255,0.12)', '#9B8FFF'],
  };
  const [bg, color] = m[tipo] || ['rgba(160,160,160,0.1)', '#888'];
  return { background: bg, color };
};

const badgeEstado = (estado) => {
  const m = {
    recibido: ['rgba(108,99,255,0.12)', '#9B8FFF'],
    'en reparacion': ['rgba(251,191,36,0.12)', '#FBD000'],
    listo: ['rgba(72,187,120,0.12)', '#68D391'],
    entregado: ['rgba(160,160,160,0.1)', '#888'],
  };
  const [bg, color] = m[estado] || ['rgba(160,160,160,0.1)', '#888'];
  return { background: bg, color };
};

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

  const [clienteQuery, setClienteQuery] = useState('');
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

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

  const vehiculosFiltrados = vehiculos.filter(v => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      v.placa?.toLowerCase().includes(q) ||
      v.marca?.toLowerCase().includes(q) ||
      v.modelo?.toLowerCase().includes(q)
    );
  });

  // ── Paginación ────────────────────────────────────────────────────────────
  const [pagina, setPagina] = useState(1);
  const pageSizes    = getPageSizes(vehiculosFiltrados.length);
  const totalPaginas = pageSizes.length;
  const offset       = pageSizes.slice(0, pagina - 1).reduce((a, b) => a + b, 0);
  const vehiculosPagina = vehiculosFiltrados.slice(offset, offset + (pageSizes[pagina - 1] ?? 10));

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(Math.max(1, totalPaginas));
  }, [totalPaginas]); // eslint-disable-line react-hooks/exhaustive-deps

  const abrirCrear = () => {
    setVehiculoEditar(null);
    setForm(FORM_VACIO);
    setErrorModal('');
    setModalAbierto(true);
    setClienteQuery('');
    setClienteSeleccionado(null);
    setClientesSugeridos([]);
  };

  const abrirEditar = (v) => {
    setVehiculoEditar(v);
    setForm({ placa: v.placa, marca: v.marca, modelo: v.modelo, anio: v.anio, color: v.color || '', tipo: v.tipo, cliente_id: v.cliente_id || '' });
    setErrorModal('');
    setModalAbierto(true);
    setClienteQuery('');
    setClienteSeleccionado(null);
    setClientesSugeridos([]);
  };

  const cerrarModal = () => { setModalAbierto(false); setVehiculoEditar(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal('');
    try {
      const marcaSeleccionada = marcas.find(m => m.id === Number(form.marca_id));
      const payload = {
        placa: form.placa,
        marca: marcaSeleccionada ? marcaSeleccionada.nombre : form.marca,
        modelo: form.modelo,
        anio: Number(form.anio),
        color: form.color,
        tipo: form.tipo,
        cliente_id: Number(form.cliente_id)
      };
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

  if (historialVehiculo) {
    return (
      <div className="dt-page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={cerrarHistorial} className="dt-btn dt-btn--secondary">← Volver</button>
          <div>
            <h1 style={{ margin: 0, color: '#E8E6FF', fontSize: 22, fontWeight: 700 }}>
              Historial — {historialVehiculo.placa}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#7B7A9E', fontSize: 13 }}>
              {historialVehiculo.marca} {historialVehiculo.modelo} · {historialVehiculo.anio}
            </p>
          </div>
        </div>

        <div className="dt-table-card">
          {cargandoHistorial ? (
            <p className="dt-loading">Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p className="dt-empty">Este vehículo no tiene órdenes de trabajo registradas.</p>
          ) : (
            <table className="dt-table">
              <thead>
                <tr>
                  {['N° Orden', 'Fecha Ingreso', 'Problema', 'Estado', 'Mecánico'].map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.id}>
                    <td><b className="dt-name">{h.numero_orden || `#${h.id}`}</b></td>
                    <td>{h.fecha_ingreso ? new Date(h.fecha_ingreso).toLocaleDateString('es-SV') : '—'}</td>
                    <td style={{ maxWidth: 260 }}>{h.descripcion_problema}</td>
                    <td><span className="dt-badge" style={badgeEstado(h.estado)}>{h.estado}</span></td>
                    <td>{h.mecanico || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dt-page">
      <div className="dt-header">
        <div className="dt-header__left">
          <h1>Vehículos</h1>
          <p>Gestión de vehículos del taller</p>
        </div>
        <button onClick={abrirCrear} className="dt-btn dt-btn--primary">+ Registrar Vehículo</button>
      </div>

      <div className="dt-filters">
        <input
          type="text"
          placeholder="Buscar por placa, marca o modelo..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="dt-search-input"
        />
      </div>

      <div className="dt-table-card">
        {cargando ? (
          <p className="dt-loading">Cargando vehículos...</p>
        ) : error ? (
          <p className="dt-empty">{error}</p>
        ) : vehiculosFiltrados.length === 0 ? (
          <p className="dt-empty">
            {busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay vehículos registrados.'}
          </p>
        ) : (
          <table className="dt-table">
            <thead>
              <tr>
                {['Placa', 'Marca', 'Modelo', 'Año', 'Color', 'Tipo', 'Acciones'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehiculosPagina.map((v) => (
                <tr key={v.id}>
                  <td><span className="dt-badge" style={{ background: 'rgba(108,99,255,0.12)', color: '#9B8FFF' }}>{v.placa}</span></td>
                  <td className="dt-name">{v.marca}</td>
                  <td>{v.modelo}</td>
                  <td>{v.anio}</td>
                  <td>{v.color || '—'}</td>
                  <td><span className="dt-badge" style={badgeTipo(v.tipo)}>{v.tipo}</span></td>
                  <td>
                    <button onClick={() => abrirEditar(v)} className="dt-btn dt-btn--ghost">Editar</button>
                    <button onClick={() => verHistorial(v)} className="dt-btn dt-btn--ghost">Historial</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        totalItems={vehiculosFiltrados.length}
        itemLabel="vehículo"
        onCambiarPagina={setPagina}
      />

      {modalAbierto && (
        <div className="dt-overlay">
          <div className="dt-modal">
            <div className="dt-modal__header">
              <h3 className="dt-modal__title">
                {vehiculoEditar ? 'Editar Vehículo' : 'Registrar Vehículo'}
              </h3>
              <button onClick={cerrarModal} className="dt-modal__close">×</button>
            </div>

            {errorModal && <div className="dt-field-error">{errorModal}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>

                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Placa *</label>
                  <input
                    className="dt-input" required placeholder="Ej: P-123ABC"
                    value={form.placa}
                    onChange={e => setForm(f => ({ ...f, placa: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Marca *</label>
                  <select
                    className="dt-select-field" required
                    value={form.marca_id}
                    onChange={e => setForm(f => ({ ...f, marca_id: e.target.value }))}
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Modelo *</label>
                  <input
                    className="dt-input" required placeholder="Ej: Corolla"
                    value={form.modelo}
                    onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Año *</label>
                  <input
                    className="dt-input" type="number" required
                    min={1950} max={new Date().getFullYear() + 1}
                    value={form.anio}
                    onChange={e => setForm(f => ({ ...f, anio: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Color</label>
                  <input
                    className="dt-input" placeholder="Ej: Rojo"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="dt-label">Tipo *</label>
                  <select
                    className="dt-select-field" required
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14, gridColumn: '1 / -1', position: 'relative' }}>
                  <label className="dt-label">Cliente *</label>
                  <input
                    className="dt-input"
                    placeholder="Buscar cliente por nombre..."
                    value={clienteQuery}
                    onChange={async (e) => {
                      setClienteQuery(e.target.value);
                      setClienteSeleccionado(null);
                      if (e.target.value.trim().length > 1) {
                        const resultados = await apiSearchClientes(e.target.value);
                        setClientesSugeridos(resultados || []);
                      } else {
                        setClientesSugeridos([]);
                      }
                    }}
                  />
                  {clientesSugeridos.length > 0 && !clienteSeleccionado && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: '#141626', border: '1px solid rgba(108,99,255,0.2)',
                      borderRadius: 8, zIndex: 10, maxHeight: 200, overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                    }}>
                      {clientesSugeridos.map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setClienteSeleccionado(c);
                            setClienteQuery(c.nombre);
                            setClientesSugeridos([]);
                            setForm(f => ({ ...f, cliente_id: c.id }));
                          }}
                          style={{
                            padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                            borderBottom: '1px solid rgba(108,99,255,0.08)', color: '#E8E6FF'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <strong>{c.nombre}</strong>
                          {c.telefono && <span style={{ color: '#7B7A9E', marginLeft: 8 }}>{c.telefono}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {clienteSeleccionado && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#68D391' }}>
                      ✓ Cliente seleccionado: {clienteSeleccionado.nombre} (ID: {clienteSeleccionado.id})
                    </p>
                  )}
                </div>

              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarModal} className="dt-btn dt-btn--secondary">Cancelar</button>
                <button type="submit" disabled={guardando} className="dt-btn dt-btn--primary">
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
