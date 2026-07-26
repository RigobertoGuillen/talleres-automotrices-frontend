import api from "../../services/api";
import { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import Footer from "../../components/dashboard/Footer";
import ClientesModule from "../../pages/clientes/ClientesModule";
import Ordenesmodule from "../../pages/ordenes/Ordenesmodule";
import Vehiculos from "../../pages/vehiculos/Vehiculos";
import Diagnosticos from "../../pages/diagnosticos/Diagnosticos";

import Inventario from "../../pages/inventario/Inventario";

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

const header = {
  title: "Taller Mecánica Automotriz SuperAuto",
  subtitle: "Usted está identificado como Recepcionista",
};

const ESTADO_LABELS = {
  recibido: "Recibido",
  "en reparacion": "En Diagnóstico",
  listo: "Listo para Entrega",
};

// HU-45: mismos indicadores que el dashboard de administrador, pero con las
// 4 tarjetas relevantes para recepción, y con actualización automática.
const INTERVALO_ACTUALIZACION_MS = 30000;

function fmtMoneda(valor) {
  const n = Number(valor) || 0;
  return `L. ${n.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardRecepcionista() {
  const [module, setModule] = useState("dashboard");
  const [stats, setStats] = useState({
    ordenesActivas: 0,
    totalClientes: 0,
    ingresosMes: 0,
    alertasInventario: 0,
  });
  const [loading, setLoading] = useState(true);

  const [ordenesRecientes, setOrdenesRecientes] = useState([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);

  const [alertas, setAlertas] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(true);

  useEffect(() => {
    if (module !== "dashboard") return;

    let activo = true;

    function cargarStats(mostrarLoading) {
      if (mostrarLoading) setLoading(true);
      api.get("/reportes/dashboard")
        .then((res) => {
          if (activo) setStats(res.data);
        })
        .catch((err) => {
          console.error("Error cargando estadísticas del dashboard:", err);
        })
        .finally(() => {
          if (activo && mostrarLoading) setLoading(false);
        });

      setLoadingOrdenes(true);
      api.get("/dashboard/ordenes-recientes")
        .then((res) => {
          setOrdenesRecientes(res.data);
          setLoadingOrdenes(false);
        })
        .catch((err) => {
          console.error("Error cargando órdenes recientes:", err);
          setLoadingOrdenes(false);
        });

      setLoadingAlertas(true);
      api.get("/dashboard/alertas")
        .then((res) => {
          setAlertas(res.data);
          setLoadingAlertas(false);
        })
        .catch((err) => {
          console.error("Error cargando alertas:", err);
          setLoadingAlertas(false);
        });
    }

    cargarStats(true);
    const intervalo = setInterval(() => cargarStats(false), INTERVALO_ACTUALIZACION_MS);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [module]);

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

      case "inventario":
        return <Inventario rol="recepcionista" />;

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
              {loading ? (
                <p style={{ color: "#7B7A9E", gridColumn: "1/-1", fontSize: "14px" }}>
                  Cargando métricas operativas...
                </p>
              ) : (
                <>
                  <StatCard title="Órdenes activas" value={stats.ordenesActivas} color="#6C63FF" />
                  <StatCard title="Clientes" value={stats.totalClientes} color="#63B3ED" />
                  <StatCard title="Ingresos del mes" value={fmtMoneda(stats.ingresosMes)} color="#F6AD55" />
                  <StatCard title="Stock bajo" value={stats.alertasInventario} color="#FC8181" />
                </>
              )}
            </div>

            {/* ── Flujo de Trabajo Activo ─────────────────────────────── */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ background: "#1A1930", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ color: "#fff", marginBottom: "14px", fontSize: "16px" }}>
                  Últimos Vehículos Ingresados
                </h3>
                {loadingOrdenes ? (
                  <p style={{ color: "#7B7A9E", fontSize: "14px" }}>Cargando órdenes...</p>
                ) : ordenesRecientes.length === 0 ? (
                  <p style={{ color: "#7B7A9E", fontSize: "14px" }}>
                    No hay órdenes activas por el momento.
                  </p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "#7B7A9E", fontSize: "13px" }}>
                        <th style={{ paddingBottom: "8px" }}>Vehículo</th>
                        <th style={{ paddingBottom: "8px" }}>Cliente</th>
                        <th style={{ paddingBottom: "8px" }}>Estado</th>
                        <th style={{ paddingBottom: "8px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenesRecientes.map((o) => (
                        <tr key={o.numero_orden} style={{ borderTop: "1px solid #2A2945" }}>
                          <td style={{ padding: "8px 0", fontSize: "14px" }}>
                            {o.placa} — {o.marca} {o.modelo}
                          </td>
                          <td style={{ padding: "8px 0", fontSize: "14px" }}>{o.cliente}</td>
                          <td style={{ padding: "8px 0", fontSize: "14px" }}>
                            {ESTADO_LABELS[o.estado] || o.estado}
                          </td>
                          <td style={{ padding: "8px 0", textAlign: "right" }}>
                            <button
                              onClick={() => setModule("ordenes")}
                              style={{
                                background: "#6C63FF",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 12px",
                                cursor: "pointer",
                                fontSize: "13px",
                              }}
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* ── Resumen Financiero y Alertas ────────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              {/* Acciones rápidas */}
              <div style={{ background: "#1A1930", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ color: "#fff", marginBottom: "14px", fontSize: "16px" }}>
                  Acciones Rápidas
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={() => setModule("vehiculos")}
                    style={{
                      background: "#6C63FF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    + Registrar Ingreso de Vehículo
                  </button>
                  <button
                    onClick={() => setModule("ordenes")}
                    style={{
                      background: "#68D391",
                      color: "#0D0C1D",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    + Crear Nueva Orden
                  </button>
                  <button
                    onClick={() => setModule("facturacion-generar")}
                    style={{
                      background: "#F6AD55",
                      color: "#0D0C1D",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    + Generar Factura
                  </button>
                </div>
              </div>

              {/* Alertas críticas */}
              <div style={{ background: "#1A1930", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ color: "#fff", marginBottom: "14px", fontSize: "16px" }}>
                  Alertas Críticas
                </h3>
                {loadingAlertas ? (
                  <p style={{ color: "#7B7A9E", fontSize: "14px" }}>Cargando alertas...</p>
                ) : alertas.length === 0 ? (
                  <p style={{ color: "#7B7A9E", fontSize: "14px" }}>
                    Sin alertas por el momento.
                  </p>
                ) : (
                  alertas.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        background: "rgba(226,75,74,0.12)",
                        borderLeft: "3px solid #E24B4A",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    >
                      {a.mensaje}
                    </div>
                  ))
                )}
              </div>
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