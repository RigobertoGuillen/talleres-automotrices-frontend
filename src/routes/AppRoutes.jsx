import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import DashboardMecanico from "../pages/usuarios/DashboardMecanico";
import DashboardRecepcionista from "../pages/usuarios/DashboardRecepcionista";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboardAdmin" element={<DashboardAdmin />} />
      <Route path="/dashboardMecanico" element={<DashboardMecanico />} />
      <Route path="/dashboardRecepcionista" element={<DashboardRecepcionista />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}