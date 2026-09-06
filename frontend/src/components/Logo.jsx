export function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 200 200" role="img" aria-label="SkillSwap logo">
        <rect width="200" height="200" rx="44" fill="#2A3244" />
        <path
          d="M65,125 L65,85 a10,10 0 0 1 10,-10 h35"
          fill="none"
          stroke="#2B1810"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M100,60 L122,75 L100,90"
          fill="none"
          stroke="#2B1810"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M135,85 L135,125 a10,10 0 0 1 -10,10 h-35"
          fill="none"
          stroke="#3D2418"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M100,150 L78,135 L100,120"
          fill="none"
          stroke="#3D2418"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-semibold font-display text-ink-primary">
        Skill<span className="text-accent">Swap</span>
      </span>
    </div>
  );
}