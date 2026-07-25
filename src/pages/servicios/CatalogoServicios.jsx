import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import servicioService from '../../services/servicioService';
import Paginacion, { getPageSizes } from '../../components/common/Paginacion';
import '../../styles/dashboard-dark.css';

const FORM_VACIO = { nombre: '', descripcion: '', precio_base: '' };

const fmtPrecio = (valor) =>
  new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(valor) || 0);

export default function CatalogoServicios() {
  const { user } = useAuth();
  // Solo el rol administrador puede agregar, editar o eliminar del
  // catálogo de servicios; el resto de roles autenticados solo puede
  // consultarlo.
  const esAdmin = user?.rol === 'admin' || user?.rol === 'administrador';

  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditar, setServicioEditar] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const cargarServicios = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await servicioService.listar();
      setServicios(res.data.data || []);
    } catch {
      setError('No se pudo cargar el catálogo de servicios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarServicios();
  }, [cargarServicios]);

  const serviciosFiltrados = servicios.filter(sv => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return sv.nombre?.toLowerCase().includes(q) || sv.descripcion?.toLowerCase().includes(q);
  });

  // ── Paginación ────────────────────────────────────────────────────────────
  const [pagina, setPagina] = useState(1);
  const pageSizes    = getPageSizes(serviciosFiltrados.length);
  const totalPaginas = pageSizes.length;
  const offset       = pageSizes.slice(0, pagina - 1).reduce((a, b) => a + b, 0);
  const serviciosPagina = serviciosFiltrados.slice(offset, offset + (pageSizes[pagina - 1] ?? 10));

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(Math.max(1, totalPaginas));
  }, [totalPaginas]); // eslint-disable-line react-hooks/exhaustive-deps

  const abrirCrear = () => {
    setServicioEditar(null);
    setForm(FORM_VACIO);
    setErrorModal('');
    setModalAbierto(true);
  };

  const abrirEditar = (sv) => {
    setServicioEditar(sv);
    setForm({ nombre: sv.nombre, descripcion: sv.descripcion || '', precio_base: sv.precio_base });
    setErrorModal('');
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); setServicioEditar(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal('');
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio_base: Number(form.precio_base)
      };
      if (servicioEditar) {
        await servicioService.actualizar(servicioEditar.id, payload);
      } else {
        await servicioService.crear(payload);
      }
      cerrarModal();
      cargarServicios();
    } catch (err) {
      setErrorModal(err.response?.data?.message || 'Error al guardar el servicio.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (sv) => {
    if (!window.confirm(`¿Eliminar el servicio "${sv.nombre}" del catálogo?`)) return;
    try {
      await servicioService.eliminar(sv.id);
      cargarServicios();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el servicio.');
    }
  };

  return (
    <div className="dt-page">
      <div className="dt-header">
        <div className="dt-header__left">
          <h1>Catálogo de Servicios</h1>
          <p>Servicios ofrecidos por el taller</p>
        </div>
        {esAdmin && (
          <button onClick={abrirCrear} className="dt-btn dt-btn--primary">+ Nuevo Servicio</button>
        )}
      </div>

      <div className="dt-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="dt-search-input"
        />
      </div>

      <div className="dt-table-card">
        {cargando ? (
          <p className="dt-loading">Cargando servicios...</p>
        ) : error ? (
          <p className="dt-empty">{error}</p>
        ) : serviciosFiltrados.length === 0 ? (
          <p className="dt-empty">
            {busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay servicios registrados en el catálogo.'}
          </p>
        ) : (
          <table className="dt-table">
            <thead>
              <tr>
                {['Nombre', 'Descripción', 'Precio base', esAdmin ? 'Acciones' : null].filter(Boolean).map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serviciosPagina.map((sv) => (
                <tr key={sv.id}>
                  <td className="dt-name">{sv.nombre}</td>
                  <td>{sv.descripcion || '—'}</td>
                  <td>{fmtPrecio(sv.precio_base)}</td>
                  {esAdmin && (
                    <td>
                      <button onClick={() => abrirEditar(sv)} className="dt-btn dt-btn--ghost">Editar</button>
                      <button onClick={() => handleEliminar(sv)} className="dt-btn dt-btn--danger">Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        totalItems={serviciosFiltrados.length}
        itemLabel="servicio"
        onCambiarPagina={setPagina}
      />

      {modalAbierto && esAdmin && (
        <div className="dt-overlay">
          <div className="dt-modal">
            <div className="dt-modal__header">
              <h3 className="dt-modal__title">
                {servicioEditar ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <button onClick={cerrarModal} className="dt-modal__close">×</button>
            </div>

            {errorModal && <div className="dt-field-error">{errorModal}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Nombre *</label>
                <input
                  className="dt-input" required placeholder="Ej: Cambio de aceite"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Descripción</label>
                <input
                  className="dt-input" placeholder="Ej: Cambio de aceite y filtro"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dt-label">Precio base *</label>
                <input
                  className="dt-input" type="number" required min={0} step="0.01"
                  value={form.precio_base}
                  onChange={e => setForm(f => ({ ...f, precio_base: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarModal} className="dt-btn dt-btn--secondary">Cancelar</button>
                <button type="submit" disabled={guardando} className="dt-btn dt-btn--primary">
                  {guardando ? 'Guardando...' : servicioEditar ? 'Guardar cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
