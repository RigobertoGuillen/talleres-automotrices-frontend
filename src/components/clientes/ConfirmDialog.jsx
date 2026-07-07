/**
 * SRP — ConfirmDialog tiene una sola responsabilidad:
 * mostrar un diálogo de confirmación genérico.
 */
export default function ConfirmDialog({
  open, onClose, onConfirm,
  title, description,
  confirmLabel = "Confirmar",
  loading = false,
}) {
  if (!open) return null;
  return (
    <div className="cl-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cl-modal cl-modal--sm">
        <div className="cl-modal__body">
          <h3 className="cl-confirm__title">{title}</h3>
          <p className="cl-confirm__desc">{description}</p>
          <div className="cl-confirm__actions">
            <button className="cl-btn cl-btn--secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="cl-btn cl-btn--delete" onClick={onConfirm} disabled={loading}>
              {loading ? "Eliminando…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}