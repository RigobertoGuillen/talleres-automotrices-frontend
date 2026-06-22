import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header({
  title,
  subtitle
}) {

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">

      <div>
        <h1 style={{ color: "#fff" }}>{title}</h1>

        <span style={{ color: "#fff" }}>
          {subtitle}
        </span>
      </div>

      <button
      style={{
        backgroundColor: "#e74c3c",
        color: "#fff",
        border: "none",
        padding: "12px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: "scale(1)",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
      className="btn"
      onClick={handleLogout}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#c0392b";
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#e74c3c";
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
      }}
    >
      Cerrar Sesión
    </button>

    </header>
  );
}