import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTable from "../../components/usuarios/UserTable";
import UserForm  from "../../components/usuarios/UserForm";
import useUsers  from "../../hooks/useUser";
import "./userpage.css";

const TOAST_DURATION = 3000;

export default function UserPage() {
  const { users, addUser, editUser, removeUser, changeStatus } = useUsers();
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast]       = useState(null); // { type: "loading"|"success"|"error", msg }
  const navigate = useNavigate();

  const showToast = (type, msg) => {
    setToast({ type, msg });
    if (type !== "loading") {
      setTimeout(() => setToast(null), TOAST_DURATION);
    }
  };

  const handleSave = async (user) => {
    const isEditing = !!editing;
    showToast("loading", isEditing ? "Actualizando usuario..." : "Registrando usuario...");
    try {
      if (isEditing) {
        await editUser(editing.id, user);
        setEditing(null);
        showToast("success", "Usuario actualizado correctamente.");
      } else {
        await addUser(user);
        showToast("success", "Usuario registrado correctamente.");
      }
      setShowForm(false);
    } catch {
      showToast("error", "Ocurrió un error. Intenta de nuevo.");
    }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="up-container">

      {/* ── Toast ── */}
      {toast && (
        <div className={`up-toast up-toast--${toast.type}`}>
          <i
            className={`ti ${
              toast.type === "loading" ? "ti-loader-2 up-spin" :
              toast.type === "success" ? "ti-circle-check" :
              "ti-circle-x"
            }`}
            aria-hidden="true"
          />
          {toast.msg}
        </div>
      )}

      {/* ── Vista 1: historial de usuarios ── */}
      {!showForm && (
        <>
          <div className="up-header">
            <div className="up-header-left">
              <button
                className="up-btn-back"
                onClick={() => navigate("/dashboardAdmin")}
                aria-label="Regresar al dashboard"
              >
                <i className="ti ti-arrow-left" aria-hidden="true" /> Regresar
              </button>
              <div>
                <h2 className="up-title">Historial de usuarios</h2>
                <p className="up-subtitle">
                  {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button className="up-btn-new" onClick={() => setShowForm(true)}>
              <i className="ti ti-plus" aria-hidden="true" /> Nuevo usuario
            </button>
          </div>

          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={removeUser}
            onToggle={changeStatus}
          />
        </>
      )}

      {/* ── Vista 2: registro / edición ── */}
      {showForm && (
        <>
          <div className="up-header">
            <div className="up-header-left">
              <button
                className="up-btn-back"
                onClick={handleCancel}
                aria-label="Regresar al historial"
              >
                <i className="ti ti-arrow-left" aria-hidden="true" /> Regresar
              </button>
              <div>
                <h2 className="up-title">
                  {editing ? "Editar usuario" : "Registro de usuario"}
                </h2>
                <p className="up-subtitle">
                  {editing
                    ? "Modifica los datos del usuario"
                    : "Completa el formulario para crear un usuario"}
                </p>
              </div>
            </div>
          </div>

          <UserForm
            onSave={handleSave}
            initial={editing}
            onCancel={handleCancel}
          />
        </>
      )}

    </div>
  );
}