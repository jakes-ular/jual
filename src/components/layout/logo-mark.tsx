export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="var(--foreground)" strokeWidth="0.75" opacity="0.45" />
      {[0, 90, 180, 270].map((deg) => (
        <line
          key={deg}
          x1="16"
          y1="1.5"
          x2="16"
          y2="4"
          stroke="var(--foreground)"
          strokeWidth="1"
          transform={`rotate(${deg} 16 16)`}
        />
      ))}
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        fontWeight="700"
        fill="var(--foreground)"
      >
        A
      </text>
      <circle cx="25.5" cy="7" r="2" fill="var(--primary)" />
    </svg>
  );
}
