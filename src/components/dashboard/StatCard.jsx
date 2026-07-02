export default function StatCard({ title, value, color }) {
  return (
    <div className="stat-card" style={{ "--card-accent": color }}>
      <div className="stat-card__accent" aria-hidden="true" />
      <h4 className="stat-card__title">{title}</h4>
      <h2 className="stat-card__value">{value}</h2>
    </div>
  );
}