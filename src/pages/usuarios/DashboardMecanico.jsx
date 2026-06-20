import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";

//modulos del sidebard del dashboard administrativo
const modules = [
  {key: "dashboard", label: "Dashboard"},
  {key: "ordenes", label: "Órdenes de Trabajo"},
  {key: "diagnosticos", label: "Diagnósticos"},
  {key: "cliente", label: "Clientes"},
  {key: "vehiculos", label: "Vehículos"},
  {key: "inventario", label: "Inventario"},
  
  
];

//datos de ejemplo para las tarjetas de estadisticas
const cards = [
{
  title: "Órdenes activas",
  value: 5,
  color: "#4CAF50"
},
{
  title: "clientes",
  value: "4",
  color: "#2196F3"
},
{
  title: "Ingresos cobrados",
  value: "$2,000.00",
  color: "#FF9800"
},
{
  title: "Stock bajo",
  value: "2",
  color: "#9C27B0"
}
];

//informacion del header del dashboard
const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Mecánico"
};

//mensaje de bienvenida al dashboard mecanico
const welcome = {
  title: "Bienvenido al Panel de Mecánico",
  subtitle: "Desde aquí puedes gestionar todo el sistema del taller."
};

export default function DashboardMecanico() {

  const [module, setModule] = useState("dashboard");

  return (

    <div className="dashboard">

      <Sidebar
        modules={modules}
        active={module}
        onSelect={setModule}
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


