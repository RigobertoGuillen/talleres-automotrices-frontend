import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import DashboardMecanico from "./pages/usuarios/DashboardMecanico"; 
import DashboardRecepcionista from "./pages/usuarios/DashboardRecepcionista"; 
import UserPage from "./pages/usuarios/UserPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/" element={<Login />} />

      {/* Ruta solo para Administradores */}
      <Route
  path="/dashboardAdmin"
  element={
    <ProtectedRoute allowedRoles={["admin", "administrador"]}>
      <DashboardAdmin />
    </ProtectedRoute>
  }
/>

      {/* Ruta para Mecánicos (y admin por si acaso) */}
      <Route
        path="/dashboardMecanico"
        element={
          <ProtectedRoute allowedRoles={["mecanico", "admin"]}>
            <DashboardMecanico />
          </ProtectedRoute>
        }
      />

      {/* Ruta para Recepcionistas (y admin por si acaso) */}
      <Route
        path="/dashboardRecepcionista"
        element={
          <ProtectedRoute allowedRoles={["recepcionista", "admin"]}>
            <DashboardRecepcionista />
          </ProtectedRoute>
        }
      />

      {/* Gestión de usuarios (Solo Admin) */}
      <Route
  path="/usuarios/UserPage"
  element={
    <ProtectedRoute allowedRoles={["admin", "administrador"]}>
      <UserPage />
    </ProtectedRoute>
  }
/>

      {/* Comodín: si escriben cualquier otra cosa, al login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;