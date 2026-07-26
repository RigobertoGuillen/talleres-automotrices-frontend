import api from "../../services/api";
import { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";
import ClientesModule from "../../pages/clientes/ClientesModule";
import Ordenesmodule from "../../pages/ordenes/Ordenesmodule";
import Vehiculos from "../../pages/vehiculos/Vehiculos";
import Diagnosticos from "../../pages/diagnosticos/Diagnosticos";

import Inventario from "../../pages/inventario/Inventario";

import CatalogoServicios from "../../pages/servicios/CatalogoServicios";
import ServiciosOrdenPage from "../../pages/servicios/ServiciosOrdenPage";
import GenerarFactura from "../../pages/facturacion/GenerarFactura";
import Facturas from "../../pages/facturacion/Facturas";
import ActualizacionesCai from "../../pages/facturacion/ActualizacionesCai";

const modules = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "ordenes",      label: "Órdenes de Trabajo" },
  {
    key: "diagnosticos", label: "Diagnósticos",
    children: [
      { key: "diagnosticos",   label: "Lista de Diagnósticos" },
      { key: "servicios-orden", label: "Servicios de Orden" },
    ],
  },
  { key: "cliente",      label: "Clientes" },
  { key: "vehiculos",    label: "Vehículos" },
  { key: "servicios",    label: "Catálogo de Servicios" },
  { key: "inventario",   label: "Inventario" },
  {
    key: "facturación", label: "Facturación",
    children: [
      { key: "facturacion-generar", label: "Generar Factura" },
      { key: "facturacion-listado", label: "Facturas" },
      { key: "facturacion-cai",     label: "Actualizaciones CAI" },
    ],
  },
];

const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Recepcionista",
};

const welcome = {
  title: "Bienvenido al Panel de Recepcionista",
  subtitle: "Desde aquí puedes gestionar todo el sistema del taller.",
};

// HU-45: mismos indicadores que el dashboard de administrador, pero con las
// 4 tarjetas relevantes para recepción, y con actualización automática.
const INTERVALO_ACTUALIZACION_MS = 30000;

function fmtMoneda(valor) {
  const n = Number(valor) || 0;
  return `L. ${n.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardRecepcionista() {
  const [module, setModule] = useState("dashboard");
  const [stats, setStats] = useState({
    ordenesActivas: 0,
    totalClientes: 0,
    ingresosMes: 0,
    alertasInventario: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (module !== "dashboard") return;

    let activo = true;

    function cargarStats(mostrarLoading) {
      if (mostrarLoading) setLoading(true);
      api.get("/dashboard/stats")
        .then((res) => {
          if (activo) setStats(res.data);
        })
        .catch((err) => {
          console.error("Error cargando estadísticas del dashboard:", err);
        })
        .finally(() => {
          if (activo && mostrarLoading) setLoading(false);
        });
    }

    cargarStats(true);
    const intervalo = setInterval(() => cargarStats(false), INTERVALO_ACTUALIZACION_MS);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [module]);

  function renderContent() {
    switch (module) {
      case "cliente":
        return <ClientesModule />;
      case "ordenes":
        return <Ordenesmodule />;
      case "vehiculos":
        return <Vehiculos />;
      case "diagnosticos":
        return <Diagnosticos />;

      case "inventario":
        return <Inventario rol="recepcionista" />;

      case "servicios-orden":
        return <ServiciosOrdenPage />;
      case "servicios":
        return <CatalogoServicios />;
      case "facturacion-generar":
        return <GenerarFactura />;
      case "facturacion-listado":
        return <Facturas />;
      case "facturacion-cai":
        return <ActualizacionesCai />;

      default:
        return (
          <>
            <div className="cards">
              {loading ? (
                <p style={{ color: "#7B7A9E", gridColumn: "1/-1", fontSize: "14px" }}>
                  Cargando métricas operativas...
                </p>
              ) : (
                <>
                  <StatCard title="Órdenes activas" value={stats.ordenesActivas} color="#6C63FF" />
                  <StatCard title="Clientes" value={stats.totalClientes} color="#63B3ED" />
                  <StatCard title="Ingresos del mes" value={fmtMoneda(stats.ingresosMes)} color="#F6AD55" />
                  <StatCard title="Stock bajo" value={stats.alertasInventario} color="#FC8181" />
                </>
              )}
            </div>
            <div className="welcome">
              <h2>{welcome.title}</h2>
              <p>{welcome.subtitle}</p>
            </div>
          </>
        );
    }
  }

  return (
    <div className="dashboard">
      <Sidebar modules={modules} active={module} onSelect={setModule} />
      <div className="dashboard-main">
        <Header title={header.title} subtitle={header.subtitle} />
        <main className="dashboard-content">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
}
