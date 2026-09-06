import { createContext, useContext, useEffect, useState } from "react";
import * as cognito from "./cognito";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const idToken = session?.getIdToken().getJwtToken() ?? null;
  const userId = session?.getIdToken().payload.sub ?? null;

  useEffect(() => {
    cognito
      .getCurrentSession()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!idToken) {
      setProfile(null);
      return;
    }
    refreshProfile();
  }, [idToken]);

  async function refreshProfile() {
    if (!idToken) return;
    try {
      const data = await apiRequest("/users/me", { token: idToken });
      setProfile(data.user);
    } catch (err) {
      console.error("Couldn't load profile", err);
    }
  }

  async function login(email, password) {
    const newSession = await cognito.login(email, password);
    setSession(newSession);
    return newSession;
  }

  function logout() {
    cognito.logout();
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ idToken, userId, profile, loading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}