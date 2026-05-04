export function ProgressBar({ progress }: { progress: number }) {
  if (progress <= 0) return null;
  return (
    <div className="mt-2.5 h-1.25 bg-(--border-subtle) rounded-sm overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-(--accent) to-(--success) transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
