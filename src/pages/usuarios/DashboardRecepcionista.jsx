import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";
import ClientesModule from "../../pages/clientes/ClientesModule";
import Ordenesmodule from "../../pages/ordenes/Ordenesmodule";
import Vehiculos from "../../pages/vehiculos/Vehiculos";
import Diagnosticos from "../../pages/diagnosticos/Diagnosticos";
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

const cards = [
  { title: "Órdenes activas",   value: 12,         color: "#6C63FF" },
  { title: "Clientes",          value: "128",       color: "#63B3ED" },
  { title: "Ingresos cobrados", value: "$2,000.00", color: "#F6AD55" },
  { title: "Stock bajo",        value: "2",         color: "#FC8181" },
];

const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Recepcionista",
};

const welcome = {
  title: "Bienvenido al Panel de Recepcionista",
  subtitle: "Desde aquí puedes gestionar todo el sistema del taller.",
};

export default function DashboardRecepcionista() {
  const [module, setModule] = useState("dashboard");

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
              {cards.map((card) => (
                <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  color={card.color}
                />
              ))}
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