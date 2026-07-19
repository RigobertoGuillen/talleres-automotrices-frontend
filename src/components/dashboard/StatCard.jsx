// components/dashboard/StatCard.jsx
export default function StatCard({ title, value, color }) {
  return (
    <div className="stat-card" style={{ '--card-accent-color': color }}>
      <p className="stat-card__title">{title}</p>
      <h3 className="stat-card__value">{value}</h3>
    </div>
  );
}