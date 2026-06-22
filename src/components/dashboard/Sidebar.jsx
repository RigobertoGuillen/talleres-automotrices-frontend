export default function Sidebar({
  modules,
  active,
  onSelect
}) {

  return (
    <aside className="sidebar">

      <h2 className="logo">
        SuperAuto
      </h2>

      <nav>

        {
          modules.map(item => (

            <button
              key={item.key}
              className={
                active === item.key
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