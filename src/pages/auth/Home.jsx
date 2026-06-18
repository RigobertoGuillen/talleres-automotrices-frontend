import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <h1>Menú Principal</h1>

      <p>Bienvenido {user.username}</p>
      <p>Rol: {user.role}</p>

      <button onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
}