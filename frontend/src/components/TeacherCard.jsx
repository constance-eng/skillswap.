import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShieldCheck } from "lucide-react";
import { apiRequest } from "../api/client";
import { Skeleton } from "./Skeleton";

export function TeacherCard({ skill }) {
  const [teacherName, setTeacherName] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/users/${skill.teacherId}/public`)
      .then((data) => {
        if (!cancelled) setTeacherName(data.user.name);
      })
      .catch(() => {
        if (!cancelled) setTeacherName("Unknown teacher");
      });
    return () => {
      cancelled = true;
    };
  }, [skill.teacherId]);

  return (
    <div className="flex flex-col gap-3 p-5 border bg-paper-bright rounded-card border-rule">
      <div>
        {teacherName === null ? (
          <Skeleton className="w-24 h-4 mb-2" />
        ) : (
          <p className="text-sm text-ink-secondary">{teacherName}</p>
        )}
        <p className="font-medium text-ink-primary">{skill.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="eyebrow inline-block text-ink-onlight bg-apricot-light rounded-pill px-2 py-0.5">
            {skill.category}
          </span>
          {typeof skill.matchScore === "number" && (
            <span className="text-xs font-medium text-navy tabular">
              {Math.round(skill.matchScore * 100)}% match
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-ink-muted">
        <Star size={14} aria-hidden="true" />
        No ratings yet
      </div>

      <div className="flex items-center gap-1 text-xs text-ink-muted">
        <ShieldCheck size={14} aria-hidden="true" />
        Verified badges coming soon
      </div>

      <Link to={`/teacher/${skill.teacherId}`} className="mt-1 btn-primary">
        View
      </Link>
    </div>
  );
}