import { X } from "lucide-react";

export function SkillCard({ skill, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 border bg-paper-bright rounded-card border-rule">
      <div className="min-w-0">
        <p className="font-medium truncate text-ink-primary">{skill.title}</p>
        <p className="text-xs text-ink-secondary">{skill.category}</p>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(skill.skillId)}
          className="transition-colors shrink-0 text-ink-muted hover:text-navy"
          aria-label={`Remove ${skill.title}`}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}