const taskColumns = [
  {
    title: "Requested",
    items: ["Parcel pickup at north gate", "Late-night printout drop", "Pharmacy errand"],
  },
  {
    title: "In motion",
    items: ["Library collection route", "Hostel C handoff"],
  },
  {
    title: "Review",
    items: ["Fast completion flagged", "Withdrawal approval pending"],
  },
];

export function TaskBoardPreview() {
  return (
    <div className="task-board">
      {taskColumns.map((column) => (
        <div key={column.title} className="task-board__column">
          <h3>{column.title}</h3>
          <div className="task-board__stack">
            {column.items.map((item) => (
              <article key={item} className="task-card">
                <span className="task-card__pulse" />
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}