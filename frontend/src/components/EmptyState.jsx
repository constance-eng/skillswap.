export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="py-16 text-center" role="status">
      {Icon && (
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-apricot-light">
          <Icon size={22} className="text-navy" aria-hidden="true" />
        </div>
      )}
      <p className="mb-1 font-medium text-ink-primary">{title}</p>
      {subtitle && <p className="mb-4 text-sm text-ink-secondary">{subtitle}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}