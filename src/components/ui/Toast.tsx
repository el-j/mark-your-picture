import { useToast } from '../../hooks/useToast';

export function Toast() {
  const { message, visible } = useToast();

  return (
    <output
      id="toast"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 left-1/2 z-100 whitespace-nowrap rounded-full border border-(--border) bg-(--surface) px-4.5 py-1.5 text-(--text) text-[0.8rem] shadow-(--shadow-sm) transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        visible ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-16'
      }`}
    >
      {message}
    </output>
  );
}
