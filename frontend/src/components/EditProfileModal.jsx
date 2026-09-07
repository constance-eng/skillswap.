import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { Modal } from "./Modal";

export function EditProfileModal({ onClose }) {
  const { idToken, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      return setError("Name can't be empty");
    }

    setBusy(true);
    try {
      await apiRequest("/users/me", {
        method: "PUT",
        token: idToken,
        body: { name: name.trim(), bio: bio.trim() },
      });
      await refreshProfile();
      onClose();
    } catch (err) {
      setError(err.details?.join(", ") || err.message || "Couldn't save your profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="editName" className="sr-only">Name</label>
          <input
            id="editName"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="editBio" className="sr-only">Bio</label>
          <textarea
            id="editBio"
            placeholder="A short bio - what do you teach, what are you into?"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            className="resize-none field"
          />
          <p className="text-xs text-ink-muted mt-1.5 text-right">{bio.length}/500</p>
        </div>

        {error && (
          <p className="text-sm font-semibold text-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-submit">
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>
    </Modal>
  );
}