import { useAppContext } from "../context/AppContext";

export function HeroSection() {
  const { stats } = useAppContext();

  return (
    <section className="hero">
      <div className="hero__content">
        <span className="eyebrow">React + JSX Frontend</span>
        <h2>Designed as an operational canvas, not a generic admin shell</h2>
        <p>
          This starter frontend is ready for the APIs already growing in your backend: task
          lifecycle, wallet operations, moderation, fraud flags, and campus-aware controls.
        </p>
        <div className="hero__actions">
          <button className="button button--primary" type="button">
            Connect Real Data
          </button>
          <button className="button button--ghost" type="button">
            Review Structure
          </button>
        </div>
      </div>
      <div className="stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className={`stat-card stat-card--${stat.tone}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}