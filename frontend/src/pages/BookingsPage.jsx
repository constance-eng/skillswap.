import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Users, GraduationCap, Plus, CheckCircle2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { Skeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

function BookingRow({ booking, otherPersonId, linkPrefix, certified }) {
  const [skillTitle, setSkillTitle] = useState(null);
  const [otherPersonName, setOtherPersonName] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest("/skills").then((data) => {
        const skill = data.skills.find((s) => s.skillId === booking.skillId);
        return skill?.title ?? "Unknown skill";
      }),
      apiRequest(`/users/${otherPersonId}/public`).then((data) => data.user.name),
    ]).then(([title, name]) => {
      if (!cancelled) {
        setSkillTitle(title);
        setOtherPersonName(name);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [booking.skillId, otherPersonId]);

  const date = new Date(booking.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`${linkPrefix}/${booking.transactionId}`}
      className="flex items-center justify-between px-2 py-4 -mx-2 transition-colors border-b border-rule last:border-b-0 hover:bg-paper-light rounded-card"
    >
      <div>
        {skillTitle === null ? (
          <Skeleton className="w-32 h-4 mb-1" />
        ) : (
          <p className="text-sm font-medium text-ink-primary">{skillTitle}</p>
        )}
        <p className="text-xs text-ink-muted">
          {otherPersonName ?? "..."} - {date}
        </p>
      </div>
      {certified ? (
        <span className="flex items-center gap-1 text-xs font-medium text-navy">
          <CheckCircle2 size={14} aria-hidden="true" />
          Certified
        </span>
      ) : (
        <span className="eyebrow text-cocoa-deep bg-apricot-light rounded-pill px-3 py-1.5">
          View
        </span>
      )}
    </Link>
  );
}

async function splitByCertification(bookings, idToken) {
  const withStatus = await Promise.all(
    bookings.map(async (booking) => {
      try {
        await apiRequest(`/certificates/${booking.transactionId}`, { token: idToken });
        return { ...booking, certified: true };
      } catch {
        return { ...booking, certified: false };
      }
    })
  );
  return {
    pending: withStatus.filter((b) => !b.certified),
    completed: withStatus.filter((b) => b.certified),
  };
}

export function BookingsPage() {
  const { idToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "learning" ? "learning" : "teaching";

  const [teachingPending, setTeachingPending] = useState(null);
  const [teachingCompleted, setTeachingCompleted] = useState(null);
  const [learningPending, setLearningPending] = useState(null);
  const [learningCompleted, setLearningCompleted] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadBoth() {
    setLoading(true);
    setError(null);
    try {
      const [teachData, learnData] = await Promise.all([
        apiRequest("/transactions/teaching", { token: idToken }),
        apiRequest("/transactions/me", { token: idToken }),
      ]);

      const [teachSplit, learnSplit] = await Promise.all([
        splitByCertification(teachData.bookings, idToken),
        splitByCertification(learnData.transactions, idToken),
      ]);

      setTeachingPending(teachSplit.pending);
      setTeachingCompleted(teachSplit.completed);
      setLearningPending(learnSplit.pending);
      setLearningCompleted(learnSplit.completed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoth();
  }, [idToken]);

  const pending = activeTab === "teaching" ? teachingPending : learningPending;
  const completed = activeTab === "teaching" ? teachingCompleted : learningCompleted;

  return (
    <div className="max-w-2xl px-6 py-8 mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-display text-ink-primary">Bookings</h1>
        {activeTab === "teaching" && (
          <Link to="/skills/new" className="btn-primary">
            <Plus size={16} aria-hidden="true" /> Add skill
          </Link>
        )}
      </div>
      <p className="mb-6 text-sm text-ink-secondary">
        {activeTab === "teaching" ? "People who've booked sessions with you" : "Sessions you've booked to learn"}
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSearchParams({ tab: "teaching" })}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-pill font-medium transition-colors ${
            activeTab === "teaching" ? "bg-navy text-ink-onDark" : "border border-rule text-ink-secondary hover:bg-paper-light"
          }`}
        >
          <Users size={15} aria-hidden="true" /> Teaching
        </button>
        <button
          onClick={() => setSearchParams({ tab: "learning" })}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-pill font-medium transition-colors ${
            activeTab === "learning" ? "bg-navy text-ink-onDark" : "border border-rule text-ink-secondary hover:bg-paper-light"
          }`}
        >
          <GraduationCap size={15} aria-hidden="true" /> Learning
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="w-full h-14" />
          <Skeleton className="w-full h-14" />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={loadBoth} />}

      {!loading && !error && (
        <>
          {pending?.length === 0 && completed?.length === 0 && (
            <EmptyState
              icon={activeTab === "teaching" ? Users : GraduationCap}
              title={activeTab === "teaching" ? "No bookings yet" : "No sessions booked yet"}
              subtitle={
                activeTab === "teaching"
                  ? "Once someone books a session with you, they'll show up here"
                  : "Book a session from a teacher's page to see it here"
              }
            />
          )}

          {pending?.length > 0 && (
            <div className="p-5 mb-4 border bg-paper-bright rounded-card border-rule">
              {pending.map((booking) => (
                <BookingRow
                  key={booking.transactionId}
                  booking={booking}
                  otherPersonId={activeTab === "teaching" ? booking.userId : booking.counterpartyId}
                  linkPrefix={activeTab === "teaching" ? "/teaching" : "/learning"}
                  certified={false}
                />
              ))}
            </div>
          )}

          {completed?.length > 0 && (
            <div>
              <p className="mb-2 eyebrow text-ink-muted">Completed</p>
              <div className="p-5 border bg-paper-bright rounded-card border-rule">
                {completed.map((booking) => (
                  <BookingRow
                    key={booking.transactionId}
                    booking={booking}
                    otherPersonId={activeTab === "teaching" ? booking.userId : booking.counterpartyId}
                    linkPrefix={activeTab === "teaching" ? "/teaching" : "/learning"}
                    certified
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}