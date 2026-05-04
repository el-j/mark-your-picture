export function ProgressBar({ progress }: { progress: number }) {
  if (progress <= 0) return null;
  return (
    <div className="mt-2.5 h-[5px] bg-[var(--border-subtle)] rounded-sm overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--success)] transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
