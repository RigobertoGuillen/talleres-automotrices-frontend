import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";

const modules = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "ordenes",      label: "Órdenes de Trabajo" },
  { key: "diagnosticos", label: "Diagnósticos" },
  { key: "cliente",      label: "Clientes" },
  { key: "vehiculos",    label: "Vehículos" },
  { key: "inventario",   label: "Inventario" },
];

const cards = [
  { title: "Órdenes activas",   value: 5,          color: "#6C63FF" },
  { title: "Clientes",          value: "4",         color: "#63B3ED" },
  { title: "Ingresos cobrados", value: "$2,000.00", color: "#F6AD55" },
  { title: "Stock bajo",        value: "2",         color: "#FC8181" },
];

const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Mecánico",
};

const welcome = {
  title: "Bienvenido al Panel de Mecánico",
  subtitle: "Desde aquí puedes gestionar todo el sistema del taller.",
};

export default function DashboardMecanico() {
  const [module, setModule] = useState("dashboard");

  return (
    <div className="dashboard">
      <Sidebar modules={modules} active={module} onSelect={setModule} />
      <div className="dashboard-main">
        <Header title={header.title} subtitle={header.subtitle} />
        <main className="dashboard-content">
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
        </main>
        <Footer />
      </div>
    </div>
  );
}
