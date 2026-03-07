import { NavLink, Route, Routes } from "react-router-dom";

import { DashboardPanel } from "./components/DashboardPanel";
import { AuthPanel } from "./components/AuthPanel";
import { AdminPage } from "./components/AdminPage";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { InsightsRail } from "./components/InsightsRail";
import { NetworkScene } from "./components/NetworkScene";
import { TaskBoardPreview } from "./components/TaskBoardPreview";
import { TasksPage } from "./components/TasksPage";
import { WalletPage } from "./components/WalletPage";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/tasks", label: "Tasks" },
  { to: "/wallet", label: "Wallet" },
  { to: "/admin", label: "Admin" },
];

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <section className="content-grid">
        <DashboardPanel
          eyebrow="Operations Pulse"
          title="A control room for live campus logistics"
          description="Track the request pipeline, runner activity, payout pressure, and emerging anomalies in one place while keeping the UI lightweight enough for day-to-day use."
        >
          <TaskBoardPreview />
        </DashboardPanel>
        <div className="overview-side-column">
          <AuthPanel />
          <InsightsRail />
        </div>
      </section>
      <section className="feature-strip">
        <div className="feature-strip__copy">
          <span className="eyebrow">Why This Frontend</span>
          <h2>Built to sit on top of the backend work already landing in this repo</h2>
          <p>
            The starter client is structured for growth: API helpers, context wiring, reusable
            components, and a visual direction that avoids the default dashboard template look.
          </p>
        </div>
        <NetworkScene />
      </section>
    </>
  );
};

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <nav className="section-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "section-nav__link section-nav__link--active" : "section-nav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}