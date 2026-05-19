import { useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [dragY, setDragY] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
      setDragY(0);
      const timer = setTimeout(() => setShouldRender(false), 300); // Wait for transition
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragStartYRef.current = e.clientY;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current || dragStartYRef.current == null) return;
    const delta = Math.max(0, e.clientY - dragStartYRef.current);
    setDragY(delta);
  };

  const handleDragEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragStartYRef.current = null;
    if (dragY > 90) {
      onClose();
    }
    setDragY(0);
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className={`fixed inset-0 z-[100] border-none bg-black/60 p-0 transition-opacity duration-300 min-[900px]:hidden ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed right-0 bottom-0 left-0 z-[101] flex max-h-[85vh] flex-col rounded-t-[20px] bg-[var(--surface)] shadow-[0_-8px_32px_rgba(0,0,0,0.3)] min-[900px]:hidden ${draggingRef.current ? '' : 'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'}`}
        style={{
          transform: isOpen ? `translateY(${dragY}px)` : 'translateY(100%)',
          touchAction: 'pan-y',
        }}
      >
        {/* Handle */}
        <button
          type="button"
          aria-label="Close"
          className="flex w-full cursor-pointer justify-center border-none bg-transparent pt-3 pb-2"
          onClick={onClose}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="h-1.5 w-10 rounded-full bg-[var(--border)]" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-[var(--border)] border-b px-5 pb-3">
          <h3 className="font-bold text-[0.95rem] text-[var(--text)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--surface2)] text-[var(--text-muted)] hover:bg-[var(--border)]"
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
        <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain p-5 [webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>
    </>
  );
}
