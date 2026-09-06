import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Link2, MapPin, Calendar, MessageSquare } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";

export function LearningSessionPage() {
  const { transactionId } = useParams();
  const { idToken } = useAuth();
  const [session, setSession] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await apiRequest(`/sessions/${transactionId}`, { token: idToken });
        setSession(data.session);
      } catch (err) {
        if (err.status === 404) setNotFound(true);
        else setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [transactionId, idToken]);

  if (loading) {
    return (
      <div className="max-w-lg px-6 py-8 mx-auto">
        <Skeleton className="w-full h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg px-6 py-8 mx-auto">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-lg px-6 py-8 mx-auto">
      <Link to="/bookings?tab=learning" className="text-sm text-accent-dark hover:underline">
        Back to your bookings
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-ink-primary">Session details</h1>

      {notFound ? (
        <div className="p-6 text-center border bg-bg-panel rounded-card border-accent-soft">
          <p className="mb-1 font-medium text-ink-primary">Not set up yet</p>
          <p className="text-sm text-ink-secondary">
            Your teacher hasn't added session details yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-4 border bg-bg-panel rounded-card border-accent-soft">
          <div className="flex items-start gap-3">
            {session.format === "online" ? (
              <Link2 size={18} className="text-accent-dark mt-0.5" aria-hidden="true" />
            ) : (
              <MapPin size={18} className="text-accent-dark mt-0.5" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm text-ink-secondary">
                {session.format === "online" ? "Session link" : "Location"}
              </p>
              {session.format === "online" && session.sessionLink ? (
                <a
                  href={session.sessionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm break-all text-accent-dark hover:underline"
                >
                  {session.sessionLink}
                </a>
              ) : (
                <p className="text-sm text-ink-primary">
                  {session.format === "online" ? session.sessionLink || "Not added yet" : session.location || "Not added yet"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-accent-dark mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm text-ink-secondary">Suggested time</p>
              <p className="text-sm text-ink-primary">
                {session.suggestedDateTime
                  ? new Date(session.suggestedDateTime).toLocaleString()
                  : "Not set yet - your teacher will reach out"}
              </p>
            </div>
          </div>

          {session.note && (
            <div className="flex items-start gap-3">
              <MessageSquare size={18} className="text-accent-dark mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm text-ink-secondary">Note from your teacher</p>
                <p className="text-sm text-ink-primary">{session.note}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}