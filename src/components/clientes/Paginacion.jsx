/**
 * SRP — Paginacion tiene una sola responsabilidad:
 * renderizar los controles de paginación.
 */
export default function Paginacion({ paginaActual, totalPaginas, totalClientes, onCambiarPagina }) {
  if (totalPaginas <= 1) return null;

  // Genera rango de páginas visible (máx 5 botones)
  function rango() {
    const delta = 2;
    const left  = Math.max(1, paginaActual - delta);
    const right = Math.min(totalPaginas, paginaActual + delta);
    const paginas = [];
    for (let i = left; i <= right; i++) paginas.push(i);
    return paginas;
  }

  const paginas = rango();

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginTop: 16, flexWrap: "wrap", gap: 8,
    }}>
      <span style={{ fontSize: 12, color: "#5A5880" }}>
        Página {paginaActual} de {totalPaginas} · {totalClientes} cliente{totalClientes !== 1 ? "s" : ""}
      </span>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {/* Anterior */}
        <BtnPagina
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          label="←"
        />

        {/* Primera página si no está en el rango */}
        {paginas[0] > 1 && (
          <>
            <BtnPagina onClick={() => onCambiarPagina(1)} label="1" />
            {paginas[0] > 2 && <span style={{ color: "#5A5880", fontSize: 13, padding: "0 2px" }}>…</span>}
          </>
        )}

        {/* Páginas del rango */}
        {paginas.map((p) => (
          <BtnPagina
            key={p}
            onClick={() => onCambiarPagina(p)}
            label={String(p)}
            activo={p === paginaActual}
          />
        ))}

        {/* Última página si no está en el rango */}
        {paginas[paginas.length - 1] < totalPaginas && (
          <>
            {paginas[paginas.length - 1] < totalPaginas - 1 && (
              <span style={{ color: "#5A5880", fontSize: 13, padding: "0 2px" }}>…</span>
            )}
            <BtnPagina onClick={() => onCambiarPagina(totalPaginas)} label={String(totalPaginas)} />
          </>
        )}

        {/* Siguiente */}
        <BtnPagina
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          label="→"
        />
      </div>
    </div>
  );
}

function BtnPagina({ onClick, label, activo, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: activo ? "1px solid rgba(108,99,255,0.5)" : "1px solid rgba(108,99,255,0.15)",
        background: activo ? "rgba(108,99,255,0.18)" : "transparent",
        color: activo ? "#9B8FFF" : disabled ? "#3E3C5E" : "#7B7A9E",
        fontSize: 13, fontWeight: activo ? 600 : 400,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.12s",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {label}
    </button>
  );
}