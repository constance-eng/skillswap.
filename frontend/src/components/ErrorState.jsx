export function ErrorState({ message, onRetry }) {
  return (
    <div className="py-16 text-center" role="alert">
      <p className="mb-1 font-medium text-ink-primary">Something went wrong</p>
      <p className="mb-4 text-sm text-ink-secondary">{message || "Please try again"}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Retry
        </button>
      )}
    </div>
  );
}