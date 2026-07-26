export const s = {
  btnPrimario: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff', border: 'none', padding: '10px 20px',
    borderRadius: 10, fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  btnSecundario: {
    background: '#f3f4f6', color: '#374151',
    border: '1px solid #d1d5db', padding: '9px 16px',
    borderRadius: 10, fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 600, fontSize: 12, cursor: 'pointer',
  },
  btnExportar: (color) => ({
    background: color, color: '#fff', border: 'none',
    padding: '9px 16px', borderRadius: 10, fontSize: 12,
    fontFamily: 'Segoe UI, sans-serif', fontWeight: 600, cursor: 'pointer',
  }),
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
  errorBox: {
    background: '#fee2e2', color: '#991b1b',
    border: '1px solid #fecaca', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  tabsBar: {
    display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap',
  },
  tabBtn: (activa) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '10px 16px', fontSize: 13, fontWeight: 600,
    color: activa ? '#1d4ed8' : '#6b7280',
    borderBottom: activa ? '2px solid #1d4ed8' : '2px solid transparent',
    marginBottom: -1,
  }),
  tarjeta: (color = '#2563eb') => ({
    background: '#fff', border: `1px solid ${color}30`, borderRadius: 12,
    padding: '16px 20px', flex: 1, minWidth: 160,
  }),
  filtrosBar: {
    display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap',
    marginBottom: 16, background: '#fff', padding: '14px 20px', borderRadius: 12,
  },
};

export const badgeEstadoOrden = (estado) => {
  const m = {
    recibido: ['#dbeafe', '#1e40af'], 'en reparacion': ['#fef3c7', '#92400e'],
    listo: ['#d1fae5', '#065f46'], entregado: ['#f3f4f6', '#374151'],
  };
  const [bg, color] = m[estado] || ['#f3f4f6', '#374151'];
  return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

export const badgeTipoVehiculo = (tipo) => {
  const m = { Pickup: ['#fef3c7', '#92400e'], turismo: ['#d1fae5', '#065f46'], camioneta: ['#ede9fe', '#5b21b6'] };
  const [bg, color] = m[tipo] || ['#f3f4f6', '#374151'];
  return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

export function fmtFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtMoneda(valor) {
  const n = Number(valor) || 0;
  return `L. ${n.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Rango de fechas por defecto: los últimos 30 días.
export function rangoPorDefecto() {
  const hoy = new Date();
  const hace30 = new Date();
  hace30.setDate(hoy.getDate() - 30);
  const toISO = (d) => d.toISOString().slice(0, 10);
  return { fechaInicio: toISO(hace30), fechaFin: toISO(hoy) };
}

// Barra de barras simple en SVG, sin dependencias externas, para HU-42.
export function BarraSVG({ datos, campoEtiqueta, campoValor, color = '#2563eb', alto = 180 }) {
  if (!datos || datos.length === 0) return null;
  const max = Math.max(...datos.map(d => Number(d[campoValor]) || 0), 1);
  const anchoBarra = Math.max(24, Math.min(60, 600 / datos.length - 10));
  const ancho = datos.length * (anchoBarra + 10) + 10;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(ancho, 300)} height={alto + 40} style={{ display: 'block' }}>
        {datos.map((d, i) => {
          const valor = Number(d[campoValor]) || 0;
          const h = (valor / max) * alto;
          const x = 10 + i * (anchoBarra + 10);
          const y = alto - h + 10;
          return (
            <g key={i}>
              <rect x={x} y={y} width={anchoBarra} height={h} rx={4} fill={color} />
              <text x={x + anchoBarra / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#374151">
                {valor}
              </text>
              <text x={x + anchoBarra / 2} y={alto + 24} textAnchor="middle" fontSize="9" fill="#6b7280">
                {String(d[campoEtiqueta]).slice(0, 8)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
