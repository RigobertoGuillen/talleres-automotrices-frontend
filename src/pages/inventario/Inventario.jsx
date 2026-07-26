import { useState, useMemo, useCallback } from 'react';
import { s } from '../../components/inventario/styles';
import RepuestosTab from '../../components/inventario/RepuestosTab';
import MovimientosTab from '../../components/inventario/MovimientosTab';
import SolicitudesTab from '../../components/inventario/SolicitudesTab';
import AlertasTab from '../../components/inventario/AlertasTab';


export default function Inventario({ rol }) {
  const esAdministrador = rol === 'administrador';
  const esRecepcionista = rol === 'recepcionista';
  const esMecanico = rol === 'mecanico';

  const tabs = useMemo(() => {
    const lista = [];
    // HU-27 / HU-29: repuestos y consulta de stock -> administrador y recepcionista
    if (esAdministrador || esRecepcionista) lista.push({ id: 'repuestos', label: 'Repuestos' });
    // HU-28 / HU-33: kardex y su historial -> solo administrador (así están las rutas)
    if (esAdministrador) lista.push({ id: 'movimientos', label: 'Kardex' });
    // HU-30: solicitar -> mecánico; ver solicitudes registradas -> administrador
    if (esAdministrador || esMecanico) lista.push({ id: 'solicitudes', label: 'Solicitudes' });
    // HU-32: alertas de stock mínimo -> administrador y recepcionista
    if (esAdministrador || esRecepcionista) lista.push({ id: 'alertas', label: 'Alertas' });
    return lista;
  }, [esAdministrador, esRecepcionista, esMecanico]);

  const [tabActiva, setTabActiva] = useState(tabs[0]?.id || 'repuestos');

  // Puente Solicitudes -> Kardex: no hay aprobar/rechazar (la tabla no tiene
  // columnas de estado y no se puede alterar el esquema), así que el
  // administrador "atiende" una solicitud registrando la salida real en el
  // Kardex. Este estado precarga ese formulario con los datos de la solicitud.
  const [prefillMovimiento, setPrefillMovimiento] = useState(null);

  const irARegistrarSalida = useCallback((solicitud) => {
    setPrefillMovimiento({
      repuesto_id: solicitud.repuesto_id,
      cantidad: solicitud.cantidad_solicitada,
      motivo: `Solicitud de ${solicitud.mecanico_nombre || 'mecánico'} (orden ${solicitud.orden_id})`,
      orden_id: solicitud.orden_id,
      tipo_movimiento: 'salida',
    });
    setTabActiva('movimientos');
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#ffffff', fontSize: 22, fontWeight: 700 }}>Inventario</h2>
        <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: 13 }}>Repuestos, existencias y solicitudes del taller</p>
      </div>

      {tabs.length === 0 ? (
        <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          Tu rol no tiene acceso al módulo de inventario.
        </p>
      ) : (
        <>
          <div style={s.tabsBar}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTabActiva(t.id)} style={s.tabBtn(tabActiva === t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tabActiva === 'repuestos' && <RepuestosTab esAdministrador={esAdministrador} />}
          {tabActiva === 'movimientos' && esAdministrador && (
            <MovimientosTab prefill={prefillMovimiento} onPrefillConsumido={() => setPrefillMovimiento(null)} />
          )}
          {tabActiva === 'solicitudes' && (
            <SolicitudesTab
              esAdministrador={esAdministrador}
              esMecanico={esMecanico}
              onRegistrarSalida={esAdministrador ? irARegistrarSalida : undefined}
            />
          )}
          {tabActiva === 'alertas' && <AlertasTab />}
        </>
      )}
    </div>
  );
}