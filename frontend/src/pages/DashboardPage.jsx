import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";

function skillTitleFor(skillId, allSkills) {
  return allSkills?.find((s) => s.skillId === skillId)?.title ?? "Unknown skill";
}

function SectionHead({ index, title, action, to }) {
  return (
    <div className="flex items-baseline justify-between pt-5 mb-4 border-t border-rule">
      <div className="flex items-baseline gap-3">
        <span className="eyebrow tabular text-ink-muted">{index}</span>
        <h2 className="text-xl font-display text-ink-primary">{title}</h2>
      </div>
      {action && (
        <Link to={to} className="text-sm font-medium text-navy hover:underline">
          {action}
        </Link>
      )}
    </div>
  );
}

function InlineStat({ label, value, sublabel, to }) {
  return (
    <Link to={to} className="block group">
      <p className="mb-2 eyebrow text-ink-muted">{label}</p>
      <p className="text-4xl leading-none font-display text-ink-primary tabular">{value}</p>
      <p className="mt-2 text-xs text-ink-muted">{sublabel}</p>
      <span className="inline-flex items-center gap-1 mt-2 text-xs transition-opacity opacity-0 text-navy group-hover:opacity-100">
        View <ArrowUpRight size={12} aria-hidden="true" />
      </span>
    </Link>
  );
}

async function loadDashboardData(userId, idToken) {
  const skillsData = await apiRequest("/skills");
  const mySkills = skillsData.skills.filter((s) => s.teacherId === userId);

  const matchData = await apiRequest("/match", {
    method: "POST",
    token: idToken,
    body: { query: mySkills.map((s) => s.title).join(" ") || "general" },
  });

  const txData = await apiRequest("/transactions/me", { token: idToken });
  const certified = await Promise.all(
    txData.transactions.map(async (tx) => {
      try {
        await apiRequest(`/certificates/${tx.transactionId}`, { token: idToken });
        return true;
      } catch {
        return false;
      }
    })
  );
  const recentBookings = txData.transactions.filter((_, i) => !certified[i]).slice(0, 3);

  const certData = await apiRequest("/certificates/me", { token: idToken });

  return {
    mySkills,
    allSkills: skillsData.skills,
    matches: matchData.matches.slice(0, 3),
    recentBookings,
    certCount: certData.certificates.length,
  };
}

export function DashboardPage() {
  const { userId, idToken, profile } = useAuth();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useFetch(
    () => loadDashboardData(userId, idToken),
    [userId]
  );
  const { mySkills, allSkills, matches, recentBookings, certCount } = data ?? {};

  const firstName = profile?.name?.split(" ")[0];

  return (
    <div className="max-w-5xl px-6 py-10 mx-auto">
      {/* navy hero band - anchors the page and makes the balance the hero */}
      <section className="p-8 mb-10 md:p-10 bg-navy rounded-card shadow-lift">
        <p className="mb-4 eyebrow text-ink-onDarkMuted">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </p>

        <div className="flex flex-wrap items-end mb-3 gap-x-4 gap-y-1">
          <span className="font-display text-6xl md:text-7xl text-paper tabular leading-[0.85]">
            {profile?.creditBalance ?? "\u00A0"}
          </span>
          <span className="pb-1 text-xl font-display text-ink-onDarkMuted">credits</span>
        </div>

        <p className="max-w-sm text-sm mb-7 text-ink-onDarkMuted">
          Each session you book costs 10. Teach something and you earn them back.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/skills/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors rounded-pill bg-paper text-navy hover:bg-paper-bright"
          >
            <Plus size={16} aria-hidden="true" /> Teach a skill
          </Link>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border rounded-pill border-ink-onDarkMuted text-ink-onDark hover:bg-navy-light"
          >
            Find something to learn
          </Link>
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={reload} />}

      {!error && (
        <>
          <div className="grid grid-cols-3 gap-5 pt-5 mb-10 border-t border-rule">
            <InlineStat
              label="Teaching"
              value={mySkills?.length ?? (loading ? "\u00A0" : 0)}
              sublabel="skills posted"
              to="/bookings"
            />
            <InlineStat
              label="Learning"
              value={recentBookings?.length ?? (loading ? "\u00A0" : 0)}
              sublabel="sessions booked"
              to="/bookings?tab=learning"
            />
            <InlineStat
              label="Certified"
              value={certCount ?? (loading ? "\u00A0" : 0)}
              sublabel="skills earned"
              to="/certificates"
            />
          </div>

          <section className="mb-10">
            <SectionHead index="01" title="Skills you teach" action="Manage" to="/profile" />

            {loading && <Skeleton className="w-full h-16 bg-cocoa-soft" />}

            {!loading && mySkills?.length === 0 && (
              <button
                onClick={() => navigate("/skills/new")}
                className="w-full px-5 py-6 text-left transition-colors border border-dashed rounded-card border-cocoa-soft hover:border-navy"
              >
                <p className="mb-1 font-medium text-ink-primary">Nothing posted yet</p>
                <p className="text-sm text-ink-muted">
                  Post your first skill and people can start booking you.
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-navy">
                  Post a skill <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </button>
            )}

            {!loading && mySkills?.length > 0 && (
              <ul>
                {mySkills.slice(0, 3).map((skill) => (
                  <li key={skill.skillId} className="border-b border-rule last:border-b-0">
                    <div className="flex items-baseline justify-between gap-4 py-3.5">
                      <span className="text-ink-primary">{skill.title}</span>
                      <span className="shrink-0 eyebrow text-ink-muted">{skill.category}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mb-10">
            <SectionHead index="02" title="Recommended for you" action="See all" to="/matches" />

            {loading && <Skeleton className="w-full h-16 bg-cocoa-soft" />}

            {!loading && matches?.length === 0 && (
              <p className="py-2 text-sm text-ink-muted">
                Post a skill or search on the Matches page to see suggestions here.
              </p>
            )}

            {!loading && matches?.length > 0 && (
              <ul>
                {matches.map((skill) => (
                  <li key={skill.skillId} className="border-b border-rule last:border-b-0">
                    <Link
                      to={`/teacher/${skill.teacherId}`}
                      className="flex items-baseline justify-between gap-4 py-3.5 group"
                    >
                      <span className="transition-colors text-ink-primary group-hover:text-navy">
                        {skill.title}
                      </span>
                      {typeof skill.matchScore === "number" && (
                        <span className="shrink-0 eyebrow tabular text-navy">
                          {Math.round(skill.matchScore * 100)}% match
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionHead index="03" title="Recent bookings" action="All bookings" to="/bookings?tab=learning" />

            {loading && <Skeleton className="w-full h-16 bg-cocoa-soft" />}

            {!loading && recentBookings?.length === 0 && (
              <p className="py-2 text-sm text-ink-muted">Nothing booked yet.</p>
            )}

            {!loading && recentBookings?.length > 0 && (
              <ul>
                {recentBookings.map((tx) => (
                  <li key={tx.transactionId} className="border-b border-rule last:border-b-0">
                    <Link
                      to={`/learning/${tx.transactionId}`}
                      className="flex items-baseline justify-between gap-4 py-3.5 group"
                    >
                      <span className="transition-colors text-ink-primary group-hover:text-navy">
                        {skillTitleFor(tx.skillId, allSkills)}
                      </span>
                      <span className="shrink-0 eyebrow tabular text-ink-muted">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
