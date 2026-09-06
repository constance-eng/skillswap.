import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, KeyRound, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import * as cognito from "../auth/cognito";
import { Modal } from "../components/Modal";
import { ComingSoonBanner } from "../components/ComingSoonBanner";
import { PasswordInput } from "../components/PasswordInput";
import { useTheme } from "../theme/ThemeContext";

export function SettingsPage() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="max-w-lg px-6 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-display text-ink-primary">Settings</h1>

      <section className="p-6 mb-6 border bg-paper-bright rounded-card border-rule">
        <h2 className="mb-4 text-lg font-display text-ink-primary">Account</h2>
        <div className="mb-5 space-y-3">
          <div>
            <p className="mb-1 eyebrow text-ink-muted">Name</p>
            <p className="text-sm text-ink-primary">{profile?.name ?? "..."}</p>
          </div>
          <div>
            <p className="mb-1 eyebrow text-ink-muted">Email</p>
            <p className="text-sm text-ink-primary">{profile?.email ?? "..."}</p>
          </div>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-secondary">
          <KeyRound size={15} aria-hidden="true" />
          Change password
        </button>
      </section>

      <section className="p-6 mb-6 border bg-paper-bright rounded-card border-rule">
        <h2 className="mb-2 text-lg font-display text-ink-primary">Appearance</h2>
        <p className="mb-4 text-sm text-ink-muted">
          Choose how SkillSwap looks. Your choice is remembered on this device.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => theme === "dark" && toggleTheme()}
            className={`flex-1 text-sm py-2.5 rounded-pill font-medium transition-colors ${
              theme === "light"
                ? "bg-navy text-ink-onDark"
                : "border border-rule text-ink-secondary hover:bg-paper-light"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => theme === "light" && toggleTheme()}
            className={`flex-1 text-sm py-2.5 rounded-pill font-medium transition-colors ${
              theme === "dark"
                ? "bg-navy text-ink-onDark"
                : "border border-rule text-ink-secondary hover:bg-paper-light"
            }`}
          >
            Dark
          </button>
        </div>
      </section>

      <section className="p-6 mb-6 border bg-paper-bright rounded-card border-rule">
        <h2 className="mb-2 text-lg font-display text-ink-primary">Payments</h2>
        <ComingSoonBanner text="Buying credits isn't connected to a payment provider yet." />
        <button disabled className="w-full py-3 text-sm border cursor-not-allowed bg-paper border-rule text-ink-muted rounded-xl">
          Buy more credits
        </button>
      </section>

      <section className="p-6 mb-6 border bg-paper-bright rounded-card border-rule">
        <h2 className="mb-2 text-lg font-display text-error">Danger zone</h2>
        <p className="mb-4 text-sm text-ink-secondary">
          Deleting your account isn't built yet - it requires safely clearing
          your posted skills and booking history first, so nothing breaks for
          people you've taught or learned from.
        </p>
        <button disabled className="flex items-center gap-2 text-sm opacity-50 cursor-not-allowed text-error">
          <Trash2 size={15} aria-hidden="true" />
          Delete account
        </button>
      </section>

      <button onClick={handleLogout} className="flex items-center gap-2 text-sm transition-opacity text-error hover:opacity-80">
        <LogOut size={16} aria-hidden="true" />
        Log out
      </button>

      {modalOpen && <ChangePasswordModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
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
      await cognito.changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Couldn't change your password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Change password" onClose={onClose}>
      {success ? (
        <div className="py-2 text-center">
          <p className="mb-4 text-sm font-medium text-ink-primary">
            Password changed successfully
          </p>
          <button onClick={onClose} className="btn-on-navy">
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <PasswordInput
            id="currentPassword"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoFocus
          />
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
            {busy ? "Saving..." : "Update password"}
          </button>
        </form>
      )}
    </Modal>
  );
}