import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";
import ClientesModule from "../../pages/clientes/ClientesModule";
import Vehiculos from "../../pages/vehiculos/Vehiculos";
import Ordenesmodule from "../../pages/ordenes/Ordenesmodule";
import Diagnosticos from "../../pages/diagnosticos/Diagnosticos";
import ordenes from "../../pages/ordenes/Ordenesmodule";
const modules = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "ordenes",      label: "Órdenes de Trabajo" },
  { key: "diagnosticos", label: "Diagnósticos" },
  { key: "cliente",      label: "Clientes" },
  { key: "vehiculos",    label: "Vehículos" },
  { key: "inventario",   label: "Inventario" },
  { key: "facturación",  label: "Facturación" },
  { key: "reportes",     label: "Reportes" },
  { key: "usuarios",     label: "Gestión de Usuarios" },
];

const cards = [
  { title: "Órdenes Pendientes", value: 12,    color: "#6C63FF" },
  { title: "Vehículos",          value: "128",  color: "#63B3ED" },
  { title: "Diagnósticos",       value: "45",   color: "#F6AD55" },
  { title: "Clientes",           value: "200",  color: "#68D391" },
];

const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Administrador",
};

const welcome = {
  title: "Bienvenido al Panel Administrativo",
  subtitle: "Desde aquí puedes gestionar todo el sistema del taller.",
};

export default function DashboardAdmin() {
  const [module, setModule] = useState("dashboard");
  const navigate = useNavigate();

  function handleModule(key) {
    if (key === "usuarios") {
      navigate("/usuarios/UserPage");
      return;
    }
    setModule(key);
  }

  function renderContent() {
    switch (module) {
      case "cliente":
        return <ClientesModule />;
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
      <Sidebar modules={modules} active={module} onSelect={handleModule} />
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