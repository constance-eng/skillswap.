import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShieldCheck, Coins } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";

export function TeacherDetailPage() {
  const { id: teacherId } = useParams();
  const { idToken, userId, profile, refreshProfile } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [teacherSkills, setTeacherSkills] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSkillId, setBookingSkillId] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [teacherData, skillsData] = await Promise.all([
        apiRequest(`/users/${teacherId}/public`),
        apiRequest("/skills"),
      ]);
      setTeacher(teacherData.user);
      setTeacherSkills(skillsData.skills.filter((s) => s.teacherId === teacherId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const isOwnProfile = userId === teacherId;
  const hasEnoughCredits = (profile?.creditBalance ?? 0) >= 10;

  async function handleRequestSession(skill) {
    setBookingMessage("");
    setBookingSkillId(skill.skillId);
    try {
      await apiRequest("/credits/transfer", {
        method: "POST",
        token: idToken,
        body: { teacherId: skill.teacherId, amount: 10, skillId: skill.skillId },
      });
      await refreshProfile();
      setBookingMessage(
        `You're all set! ${teacher.name} will reach out soon to get your session started.`
      );
    } catch (err) {
      setBookingMessage(err.message);
    } finally {
      setBookingSkillId(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl px-6 py-8 mx-auto">
        <Skeleton className="w-full h-24 mb-4" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl px-6 py-8 mx-auto">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-2xl px-6 py-8 mx-auto text-center">
        <p className="mb-2 font-medium text-ink-primary">Teacher not found</p>
        <Link to="/browse" className="text-sm text-accent-dark hover:underline">
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl px-6 py-8 mx-auto">
      <div className="p-6 mb-6 border bg-bg-panel rounded-card border-accent-soft">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center text-xl font-semibold rounded-full w-14 h-14 bg-accent text-accent-dark">
            {teacher.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-primary">{teacher.name}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-ink-muted">
              <ShieldCheck size={14} aria-hidden="true" />
              Verified badges coming soon
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-medium text-ink-primary">Skills offered</h2>

      {teacherSkills?.length === 0 && (
        <p className="text-sm text-ink-secondary">This teacher hasn't posted any skills yet</p>
      )}

      <div className="space-y-4">
        {teacherSkills?.map((skill) => (
          <div key={skill.skillId} className="p-5 border bg-bg-panel rounded-card border-accent-soft">
            <div className="flex items-start justify-between mb-2">
              <p className="font-medium text-ink-primary">{skill.title}</p>
              <span className="text-xs text-accent-dark bg-accent-soft rounded-pill px-2 py-0.5">
                {skill.category}
              </span>
            </div>
            <p className="mb-3 text-sm text-ink-secondary">{skill.description}</p>

            <div className="flex items-center gap-1 mb-4 text-xs text-ink-muted">
              <Star size={14} aria-hidden="true" />
              No ratings yet
            </div>

            {isOwnProfile ? (
              <p className="text-sm text-ink-muted">This is your own listing</p>
            ) : (
              <button
                onClick={() => handleRequestSession(skill)}
                disabled={!hasEnoughCredits || bookingSkillId === skill.skillId}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-opacity bg-accent text-accent-dark rounded-pill hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Coins size={16} aria-hidden="true" />
                {bookingSkillId === skill.skillId ? "Requesting..." : "Request session - 10 credits"}
              </button>
            )}

            {!hasEnoughCredits && !isOwnProfile && (
              <p className="mt-2 text-xs text-ink-muted">
                Not enough credits. Buying credits is coming soon.
              </p>
            )}
          </div>
        ))}
      </div>

      {bookingMessage && (
        <p className="mt-4 text-sm font-semibold text-ink-primary" role="status">
          {bookingMessage}
        </p>
      )}
    </div>
  );
}