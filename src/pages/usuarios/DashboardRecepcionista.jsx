import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import ClientesModule from "../../pages/clientes/ClientesModule";

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
  { title: "Órdenes activas",   value: 12,         color: "#4CAF50" },
  { title: "Clientes",          value: "128",       color: "#2196F3" },
  { title: "Ingresos cobrados", value: "$2,000.00", color: "#FF9800" },
  { title: "Stock bajo",        value: "2",         color: "#9C27B0" },
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
      // case "ordenes":   return <OrdenesModule />;
      // case "vehiculos": return <VehiculosModule />;
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
      <main className="dashboard-content">
        <Header title={header.title} subtitle={header.subtitle} />
        {renderContent()}
      </main>
    </div>
  );
}