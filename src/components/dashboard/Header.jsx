import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="dash-header">
      <div className="dash-header__brand">
        <div className="dash-header__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div>
          <h1 className="dash-header__title">{title}</h1>
          <span className="dash-header__subtitle">{subtitle}</span>
        </div>
      </div>

      <div className="dash-header__right">
        <div className="dash-header__user">
          <div className="dash-header__user-dot" aria-hidden="true" />
          <span className="dash-header__user-label">En línea</span>
        </div>
        <button className="dash-header__logout" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
