import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as cognito from "../auth/cognito";
import { Logo } from "../components/Logo";
import { PasswordInput } from "../components/PasswordInput";

export function ForgotPasswordPage() {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleRequestCode(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await cognito.forgotPassword(email);
      setStep("reset");
    } catch (err) {
      setError(err.message || "Couldn't find that account");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("New passwords don't match");
    }
    if (newPassword.length < 8) {
      return setError("New password must be at least 8 characters");
    }

    setBusy(true);
    try {
      await cognito.confirmForgotPassword(email, code, newPassword);
      navigate("/login");
    } catch (err) {
      setError(err.message || "That code didn't work");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-paper">
      <div className="w-full max-w-sm p-8 border bg-paper-bright rounded-card border-rule shadow-soft">
        <Logo className="mb-7" />

        {step === "request" ? (
          <>
            <h1 className="mb-1 text-2xl font-display text-ink-primary">Reset your password</h1>
            <p className="mb-6 text-sm text-ink-secondary">
              Enter your email and we'll send you a reset code
            </p>

            <form onSubmit={handleRequestCode} className="space-y-3">
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

              {error && (
                <p className="text-sm font-semibold text-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy} className="btn-submit">
                {busy ? "Sending..." : "Send reset code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-2xl font-display text-ink-primary">Enter your new password</h1>
            <p className="mb-6 text-sm text-ink-secondary">
              Check <span className="text-ink-primary">{email}</span> for the code
            </p>

            <form onSubmit={handleReset} className="space-y-3">
              <div>
                <label htmlFor="code" className="sr-only">Reset code</label>
                <input
                  id="code"
                  type="text"
                  placeholder="Reset code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="tracking-widest text-center field"
                  required
                />
              </div>

              <PasswordInput
                id="newPassword"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                hint="Must be at least 8 characters"
                required
              />
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <p className="text-sm font-semibold text-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy} className="btn-submit">
                {busy ? "Resetting..." : "Reset password"}
              </button>
            </form>

            <button
              onClick={() => setStep("request")}
              className="mt-4 text-sm text-navy hover:underline"
            >
              Use a different email
            </button>
          </>
        )}

        <p className="mt-6 text-sm text-center text-ink-secondary">
          <Link to="/login" className="font-medium text-navy hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}