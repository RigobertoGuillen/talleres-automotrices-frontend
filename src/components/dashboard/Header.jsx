import { useNavigate } from "react-router-dom";

export default function Header({
  title,
  subtitle
}) {

  const navigate = useNavigate();

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
      onClick={() => navigate("/")}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#c0392b"; // Rojo más oscuro
        e.currentTarget.style.transform = "scale(1.05)"; // Efecto de crecimiento
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#e74c3c"; // Rojo original
        e.currentTarget.style.transform = "scale(1)"; // Tamaño original
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
      }}
    >
      Cerrar Sesión
    </button>


        </header>
      );
    }