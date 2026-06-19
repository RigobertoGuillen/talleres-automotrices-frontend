import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div>
        <h1 style={{ color: "#fff" }}>Taller Mecánico SuperAuto</h1>

        <span style={{ color: "#fff" }}>
          Panel Administrativo
        </span>
      </div>

      <button
        className="logout"
        onClick={() => navigate("/")}
      >
        Cerrar sesión
      </button>
    </header>
  );
}