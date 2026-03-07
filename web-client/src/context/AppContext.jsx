import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiClient } from "../api/client";

const AppContext = createContext(null);

function AppProvider({ children }) {
  const [health, setHealth] = useState({ status: "idle", message: "Not checked" });
  const [session, setSession] = useState({ status: "loading", user: null, error: "" });

  const syncSession = async () => {
    try {
      const payload = await apiClient.verifySession();
      setSession({ status: "authenticated", user: payload.data.user, error: "" });
    } catch (error) {
      setSession({ status: "guest", user: null, error: error.message });
    }
  };

  useEffect(() => {
    let isActive = true;

    apiClient
      .getHealth()
      .then((payload) => {
        if (!isActive) {
          return;
        }

        setHealth({
          status: payload?.success ? "online" : "degraded",
          message: payload?.message || "Backend responded",
        });
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setHealth({
          status: "offline",
          message: error.message,
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    syncSession();
  }, []);

  const login = async (credentials) => {
    const payload = await apiClient.login(credentials);
    setSession({ status: "authenticated", user: payload.data.user, error: "" });
    return payload;
  };

  const register = async (details) => {
    const payload = await apiClient.register(details);
    setSession({ status: "authenticated", user: payload.data.user, error: "" });
    return payload;
  };

  const logout = async () => {
    await apiClient.logout();
    setSession({ status: "guest", user: null, error: "" });
  };

  const stats = useMemo(() => {
    if (!session.user) {
      return [
        { label: "Session", value: "Guest", tone: "calm" },
        { label: "Task access", value: "Locked", tone: "sun" },
        { label: "Wallet", value: "Sign in", tone: "alert" },
        { label: "Role", value: "None", tone: "signal" },
      ];
    }

    return [
      { label: "Session", value: "Live", tone: "signal" },
      { label: "Role", value: session.user.role, tone: "calm" },
      { label: "Campus", value: session.user.campusName || "Unassigned", tone: "sun" },
      {
        label: "Verification",
        value: session.user.isVerified ? "Verified" : "Pending",
        tone: session.user.isVerified ? "signal" : "alert",
      },
    ];
  }, [session.user]);

  return (
    <AppContext.Provider
      value={{
        health,
        session,
        stats,
        login,
        logout,
        refreshSession: syncSession,
        register,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}

export { AppProvider, useAppContext };