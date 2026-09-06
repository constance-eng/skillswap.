import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "../components/Logo";
import { PasswordInput } from "../components/PasswordInput";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Couldn't log in, check your details");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-paper">
      <div className="w-full max-w-sm p-8 border bg-paper-bright rounded-card border-rule shadow-soft">
        <Logo className="mb-7" />
        <h1 className="mb-1 text-2xl font-display text-ink-primary">Welcome back</h1>
        <p className="mb-6 text-sm text-ink-secondary">Log in to keep swapping skills</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              required
            />
          </div>

          <PasswordInput
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm font-semibold text-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-submit">
            {busy ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-ink-secondary">
          <Link to="/forgot" className="font-medium text-navy hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="mt-2 text-sm text-center text-ink-secondary">
          New here?{" "}
          <Link to="/signup" className="font-medium text-navy hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}