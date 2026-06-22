import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usuarioService } from "../../services/usuarioService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!username.trim() || !password.trim()) {
    setError("Por favor completa todos los campos");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    const response = await usuarioService.login(username.trim(), password.trim());
    
    if (response && response.token) {
      login(response); 
      
      const rol = response.rol || response.usuario?.rol || response.user?.rol;

      if (rol === "admin" || rol === "administrador") {
        navigate("/dashboardAdmin");
      } else if (rol === "mecanico") {
        navigate("/dashboardMecanico");
      } else if (rol === "recepcionista") {
        navigate("/dashboardRecepcionista");
      } else {
        setError("Rol de usuario no reconocido en el sistema");
      }
    } else {
      throw new Error("Credenciales inválidas");
    }
  } catch (err) {
    setError(err.message || "Error al conectar con el servidor");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-root">
      <div className="dots-bg" />
      <div className="orb orb--main" />
      <div className="orb orb--accent" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo__icon">
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <p className="login-logo__name">TALLER DE MECANICA AUTOMOTRIZ SUPERAUTO</p>
            <p className="login-logo__sub">Control de acceso</p>
          </div>
        </div>

        <h1 className="login-heading">Bienvenido de vuelta</h1>
        <p className="login-subheading">Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="username" className="login-label">
              Usuario
            </label>
            <div className="login-input-wrap">
              <svg
                className="login-input-icon"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                id="username"
                type="text"
                placeholder="usuario / admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                required
                className="login-input"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <div className="login-input-wrap">
              <svg
                className="login-input-icon"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                className="login-input"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="login-forgot-wrap">
            <a href="#" className="login-forgot">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? (
              <>
                <svg
                  className="login-btn__spinner"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando…
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}