import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";
import ClientesModule from "../../pages/clientes/ClientesModule";
import Diagnosticos from "../../pages/diagnosticos/Diagnosticos";

const modules = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "ordenes",      label: "Órdenes de Trabajo" },
  { key: "diagnosticos", label: "Diagnósticos" },
  { key: "cliente",      label: "Clientes" },
  { key: "vehiculos",    label: "Vehículos" },
  { key: "inventario",   label: "Inventario" },
  { key: "facturación",  label: "Facturación" },
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
      case "diagnosticos":
        return <Diagnosticos />;
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
