import api from "../../services/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";
import ClientesModule from "../../pages/clientes/ClientesModule";
import Vehiculos from "../../pages/vehiculos/Vehiculos";
import Ordenesmodule from "../../pages/ordenes/Ordenesmodule";
import Diagnosticos from "../../pages/diagnosticos/Diagnosticos";

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

const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Administrador",
};

const welcome = {
  title: "Bienvenido al Panel Administrativo",
  subtitle: "El sistema se encuentra sincronizado con la base de datos en tiempo real.",
};

export default function DashboardAdmin() {
  const [module, setModule] = useState("dashboard");
  const [stats, setStats] = useState({
    ordenesProgreso: 0,
    vehiculosListos: 0,
    diagnosticosPendientes: 0,
    alertasInventario: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Llamada al endpoint para traer las métricas reales
  useEffect(() => {
    if (module === "dashboard") {
      setLoading(true);
      api.get("/dashboard/stats")
        .then((res) => {
          setStats(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error cargando estadísticas del dashboard:", err);
          setLoading(false);
        });
    }
  }, [module]);

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
              {loading ? (
                <p style={{ color: "#7B7A9E", gridColumn: "1/-1", fontSize: "14px" }}>
                  Cargando métricas operativas...
                </p>
              ) : (
                <>
                  <StatCard
                    title="Órdenes en Progreso"
                    value={stats.ordenesProgreso}
                    color="#6C63FF"
                  />
                  <StatCard
                    title="Vehículos por Retirar"
                    value={stats.vehiculosListos}
                    color="#68D391"
                  />
                  <StatCard
                    title="Diagnósticos Pendientes"
                    value={stats.diagnosticosPendientes}
                    color="#F6AD55"
                  />
                  <StatCard
                    title="Alertas de Inventario"
                    value={stats.alertasInventario}
                    color="#E24B4A" // Color rojo directo de tu botón de logout para advertencia
                  />
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