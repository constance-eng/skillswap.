import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";

const CATEGORIES = ["general", "programming", "music", "language", "design"];

export function AddSkillPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { idToken } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (title.length > 200) return setError("Title is too long (max 200 characters)");
    if (description.length > 2000) return setError("Description is too long (max 2000 characters)");

    setBusy(true);
    try {
      await apiRequest("/skills", {
        method: "POST",
        token: idToken,
        body: { title, description, category, creditCost: 10 },
      });
      navigate("/profile");
    } catch (err) {
      setError(err.details?.join(", ") || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg px-6 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-display text-ink-primary">Add a skill</h1>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 border bg-paper-bright rounded-card border-rule shadow-soft">
        <div>
          <label htmlFor="title" className="sr-only">Skill title</label>
          <input
            id="title"
            type="text"
            placeholder="Skill title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="sr-only">Description</label>
          <textarea
            id="description"
            placeholder="Describe what you'll teach"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none field"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="sr-only">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-ink-secondary">Every session costs 10 credits</p>

        {error && (
          <p className="text-sm font-semibold text-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-submit">
          {busy ? "Posting..." : "Post skill"}
        </button>
      </form>
    </div>
  );
}