import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Award } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";

async function loadExistingSession(transactionId, idToken) {
  try {
    const data = await apiRequest(`/sessions/${transactionId}`, { token: idToken });
    return data.session;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export function TeachingSessionPage() {
  const { transactionId } = useParams();
  const { idToken } = useAuth();
  const { data: existing, error, loading, reload } = useFetch(
    () => loadExistingSession(transactionId, idToken),
    [transactionId, idToken]
  );

  const [format, setFormat] = useState("online");
  const [sessionLink, setSessionLink] = useState("");
  const [location, setLocation] = useState("");
  const [suggestedDateTime, setSuggestedDateTime] = useState("");
  const [note, setNote] = useState("");

  // seed the form once the existing session (if any) has loaded
  useEffect(() => {
    if (!existing) return;
    setFormat(existing.format || "online");
    setSessionLink(existing.sessionLink || "");
    setLocation(existing.location || "");
    setSuggestedDateTime(existing.suggestedDateTime ? existing.suggestedDateTime.slice(0, 16) : "");
    setNote(existing.note || "");
  }, [existing]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const [certNote, setCertNote] = useState("");
  const [certIssued, setCertIssued] = useState(false);
  const [certError, setCertError] = useState("");
  const [certBusy, setCertBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError("");
    setSaved(false);
    setSaving(true);
    try {
      await apiRequest(`/sessions/${transactionId}`, {
        method: "PUT",
        token: idToken,
        body: {
          format,
          sessionLink: sessionLink || undefined,
          location: location || undefined,
          suggestedDateTime: suggestedDateTime ? new Date(suggestedDateTime).toISOString() : undefined,
          note: note || undefined,
        },
      });
      setSaved(true);
    } catch (err) {
      setSaveError(err.details?.join(", ") || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleIssueCertificate(e) {
    e.preventDefault();
    setCertError("");
    setCertBusy(true);
    try {
      await apiRequest(`/certificates/${transactionId}`, {
        method: "PUT",
        token: idToken,
        body: { note: certNote || undefined },
      });
      setCertIssued(true);
    } catch (err) {
      setCertError(err.message || "Couldn't issue the certificate");
    } finally {
      setCertBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg px-6 py-8 mx-auto">
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg px-6 py-8 mx-auto">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="max-w-lg px-6 py-8 mx-auto">
      <Link to="/bookings" className="text-sm text-navy hover:underline">
        Back to your students
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-display text-ink-primary">Session details</h1>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 border bg-paper-bright rounded-card border-rule shadow-soft">
        <div>
          <label className="block mb-1.5 text-sm text-ink-secondary">Format</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormat("online")}
              className={`flex-1 text-sm py-2 rounded-pill font-medium transition-colors ${
                format === "online" ? "bg-navy text-ink-onDark" : "border border-rule text-ink-secondary hover:bg-paper-light"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setFormat("in-person")}
              className={`flex-1 text-sm py-2 rounded-pill font-medium transition-colors ${
                format === "in-person" ? "bg-navy text-ink-onDark" : "border border-rule text-ink-secondary hover:bg-paper-light"
              }`}
            >
              In-person
            </button>
          </div>
        </div>

        {format === "online" && (
          <div>
            <label htmlFor="sessionLink" className="block mb-1.5 text-sm text-ink-secondary">
              Session link
            </label>
            <input
              id="sessionLink"
              type="url"
              placeholder="https://meet.google.com/..."
              value={sessionLink}
              onChange={(e) => setSessionLink(e.target.value)}
              className="field"
            />
          </div>
        )}

        {format === "in-person" && (
          <div>
            <label htmlFor="location" className="block mb-1.5 text-sm text-ink-secondary">
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="Where you'll meet"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="field"
            />
          </div>
        )}

        <div>
          <label htmlFor="suggestedDateTime" className="block mb-1.5 text-sm text-ink-secondary">
            Suggested date &amp; time
          </label>
          <input
            id="suggestedDateTime"
            type="datetime-local"
            value={suggestedDateTime}
            onChange={(e) => setSuggestedDateTime(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="note" className="block mb-1.5 text-sm text-ink-secondary">
            Note for your student
          </label>
          <textarea
            id="note"
            placeholder="Anything they should prepare or bring"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="resize-none field"
          />
        </div>

        {saveError && (
          <p className="text-sm font-semibold text-error" role="alert">
            {saveError}
          </p>
        )}
        {saved && (
          <p className="text-sm font-medium text-ink-primary" role="status">
            Saved - your student can now see these details
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-submit">
          {saving ? "Saving..." : "Save session details"}
        </button>
      </form>

      <div className="p-6 mt-6 bg-navy rounded-card shadow-soft">
        <div className="flex items-center gap-2 mb-1">
          <Award size={18} className="text-apricot" aria-hidden="true" />
          <h2 className="text-lg font-display text-ink-onDark">Certify completion</h2>
        </div>
        <p className="mb-4 text-sm text-ink-onDarkMuted">
          Once you've confirmed your student has acquired this skill, issue a
          certificate. This can only be done once per booking.
        </p>

        {certIssued ? (
          <p className="text-sm font-medium text-ink-onDark" role="status">
            Certificate issued
          </p>
        ) : (
          <form onSubmit={handleIssueCertificate} className="space-y-3">
            <div>
              <label htmlFor="certNote" className="sr-only">Assessment note</label>
              <textarea
                id="certNote"
                placeholder="What did they learn or demonstrate? (optional)"
                value={certNote}
                onChange={(e) => setCertNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 transition-colors border outline-none resize-none bg-navy-light text-ink-onDark placeholder:text-ink-onDarkMuted rounded-xl border-navy-light focus-visible:border-apricot"
              />
            </div>

            {certError && (
              <p className="text-sm font-semibold text-error" role="alert">
                {certError}
              </p>
            )}

            <button type="submit" disabled={certBusy} className="btn-on-navy">
              <Award size={16} aria-hidden="true" />
              {certBusy ? "Issuing..." : "Certify skill acquired"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
