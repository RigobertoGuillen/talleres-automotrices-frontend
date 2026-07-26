import { useState } from 'react';
import { s } from '../../components/reportes/styles';
import ServiciosTab from '../../components/reportes/ServiciosTab';
import VehiculosAtendidosTab from '../../components/reportes/VehiculosAtendidosTab';
import InventarioUtilizadoTab from '../../components/reportes/InventarioUtilizadoTab';
import IngresosTab from '../../components/reportes/IngresosTab';
import MecanicosTab from '../../components/reportes/MecanicosTab';
import OrdenesPendientesTab from '../../components/reportes/OrdenesPendientesTab';

const TABS = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'vehiculos', label: 'Vehículos atendidos' },
  { id: 'inventario', label: 'Inventario utilizado' },
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'mecanicos', label: 'Por mecánico' },
  { id: 'pendientes', label: 'Órdenes pendientes' },
];

export default function Reportes() {
  const [tabActiva, setTabActiva] = useState('servicios');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#ffffff', fontSize: 22, fontWeight: 700 }}>Reportes</h2>
        <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: 13 }}>
          Análisis de productividad, demanda, consumo e ingresos del taller
        </p>
      </div>

      <div style={s.tabsBar}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTabActiva(t.id)} style={s.tabBtn(tabActiva === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tabActiva === 'servicios' && <ServiciosTab />}
      {tabActiva === 'vehiculos' && <VehiculosAtendidosTab />}
      {tabActiva === 'inventario' && <InventarioUtilizadoTab />}
      {tabActiva === 'ingresos' && <IngresosTab />}
      {tabActiva === 'mecanicos' && <MecanicosTab />}
      {tabActiva === 'pendientes' && <OrdenesPendientesTab />}
    </div>
  );
}
