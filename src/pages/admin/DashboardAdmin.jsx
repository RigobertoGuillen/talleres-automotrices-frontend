import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";

//modulos del sidebard del dashboard administrativo
const modules = [
  {key: "dashboard", label: "Dashboard"},
  {key: "ordenes", label: "Órdenes de Trabajo"},
  {key: "diagnosticos", label: "Diagnosticos"},
  {key: "cliente", label: "Clientes"},
  {key: "vehiculos", label: "Vehículos"},
  {key: "inventario", label: "Inventario"},
  {key: "facturación", label: "Facturación"},
  {key: "reportes", label: "Reportes"},
  {key: "usuarios", label: "Gestión de Usuarios"}, // Este es el que quieres que redirija
];

//datos de ejemplo para las tarjetas de estadisticas
const cards = [
{
  title: "Órdenes Pendientes",
  value: 12,
  color: "#4CAF50"
},
{
  title: "Vehículos",
  value: "128",
  color: "#2196F3"
},
{
  title: "Diagnósticos",
  value: "45",
  color: "#FF9800"
},
{
  title: "Clientes",
  value: "200",
  color: "#9C27B0"
}
];

//informacion del header del dashboard
const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Administrador"
};

//mensaje de bienvenida al dashboard administrativo
const welcome = {
  title: "Bienvenido al Panel Administrativo",
  subtitle: "Desde aquí puedes gestionar todo el sistema del taller."
};

export default function DashboardAdmin() {

  const [module, setModule] = useState("dashboard");
  const navigate = useNavigate();
  
  const handleModule = (moduleKey) => {
    // Si el módulo seleccionado es "usuarios", redirige a la ruta
    if(moduleKey === "usuarios"){
      navigate("/usuarios/UserPage");
      return;
    }
    // Para los demás módulos, solo cambia el estado
    setModule(moduleKey);
  }

  return (

    <div className="dashboard">

      <Sidebar
        modules={modules}
        active={module}
        onSelect={handleModule}
      />
      
      <main className="dashboard-content">

        <Header
          title={header.title}
          subtitle={header.subtitle}
        />

        <div className="cards">
          {
            cards.map((card) =>(
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                color={card.color}
              />
            ))
          }
        </div>

        <div className="welcome">
          <h2>{welcome.title}</h2>
          <p>{welcome.subtitle}</p>
        </div>
        

      </main>

    </div>  
  )

};