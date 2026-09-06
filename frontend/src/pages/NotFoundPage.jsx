import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "../components/Logo";

export function NotFoundPage() {
  const { idToken } = useAuth();
  const homeLink = idToken ? "/dashboard" : "/login";

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-paper">
      <div className="max-w-sm text-center">
        <Logo className="justify-center mb-8" />
        <p className="mb-3 text-5xl font-display text-ink-primary">404</p>
        <p className="mb-1 font-medium text-ink-primary">Page not found</p>
        <p className="mb-6 text-sm text-ink-secondary">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to={homeLink} className="btn-primary">
          <Home size={16} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}