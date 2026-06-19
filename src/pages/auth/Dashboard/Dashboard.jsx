import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import StatCard from "../../../components/StatCard";

export default function Dashboard() {

  const [module, setModule] = useState("dashboard");

  return (
    <div className="dashboard">

      <Sidebar
        current={module}
        onSelect={setModule}
      />

      <main className="dashboard-content">

        <Header />

        {
          module === "dashboard" && (
            <>
              <h2 style={{ color: "#fff" }}>Dashboard</h2>

              <div className="cards">

                <StatCard
                  title="Clientes"
                  value="245"
                  color="#2563eb"
                />

                <StatCard
                  title="Vehículos"
                  value="128"
                  color="#16a34a"
                />

                <StatCard
                  title="Órdenes"
                  value="39"
                  color="#ea580c"
                />

                <StatCard
                  title="Facturación"
                  value="L 154,320"
                  color="#9333ea"
                />

              </div>

              <div className="welcome">

                <h3>Bienvenido Administrador</h3>

                <p>
                  Desde aquí podrás administrar todo el sistema del taller.
                </p>

              </div>

            </>
          )
        }

        {
          module !== "dashboard" &&
          (
            <div className="module">

              <h2>{module.toUpperCase()}</h2>

              <p>
                Aquí irá el módulo de <b>{module}</b>.
              </p>

            </div>
          )
        }

      </main>

    </div>
  );

}