import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";
import Ordenesmodule from "../../pages/ordenes/Ordenesmodule";
import Vehiculos from "../../pages/vehiculos/Vehiculos";
import Diagnosticos from "../../pages/diagnosticos/Diagnosticos";

const modules = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "ordenes",      label: "Mis Órdenes" },
  { key: "diagnosticos", label: "Diagnósticos" },
  { key: "vehiculos",    label: "Vehículos" },
];

const cards = [
  { title: "Órdenes asignadas", value: 5, color: "#4CAF50" },
  { title: "En reparación",     value: 3, color: "#2196F3" },
  { title: "Completadas hoy",   value: 1, color: "#FF9800" },
  { title: "Pendientes",        value: 2, color: "#9C27B0" },
];

const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Mecánico",
};

const welcome = {
  title: "Bienvenido al Panel de Mecánico",
  subtitle: "Desde aquí puedes gestionar tus órdenes asignadas.",
};

export default function DashboardMecanico() {
  const [module, setModule] = useState("dashboard");

  function renderContent() {
    switch (module) {
      case "vehiculos":
        return <Vehiculos />;
      case "ordenes":
        return <Ordenesmodule />;
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