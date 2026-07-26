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
import GenerarFactura from "../../pages/facturacion/GenerarFactura";
import Inventario from "../../pages/inventario/Inventario";

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

const ESTADO_LABELS = {
  recibido: "Recibido",
  "en reparacion": "En Diagnóstico",
  listo: "Listo para Entrega",
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

  const [ordenesRecientes, setOrdenesRecientes] = useState([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);

  const [cargaMecanicos, setCargaMecanicos] = useState([]);
  const [loadingCarga, setLoadingCarga] = useState(true);

  const [alertas, setAlertas] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(true);

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

      setLoadingCarga(true);
      api.get("/dashboard/carga-mecanicos")
        .then((res) => {
          setCargaMecanicos(res.data);
          setLoadingCarga(false);
        })
        .catch((err) => {
          console.error("Error cargando carga de mecánicos:", err);
          setLoadingCarga(false);
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
        case "facturación":
        return <GenerarFactura />;
        case "inventario":
        return <Inventario rol="administrador" />;
      
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
                    color="#E24B4A"
                  />
                </>
              )}
            </div>

            {/* ── Flujo de Trabajo Activo ─────────────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cargaMecanicos.length ? "2fr 1fr" : "1fr",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              {/* Tabla de últimos vehículos / próximas entregas */}
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
                              onClick={() => handleModule("ordenes")}
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

              {/* Distribución de carga de trabajo — solo admin */}
              <div style={{ background: "#1A1930", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ color: "#fff", marginBottom: "14px", fontSize: "16px" }}>
                  Carga de Mecánicos
                </h3>
                {loadingCarga ? (
                  <p style={{ color: "#7B7A9E", fontSize: "14px" }}>Cargando...</p>
                ) : cargaMecanicos.length === 0 ? (
                  <p style={{ color: "#7B7A9E", fontSize: "14px" }}>
                    No hay mecánicos activos registrados.
                  </p>
                ) : (
                  cargaMecanicos.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderTop: "1px solid #2A2945",
                        color: "#fff",
                        fontSize: "14px",
                      }}
                    >
                      <span>{m.nombre_completo}</span>
                      <span style={{ color: "#9B8FFF", fontWeight: "bold" }}>
                        {m.ordenes_asignadas}
                      </span>
                    </div>
                  ))
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
                    onClick={() => handleModule("vehiculos")}
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
                    onClick={() => handleModule("ordenes")}
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
                    onClick={() => handleModule("facturación")}
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