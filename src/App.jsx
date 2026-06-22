import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import UserPage from "./pages/usuarios/UserPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        path="/dashboardAdmin"
        element={
          <ProtectedRoute>
            <DashboardAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios/UserPage"
        element={
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;