import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import { Logo } from "../components/Logo";

export function CertificateDetailPage() {
  const { transactionId } = useParams();
  const { idToken } = useAuth();

  const [certificate, setCertificate] = useState(null);
  const [skillTitle, setSkillTitle] = useState(null);
  const [learnerName, setLearnerName] = useState(null);
  const [teacherName, setTeacherName] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const certData = await apiRequest(`/certificates/${transactionId}`, { token: idToken });
        const cert = certData.certificate;
        setCertificate(cert);

        const [skillsData, learner, teacher] = await Promise.all([
          apiRequest("/skills"),
          apiRequest(`/users/${cert.learnerId}/public`),
          apiRequest(`/users/${cert.teacherId}/public`),
        ]);

        const skill = skillsData.skills.find((s) => s.skillId === cert.skillId);
        setSkillTitle(skill?.title ?? "a skill on SkillSwap");
        setLearnerName(learner.user.name);
        setTeacherName(teacher.user.name);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [transactionId, idToken]);

  if (loading) {
    return (
      <div className="max-w-3xl px-6 py-10 mx-auto">
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl px-6 py-10 mx-auto">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const date = new Date(certificate.issuedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl px-6 py-10 mx-auto">
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/certificates" className="flex items-center gap-1.5 text-sm text-navy hover:underline">
          <ArrowLeft size={15} aria-hidden="true" /> All certificates
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={16} aria-hidden="true" /> Print or save as PDF
        </button>
      </div>

      <div
        id="certificate-print"
        className="relative bg-paper-bright border-[3px] border-navy rounded-card shadow-lift px-10 py-14 md:px-16 md:py-16 text-center"
      >
        {/* corner marks - a light structural flourish, not a stock graphic */}
        <span className="absolute w-8 h-8 border-t-2 border-l-2 top-4 left-4 border-apricot-deep" aria-hidden="true" />
        <span className="absolute w-8 h-8 border-t-2 border-r-2 top-4 right-4 border-apricot-deep" aria-hidden="true" />
        <span className="absolute w-8 h-8 border-b-2 border-l-2 bottom-4 left-4 border-apricot-deep" aria-hidden="true" />
        <span className="absolute w-8 h-8 border-b-2 border-r-2 bottom-4 right-4 border-apricot-deep" aria-hidden="true" />

        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <p className="mb-2 eyebrow text-ink-muted">Certificate of Completion</p>
        <h1 className="mb-8 text-3xl font-display md:text-4xl text-navy">
          {skillTitle}
        </h1>

        <p className="mb-2 text-sm text-ink-secondary">This certifies that</p>
        <p
          className="mb-2 text-5xl md:text-6xl text-navy"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          {learnerName}
        </p>
        <div className="w-64 mx-auto mb-8 border-b border-rule" />

        <p className="max-w-md mx-auto mb-10 text-sm text-ink-secondary">
          has successfully completed a skill exchange session in
          <span className="font-medium text-ink-primary"> {skillTitle} </span>
          through SkillSwap's peer learning platform, certified on {date}.
        </p>

        <div className="flex items-center justify-center gap-16">
          <div>
            <p className="mb-1 text-lg italic font-display text-ink-primary">{teacherName}</p>
            <div className="w-40 pt-1 border-t border-rule">
              <p className="eyebrow text-ink-muted">Teacher</p>
            </div>
          </div>
          <div>
            <p className="mb-1 text-lg italic font-display text-ink-primary tabular">{date}</p>
            <div className="w-40 pt-1 border-t border-rule">
              <p className="eyebrow text-ink-muted">Date issued</p>
            </div>
          </div>
        </div>

        {certificate.note && (
          <p className="max-w-md pt-6 mx-auto mt-10 text-sm italic border-t border-rule text-ink-secondary">
            "{certificate.note}"
          </p>
        )}
      </div>
    </div>
  );
}