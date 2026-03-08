import { useState } from "react";

import { useAppContext } from "../context/AppContext";

const loginInitialState = {
  email: "",
  password: "",
};

const registerInitialState = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  campusId: "",
  campusName: "",
  role: "requester",
};

export function AuthPanel() {
  const { login, logout, register, session } = useAppContext();
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginForm, setLoginForm] = useState(loginInitialState);
  const [registerForm, setRegisterForm] = useState(registerInitialState);

  const handleLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await login(loginForm);
      setSuccess("Logged in successfully.");
      setLoginForm(loginInitialState);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await register(registerForm);
      setSuccess("Registered and signed in successfully.");
      setRegisterForm(registerInitialState);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (session.status === "authenticated") {
    return (
      <section className="auth-panel auth-panel--signed-in">
        <span className="eyebrow">Session</span>
        <h3>{session.user.fullName}</h3>
        <p>
          Signed in as {session.user.email}. Role: {session.user.role}. Campus: {session.user.campusName || "Not set"}.
        </p>
        <button className="button button--primary" type="button" onClick={logout}>
          Log Out
        </button>
      </section>
    );
  }

  return (
    <section className="auth-panel">
      <div className="auth-panel__tabs">
        <button
          className={mode === "login" ? "auth-panel__tab auth-panel__tab--active" : "auth-panel__tab"}
          type="button"
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={
            mode === "register" ? "auth-panel__tab auth-panel__tab--active" : "auth-panel__tab"
          }
          type="button"
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>
      {error ? <p className="form-message form-message--error">{error}</p> : null}
      {success ? <p className="form-message form-message--success">{success}</p> : null}
      {mode === "login" ? (
        <form className="form-grid" onSubmit={handleLogin}>
          <label>
            <span>Email</span>
            <input
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm((current) => ({ ...current, email: event.target.value }))
              }
              type="email"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((current) => ({ ...current, password: event.target.value }))
              }
              type="password"
              required
            />
          </label>
          <button className="button button--primary" disabled={busy} type="submit">
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        <form className="form-grid" onSubmit={handleRegister}>
          <label>
            <span>Full name</span>
            <input
              value={registerForm.fullName}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, fullName: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Phone number</span>
            <input
              value={registerForm.phoneNumber}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, phoneNumber: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Campus ID</span>
            <input
              value={registerForm.campusId}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, campusId: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Campus name</span>
            <input
              value={registerForm.campusName}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, campusName: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Role</span>
            <select
              value={registerForm.role}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, role: event.target.value }))
              }
            >
              <option value="requester">Requester</option>
              <option value="runner">Runner</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="button button--primary" disabled={busy} type="submit">
            {busy ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </section>
  );
}