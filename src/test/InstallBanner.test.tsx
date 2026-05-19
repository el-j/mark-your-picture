import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstallBanner } from '../components/ui/InstallBanner';
import { ToastProvider } from '../hooks/useToast';
import { I18nProvider } from '../i18n/index';

function Wrapper() {
  return (
    <I18nProvider>
      <ToastProvider>
        <InstallBanner />
      </ToastProvider>
    </I18nProvider>
  );
}

describe('InstallBanner', () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it('shows iOS fallback instructions on Safari iPhone', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    });

    render(<Wrapper />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.getByText('Safari does not show the Install prompt directly.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Tap Share, then choose Add to Home Screen.')).toBeInTheDocument();
  });
});
