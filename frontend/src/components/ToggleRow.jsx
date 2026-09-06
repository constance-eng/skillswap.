export function ToggleRow({ label, description, checked = false, disabled = true }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="pr-4">
        <p className="text-sm text-ink-primary">{label}</p>
        {description && (
          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
        )}
      </div>
      <div
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        className={`w-10 h-6 rounded-pill relative shrink-0 transition-colors ${
          checked ? "bg-accent" : "bg-bg-base border border-accent-soft"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink-primary transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </div>
  );
}