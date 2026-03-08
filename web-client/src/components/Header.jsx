import { useAppContext } from "../context/AppContext";

export function Header() {
  const { health } = useAppContext();

  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">Campus Runner</span>
        <h1>Dispatch, trust, and campus logistics in one client</h1>
      </div>
      <div className={`health-pill health-pill--${health.status}`}>
        <span className="health-pill__dot" />
        <span>{health.message}</span>
      </div>
    </header>
  );
}