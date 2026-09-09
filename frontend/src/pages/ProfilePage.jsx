import { Link, useNavigate } from "react-router-dom";
import { Plus, CheckCircle2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { SkillCard } from "../components/SkillCard";
import { Skeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

export function ProfilePage() {
  const { userId, profile } = useAuth();
  const navigate = useNavigate();
  const { data: mySkills, error, loading, reload } = useFetch(async () => {
    const data = await apiRequest("/skills");
    return data.skills.filter((s) => s.teacherId === userId);
  }, [userId]);

  return (
    <div className="max-w-3xl px-6 py-8 mx-auto">
      <div className="p-6 mb-8 border bg-paper-bright rounded-card border-rule shadow-soft">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center text-xl font-semibold rounded-full w-14 h-14 bg-navy text-ink-onDark">
            {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-lg font-display text-ink-primary">
              {profile?.name ?? "Loading..."}
            </p>
            <p className="text-sm text-ink-secondary">{profile?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-ink-secondary mt-3">
          <CheckCircle2 size={16} className="text-navy" aria-hidden="true" />
          Identity confirmed
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display text-ink-primary">Skills I can teach</h2>
          <Link to="/skills/new" className="btn-primary">
            <Plus size={16} aria-hidden="true" /> Add skill
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && mySkills?.length === 0 && (
          <EmptyState
            icon={Plus}
            title="You haven't added any skills yet"
            subtitle="Post your first skill to start teaching"
            actionLabel="Add skill"
            onAction={() => navigate("/skills/new")}
          />
        )}

        {!loading && !error && mySkills?.length > 0 && (
          <div className="space-y-3">
            {mySkills.map((skill) => (
              <SkillCard key={skill.skillId} skill={skill} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-display text-ink-primary">Skills I want to learn</h2>
        <div className="p-5 border bg-paper-bright rounded-card border-rule">
          <p className="text-sm text-ink-secondary">
            Not built yet - the backend doesn't currently store what you want to learn, only what you teach.
          </p>
        </div>
      </section>
    </div>
  );
}
