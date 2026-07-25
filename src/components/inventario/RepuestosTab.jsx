import { useState, useEffect, useCallback } from 'react';
import inventarioService from '../../services/inventarioService';
import { s, btnAccion, badgeStock } from './styles';
import Paginacion from '../../components/clientes/Paginacion';

const POR_PAGINA = 8;

const FORM_VACIO = {
  codigo: '', nombre: '', categoria_id: '',
  costo_unitario: '', precio_unitario: '',
  cantidad_inicial: 0, cantidad_minima: 0,
};

export default function RepuestosTab({ esAdministrador }) {
  const [repuestos, setRepuestos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // HU-29: búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [repuestoEditar, setRepuestoEditar] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // HU-32: editar cantidad mínima de un repuesto ya existente
  const [modalMinimo, setModalMinimo] = useState(null); // repuesto seleccionado o null
  const [nuevoMinimo, setNuevoMinimo] = useState(0);
  const [guardandoMinimo, setGuardandoMinimo] = useState(false);
  const [errorMinimo, setErrorMinimo] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [resRepuestos, resCategorias] = await Promise.all([
        inventarioService.listarRepuestos(),
        inventarioService.listarCategorias(),
      ]);
      setRepuestos(resRepuestos.data.data || []);
      setCategorias(resCategorias.data.data || []);
    } catch {
      setError('No se pudo cargar el inventario de repuestos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // HU-29: la búsqueda y los filtros se aplican sobre los datos ya cargados
  // (código, nombre y cantidad disponible ya vienen en el listado general).
  const repuestosFiltrados = repuestos.filter(r => {
    if (categoriaFiltro && String(r.categoria_id) !== String(categoriaFiltro)) return false;
    if (soloBajoStock && r.cantidad_disponible > r.cantidad_minima) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return r.codigo?.toLowerCase().includes(q) || r.nombre?.toLowerCase().includes(q);
  });

  useEffect(() => { setPaginaActual(1); }, [busqueda, categoriaFiltro, soloBajoStock]);

  const totalPaginas = Math.max(1, Math.ceil(repuestosFiltrados.length / POR_PAGINA));
  const repuestosPagina = repuestosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const abrirCrear = () => {
    setRepuestoEditar(null);
    setForm(FORM_VACIO);
    setErrorModal('');
    setModalAbierto(true);
  };

  const abrirEditar = (r) => {
    setRepuestoEditar(r);
    setForm({
      codigo: r.codigo, nombre: r.nombre, categoria_id: r.categoria_id,
      costo_unitario: r.costo_unitario, precio_unitario: r.precio_unitario,
      cantidad_inicial: 0, cantidad_minima: r.cantidad_minima,
    });
    setErrorModal('');
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); setRepuestoEditar(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal('');
    try {
      const payload = {
        codigo: form.codigo,
        nombre: form.nombre,
        categoria_id: Number(form.categoria_id),
        costo_unitario: Number(form.costo_unitario) || 0,
        precio_unitario: Number(form.precio_unitario),
      };
      if (repuestoEditar) {
        await inventarioService.actualizarRepuesto(repuestoEditar.id, payload);
      } else {
        await inventarioService.crearRepuesto({
          ...payload,
          cantidad_inicial: Number(form.cantidad_inicial) || 0,
          cantidad_minima: Number(form.cantidad_minima) || 0,
        });
      }
      cerrarModal();
      cargarDatos();
    } catch (err) {
      setErrorModal(err.response?.data?.message || 'Error al guardar el repuesto.');
    } finally {
      setGuardando(false);
    }
  };

  const abrirMinimo = (r) => {
    setModalMinimo(r);
    setNuevoMinimo(r.cantidad_minima);
    setErrorMinimo('');
  };

  const guardarMinimo = async (e) => {
    e.preventDefault();
    setGuardandoMinimo(true);
    setErrorMinimo('');
    try {
      await inventarioService.actualizarStockMinimo(modalMinimo.id, Number(nuevoMinimo));
      setModalMinimo(null);
      cargarDatos();
    } catch (err) {
      setErrorMinimo(err.response?.data?.message || 'Error al actualizar el stock mínimo.');
    } finally {
      setGuardandoMinimo(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ ...s.input, maxWidth: 260 }}
          />
          <select
            style={{ ...s.input, maxWidth: 200 }}
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
            <input type="checkbox" checked={soloBajoStock} onChange={e => setSoloBajoStock(e.target.checked)} />
            Solo bajo stock mínimo
          </label>
        </div>
        {esAdministrador && (
          <button onClick={abrirCrear} style={s.btnPrimario}>+ Registrar Repuesto</button>
        )}
      </div>

      <div className="module" style={{ marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Cargando repuestos...</p>
        ) : error ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</p>
        ) : repuestosFiltrados.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            {busqueda || categoriaFiltro || soloBajoStock ? 'Sin resultados para ese filtro.' : 'No hay repuestos registrados.'}
          </p>
        ) : (
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Código', 'Nombre', 'Categoría', 'Costo', 'Precio', 'Disponible', 'Mínimo', 'Acciones'].map(col => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repuestosPagina.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}><b>{r.codigo}</b></td>
                  <td style={s.td}>{r.nombre}</td>
                  <td style={s.td}>{r.categoria_nombre}</td>
                  <td style={s.td}>L. {Number(r.costo_unitario).toFixed(2)}</td>
                  <td style={s.td}>L. {Number(r.precio_unitario).toFixed(2)}</td>
                  <td style={s.td}><span style={badgeStock(r.cantidad_disponible, r.cantidad_minima)}>{r.cantidad_disponible}</span></td>
                  <td style={s.td}>{r.cantidad_minima}</td>
                  <td style={s.td}>
                    {esAdministrador ? (
                      <>
                        <button onClick={() => abrirEditar(r)} style={btnAccion('#2563eb')}>Editar</button>
                        <button onClick={() => abrirMinimo(r)} style={btnAccion('#7c3aed')}>Mínimo</button>
                      </>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalClientes={repuestosFiltrados.length}
        onCambiarPagina={setPaginaActual}
        entidad="repuesto"
      />

      {modalAbierto && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                {repuestoEditar ? 'Editar Repuesto' : 'Registrar Repuesto'}
              </h3>
              <button onClick={cerrarModal} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            {errorModal && <div style={s.errorBox}>{errorModal}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Código *</label>
                  <input style={s.input} required placeholder="Ej: FRE-001"
                    value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Categoría *</label>
                  <select style={s.input} required
                    value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}>
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
                  <label style={s.label}>Nombre *</label>
                  <input style={s.input} required placeholder="Ej: Pastillas de freno delanteras"
                    value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Costo unitario</label>
                  <input style={s.input} type="number" min={0} step="0.01"
                    value={form.costo_unitario} onChange={e => setForm(f => ({ ...f, costo_unitario: e.target.value }))} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Precio unitario *</label>
                  <input style={s.input} type="number" required min={0} step="0.01"
                    value={form.precio_unitario} onChange={e => setForm(f => ({ ...f, precio_unitario: e.target.value }))} />
                </div>

                {!repuestoEditar && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={s.label}>Cantidad inicial</label>
                      <input style={s.input} type="number" min={0}
                        value={form.cantidad_inicial} onChange={e => setForm(f => ({ ...f, cantidad_inicial: e.target.value }))} />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={s.label}>Cantidad mínima</label>
                      <input style={s.input} type="number" min={0}
                        value={form.cantidad_minima} onChange={e => setForm(f => ({ ...f, cantidad_minima: e.target.value }))} />
                    </div>
                  </>
                )}
                {repuestoEditar && (
                  <p style={{ gridColumn: '1 / -1', fontSize: 12, color: '#6b7280', margin: '0 0 14px' }}>
                    Las existencias solo cambian registrando un movimiento (pestaña Kardex) y el stock
                    mínimo se ajusta con el botón "Mínimo" de la tabla.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={cerrarModal} style={s.btnSecundario}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ ...s.btnPrimario, opacity: guardando ? 0.6 : 1 }}>
                  {guardando ? 'Guardando...' : repuestoEditar ? 'Guardar cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMinimo && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#111827' }}>Stock mínimo</h3>
              <button onClick={() => setModalMinimo(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280' }}>{modalMinimo.codigo} · {modalMinimo.nombre}</p>
            {errorMinimo && <div style={s.errorBox}>{errorMinimo}</div>}
            <form onSubmit={guardarMinimo}>
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Cantidad mínima *</label>
                <input style={s.input} type="number" required min={0}
                  value={nuevoMinimo} onChange={e => setNuevoMinimo(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalMinimo(null)} style={s.btnSecundario}>Cancelar</button>
                <button type="submit" disabled={guardandoMinimo} style={{ ...s.btnPrimario, opacity: guardandoMinimo ? 0.6 : 1 }}>
                  {guardandoMinimo ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
