import { Link } from "react-router-dom";

export function StatCard({ label, value, sublabel, icon: Icon, to }) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="eyebrow text-ink-muted">{label}</p>
        {Icon && <Icon size={18} className="text-navy" aria-hidden="true" />}
      </div>
      <p className="text-3xl font-display text-ink-primary tabular">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-ink-muted">{sublabel}</p>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="block p-5 transition-colors border bg-paper-bright rounded-card border-rule hover:border-navy">
        {content}
      </Link>
    );
  }

  return (
    <div className="p-5 border bg-paper-bright rounded-card border-rule">
      {content}
    </div>
  );
}