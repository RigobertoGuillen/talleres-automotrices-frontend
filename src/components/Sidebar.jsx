const ALL_MODULES = [

  { key: "dashboard", label: "Dashboard" },
  { key: "clientes", label: "Clientes" },
  { key: "vehiculos", label: "Vehículos" },
  { key: "ordenes", label: "Órdenes" },
  { key: "diagnosticos", label: "Diagnósticos" },
  { key: "inventario", label: "Inventario" },
  { key: "facturacion", label: "Facturación" },
  { key: "reportes", label: "Reportes" },
  { key: "usuarios", label: "Usuarios" },

];

export default function Sidebar({ current, onSelect }) {

  return (

    <aside className="sidebar">

      <h2 className="logo">
        SuperAuto
      </h2>

      <nav>

        {
          ALL_MODULES.map(item => (

            <button
              key={item.key}
              className={
                current === item.key
                  ? "menu active"
                  : "menu"
              }
              onClick={() => onSelect(item.key)}
            >
              {item.label}
            </button>

          ))
        }

      </nav>

    </aside>

  );

}