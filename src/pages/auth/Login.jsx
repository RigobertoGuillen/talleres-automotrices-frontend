import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usuarioService } from "../../services/usuarioService";

// Imagen del lado izquierdo
import loginImage from "../../assets/login-superauto.png";

// =========================
// STRATEGY
// =========================
const roleNavigationStrategies = {
  admin: { route: "/dashboardAdmin" },
  administrador: { route: "/dashboardAdmin" },
  mecanico: { route: "/dashboardMecanico" },
  recepcionista: { route: "/dashboardRecepcionista" },
};

function resolveNavigationStrategy(rol) {
  return roleNavigationStrategies[rol] ?? null;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await usuarioService.login(
        username.trim(),
        password.trim()
      );

      if (response && response.token) {
        login(response);

        const rol =
          response.rol ||
          response.usuario?.rol ||
          response.user?.rol;

        const strategy = resolveNavigationStrategy(rol);

        if (strategy) {
          navigate(strategy.route);
        } else {
          setError("Rol de usuario no reconocido");
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
    <div className="login-page">

      {/* Fondo */}
      <div className="dots-bg"></div>
      <div className="orb orb1"></div>
      <div className="orb orb2"></div>

      <div className="login-container">

        {/* PANEL IZQUIERDO */}
        <div
          className="login-left"
          style={{ backgroundImage: `url(${loginImage})` }}
        >
          <div className="login-left-overlay"></div>
        </div>

        {/* PANEL DERECHO */}
        <div className="login-right">

          <div className="login-card">

            <span className="login-tag">
              Sistema de Gestión
            </span>

            <h1>
              Bienvenido <span>de vuelta</span>
            </h1>

            <p>
              Ingresa tus credenciales para continuar.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Usuario */}
              <div className="form-group">
                <label>Usuario</label>

                <div className="input-container">
                  <i className="ti ti-user"></i>

                  <input
                    type="text"
                    placeholder="usuario"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Contraseña</label>

                <div className="input-container">
                  <i className="ti ti-lock"></i>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"}></i>
                  </button>
                </div>
              </div>

              <div className="forgot-password">
                <Link to="/recuperar-password">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <button
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}