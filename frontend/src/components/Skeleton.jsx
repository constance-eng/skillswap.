export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-apricot-light rounded-card ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}