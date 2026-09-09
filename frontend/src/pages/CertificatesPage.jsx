import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Skeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

function CertificateCard({ cert }) {
  const [skillTitle, setSkillTitle] = useState(null);
  const [teacherName, setTeacherName] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest("/skills").then((data) => {
        const skill = data.skills.find((s) => s.skillId === cert.skillId);
        return skill?.title ?? "Unknown skill";
      }),
      apiRequest(`/users/${cert.teacherId}/public`).then((data) => data.user.name),
    ]).then(([title, name]) => {
      if (!cancelled) {
        setSkillTitle(title);
        setTeacherName(name);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cert.skillId, cert.teacherId]);

  const date = new Date(cert.issuedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/certificates/${cert.transactionId}`}
      className="block p-5 transition-shadow bg-navy rounded-card shadow-soft hover:shadow-lift"
    >
      <div className="flex items-center gap-2 mb-2">
        <Award size={18} className="text-apricot" aria-hidden="true" />
        {skillTitle === null ? (
          <Skeleton className="w-32 h-4" />
        ) : (
          <p className="font-medium text-ink-onDark">{skillTitle}</p>
        )}
      </div>
      <p className="mb-2 text-xs text-ink-onDarkMuted">
        Certified by {teacherName ?? "..."} - {date}
      </p>
      {cert.note && (
        <p className="pt-2 mt-2 text-sm border-t text-ink-onDarkMuted border-navy-light">
          {cert.note}
        </p>
      )}
    </Link>
  );
}

export function CertificatesPage() {
  const { idToken } = useAuth();
  const { data: certificates, error, loading, reload } = useFetch(
    async () => (await apiRequest("/certificates/me", { token: idToken })).certificates,
    [idToken]
  );

  return (
    <div className="max-w-3xl px-6 py-8 mx-auto">
      <h1 className="mb-2 text-2xl font-display text-ink-primary">Your certificates</h1>
      <p className="mb-6 text-sm text-ink-secondary">
        Skills your teachers have certified you've acquired
      </p>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="w-full h-28" />
          <Skeleton className="w-full h-28" />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && certificates?.length === 0 && (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          subtitle="Complete a session and your teacher can certify you've acquired the skill"
        />
      )}

      {!loading && !error && certificates?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <CertificateCard key={cert.transactionId} cert={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
