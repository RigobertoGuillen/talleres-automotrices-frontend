import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validarCorreo(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }
    if (!validarCorreo(correo.trim())) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Ajusta esta ruta cuando el backend esté listo
      await api.post("/auth/recuperar-password", { correo: correo.trim() });
      setEnviado(true);
    } catch (err) {
      const msg = err.response?.data?.message ?? "Error al conectar con el servidor";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="dots-bg" />
      <div className="orb orb--main" />
      <div className="orb orb--accent" />

      <div className="login-page-wrap">

        {/* Header */}
        <header className="login-page-header">
          <div className="login-logo">
            <div className="login-logo__icon">
              <svg fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <p className="login-logo__name">TALLER DE MECANICA AUTOMOTRIZ SUPERAUTO</p>
              <p className="login-logo__sub">Control de acceso</p>
            </div>
          </div>
        </header>

        {/* Card principal */}
        <div className="login-card">

          {!enviado ? (
            <>
              <h1 className="login-heading">Recuperar contraseña</h1>
              <p className="login-subheading">
                Ingresa tu correo electrónico y te enviaremos tu contraseña.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="login-field">
                  <label htmlFor="correo" className="login-label">
                    Correo electrónico
                  </label>
                  <div className="login-input-wrap">
                    <svg className="login-input-icon" fill="none" stroke="currentColor"
                      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                      viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    <input
                      id="correo"
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={correo}
                      onChange={(e) => {
                        setCorreo(e.target.value);
                        setError("");
                      }}
                      required
                      className="login-input"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="login-error" role="alert">
                    <svg fill="none" stroke="currentColor" strokeWidth={2}
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                      <svg className="login-btn__spinner" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando…
                    </>
                  ) : (
                    "Enviar contraseña"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="login-success">
              <div className="login-success__icon">
                <svg fill="none" stroke="currentColor" strokeWidth={2}
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className="login-heading" style={{ marginBottom: 10 }}>
                Correo enviado
              </h1>
              <p className="login-subheading" style={{ marginBottom: 4 }}>
                Si el correo <strong>{correo}</strong> está registrado, recibirás tu
                contraseña en unos minutos.
              </p>
              <p className="login-subheading">
                Revisa también tu carpeta de spam.
              </p>
            </div>
          )}

          <div className="login-divider">
            <span>O</span>
          </div>

          <p className="login-register">
            <Link to="/">← Volver al inicio de sesión</Link>
          </p>
        </div>

        {/* Footer */}
        <footer className="login-page-footer">
          <p>© {new Date().getFullYear()} Taller Mecánica Automotriz SuperAuto · Todos los derechos reservados</p>
        </footer>

      </div>
    </div>
  );
}