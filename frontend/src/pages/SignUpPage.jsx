import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as cognito from "../auth/cognito";
import { Logo } from "../components/Logo";
import { PasswordInput } from "../components/PasswordInput";

export function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) return setError("Passwords don't match");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (!agreedToTerms) return setError("Please agree to the terms to continue");

    setBusy(true);
    try {
      const result = await cognito.signUp(email, password);
      navigate("/confirm", { state: { email, name, userSub: result.userSub } });
    } catch (err) {
      setError(err.message || "Couldn't create your account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-paper">
      <div className="w-full max-w-sm p-8 border bg-paper-bright rounded-card border-rule shadow-soft">
        <Logo className="mb-7" />
        <h1 className="mb-1 text-2xl font-display text-ink-primary">Create your account</h1>
        <p className="mb-6 text-sm text-ink-secondary">Start teaching and learning</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="name" className="sr-only">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              required
            />
          </div>
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
            hint="Must be at least 8 characters"
            required
          />
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label className="flex items-start gap-2 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5"
            />
            I agree to the Terms and Privacy Policy
          </label>

          {error && (
            <p className="text-sm font-semibold text-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-submit">
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-ink-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-navy hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}