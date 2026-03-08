export function DashboardPanel({ eyebrow, title, description, children }) {
  return (
    <section className="dashboard-panel">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="dashboard-panel__body">{children}</div>
    </section>
  );
}