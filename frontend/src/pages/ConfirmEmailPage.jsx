import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import * as cognito from "../auth/cognito";
import { apiRequest } from "../api/client";
import { Logo } from "../components/Logo";

export function ConfirmEmailPage() {
  const location = useLocation();
  const email = location.state?.email || "";
  const name = location.state?.name || "";
  const userSub = location.state?.userSub || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      try {
        await cognito.confirmSignUp(email, code);
      } catch (confirmErr) {
        const alreadyConfirmed = confirmErr.message?.includes("CONFIRMED");
        if (!alreadyConfirmed) throw confirmErr;
      }
      await apiRequest("/users", {
        method: "POST",
        body: { userId: userSub, name, email },
      });
      navigate("/login");
    } catch (err) {
      setError(err.message || "That code didn't work");
    } finally {
      setBusy(false);
    }
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-paper">
        <div className="w-full max-w-sm p-8 text-center border bg-paper-bright rounded-card border-rule shadow-soft">
          <p className="mb-2 font-medium text-ink-primary">No email to confirm</p>
          <p className="mb-4 text-sm text-ink-secondary">
            Please sign up first so we know which account to confirm.
          </p>
          <Link to="/signup" className="text-sm font-medium text-navy hover:underline">
            Go to sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-paper">
      <div className="w-full max-w-sm p-8 border bg-paper-bright rounded-card border-rule shadow-soft">
        <Logo className="mb-7" />
        <h1 className="mb-1 text-2xl font-display text-ink-primary">Check your email</h1>
        <p className="mb-6 text-sm text-ink-secondary">
          We sent a 6-digit code to <span className="text-ink-primary">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="code" className="sr-only">Verification code</label>
            <input
              id="code"
              type="text"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="tracking-widest text-center field"
              required
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-submit">
            {busy ? "Confirming..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
}