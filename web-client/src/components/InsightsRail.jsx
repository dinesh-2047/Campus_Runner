const insights = [
  {
    title: "Fraud review lane",
    text: "A dedicated surface for anomaly flags, moderation triage, and manual resolution notes.",
  },
  {
    title: "Wallet control",
    text: "Support for payout queues, balance checks, and approval-heavy admin workflows.",
  },
  {
    title: "Campus scoping",
    text: "Frontend structure is ready for campus-aware creation, acceptance, and admin access rules.",
  },
];

export function InsightsRail() {
  return (
    <aside className="insights-rail">
      <span className="eyebrow">Focus Areas</span>
      {insights.map((item) => (
        <article key={item.title} className="insight-card">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </aside>
  );
}