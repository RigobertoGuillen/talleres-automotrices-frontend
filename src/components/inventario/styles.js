export const s = {
  btnPrimario: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff', border: 'none', padding: '10px 20px',
    borderRadius: 10, fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  btnSecundario: {
    background: '#f3f4f6', color: '#374151',
    border: '1px solid #d1d5db', padding: '10px 20px',
    borderRadius: 10, fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: 11,
    fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  td: { padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#6b7280', letterSpacing: '0.5px',
    textTransform: 'uppercase', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 13, fontFamily: 'Segoe UI, sans-serif',
    outline: 'none', boxSizing: 'border-box', color: '#374151',
    background: '#fff',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 32,
    width: '100%', maxWidth: 600,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    maxHeight: '92vh', overflowY: 'auto',
  },
  errorBox: {
    background: '#fee2e2', color: '#991b1b',
    border: '1px solid #fecaca', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  tabsBar: {
    display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #e5e7eb',
  },
  tabBtn: (activa) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '10px 16px', fontSize: 13, fontWeight: 600,
    color: activa ? '#1d4ed8' : '#6b7280',
    borderBottom: activa ? '2px solid #1d4ed8' : '2px solid transparent',
    marginBottom: -1,
  }),
};

export const btnAccion = (color) => ({
  background: color, color: '#fff', border: 'none',
  padding: '5px 12px', borderRadius: 6, fontSize: 12,
  cursor: 'pointer', marginRight: 6, fontWeight: 500,
});

// Badge de cantidad disponible vs. cantidad mínima (HU-29 / HU-32)
export const badgeStock = (disponible, minima) => {
  if (disponible <= 0) return { background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 };
  if (disponible <= minima) return { background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 };
  return { background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

export const badgeTipoMovimiento = (tipo) => {
  const m = { entrada: ['#d1fae5', '#065f46'], salida: ['#fee2e2', '#991b1b'] };
  const [bg, color] = m[tipo] || ['#f3f4f6', '#374151'];
  return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' };
};
