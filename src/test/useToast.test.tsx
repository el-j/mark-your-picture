import { act, render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../hooks/useToast';

// ── Helpers ──────────────────────────────────────────────────────────────────

function ToastDisplay() {
  const { message, visible } = useToast();
  return (
    <div>
      <span data-testid="message">{message}</span>
      <span data-testid="visible">{String(visible)}</span>
    </div>
  );
}

function TriggerButton({ msg, duration }: { msg: string; duration?: number }) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast(msg, duration)}>
      show
    </button>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

// ── ToastProvider ─────────────────────────────────────────────────────────────

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('starts with no visible message', () => {
    render(
      <Wrapper>
        <ToastDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('visible').textContent).toBe('false');
    expect(screen.getByTestId('message').textContent).toBe('');
  });

  it('shows a message when toast() is called', () => {
    render(
      <Wrapper>
        <ToastDisplay />
        <TriggerButton msg="Hello!" />
      </Wrapper>,
    );
    act(() => {
      screen.getByText('show').click();
    });
    expect(screen.getByTestId('visible').textContent).toBe('true');
    expect(screen.getByTestId('message').textContent).toBe('Hello!');
  });

  it('hides the message after the default duration (2500ms)', () => {
    render(
      <Wrapper>
        <ToastDisplay />
        <TriggerButton msg="Bye!" />
      </Wrapper>,
    );
    act(() => {
      screen.getByText('show').click();
    });
    expect(screen.getByTestId('visible').textContent).toBe('true');
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByTestId('visible').textContent).toBe('false');
  });

  it('hides the message after a custom duration', () => {
    render(
      <Wrapper>
        <ToastDisplay />
        <TriggerButton msg="Custom!" duration={1000} />
      </Wrapper>,
    );
    act(() => {
      screen.getByText('show').click();
    });
    expect(screen.getByTestId('visible').textContent).toBe('true');
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(screen.getByTestId('visible').textContent).toBe('true');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('visible').textContent).toBe('false');
  });

  it('resets the timer when toast() is called again before expiry', () => {
    render(
      <Wrapper>
        <ToastDisplay />
        <TriggerButton msg="First" duration={2000} />
        <TriggerButton msg="Second" duration={2000} />
      </Wrapper>,
    );
    const [firstBtn, secondBtn] = screen.getAllByText('show');
    act(() => {
      firstBtn.click();
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    // Trigger second toast mid-way through the first
    act(() => {
      secondBtn.click();
    });
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(screen.getByTestId('visible').textContent).toBe('true');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('visible').textContent).toBe('false');
  });
});

// ── Hook guard ────────────────────────────────────────────────────────────────

describe('useToast – outside provider', () => {
  it('throws when used outside ToastProvider', () => {
    function Bad() {
      useToast();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useToast must be used within ToastProvider');
  });
});
