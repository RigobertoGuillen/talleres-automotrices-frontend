


export default function Sidebar({
  modules,
  current,
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
              key={item.id}
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