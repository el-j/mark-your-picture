import { useEffect, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setShouldRender(false), 300); // Wait for transition
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 min-[900px]:hidden border-none p-0
                    ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-[var(--surface)] z-[101] 
                    rounded-t-[20px] shadow-[0_-8px_32px_rgba(0,0,0,0.3)]
                    transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                    min-[900px]:hidden flex flex-col max-h-[85vh]
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <button
          type="button"
          aria-label="Close"
          className="w-full flex justify-center pt-3 pb-2 cursor-pointer bg-transparent border-none"
          onClick={onClose}
        >
          <div className="w-10 h-1.5 bg-[var(--border)] rounded-full" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-[var(--border)]">
          <h3 className="font-bold text-[0.95rem] text-[var(--text)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--text-muted)] border-none cursor-pointer hover:bg-[var(--border)]"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto overscroll-contain flex flex-col gap-4">{children}</div>
      </div>
    </>
  );
}
