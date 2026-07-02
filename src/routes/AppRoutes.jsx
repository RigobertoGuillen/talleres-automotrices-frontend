import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import DashboardMecanico from "../pages/usuarios/DashboardMecanico";
import DashboardRecepcionista from "../pages/usuarios/DashboardRecepcionista";
import UserPage from "../pages/usuarios/UserPage";
import RecuperarPassword from "../pages/auth/RecuperarPassword";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboardAdmin" element={<DashboardAdmin />} />
      <Route path="/usuarios/UserPage" element={<UserPage />} />
      <Route path="/dashboardMecanico" element={<DashboardMecanico />} />
      <Route path="/dashboardRecepcionista" element={<DashboardRecepcionista />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}