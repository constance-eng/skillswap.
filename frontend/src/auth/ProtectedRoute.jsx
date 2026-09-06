import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }) {
  const { idToken, loading } = useAuth();

  if (loading) return null;
  if (!idToken) return <Navigate to="/login" replace />;

  return children;
}