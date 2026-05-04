import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

function ThemeDisplay() {
  const { theme } = useTheme();
  return <span data-testid="theme">{theme}</span>;
}

function ToggleButton() {
  const { toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      toggle
    </button>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// ── ThemeProvider ─────────────────────────────────────────────────────────────

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders children', () => {
    render(
      <Wrapper>
        <span data-testid="child">hello</span>
      </Wrapper>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses the stored theme from localStorage', () => {
    localStorage.setItem('myp-theme', 'light');
    render(
      <Wrapper>
        <ThemeDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('sets data-theme attribute on documentElement', () => {
    localStorage.setItem('myp-theme', 'dark');
    render(
      <Wrapper>
        <ThemeDisplay />
      </Wrapper>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles from dark to light', async () => {
    localStorage.setItem('myp-theme', 'dark');
    render(
      <Wrapper>
        <ThemeDisplay />
        <ToggleButton />
      </Wrapper>,
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('toggles from light to dark', async () => {
    localStorage.setItem('myp-theme', 'light');
    render(
      <Wrapper>
        <ThemeDisplay />
        <ToggleButton />
      </Wrapper>,
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('persists the toggled theme in localStorage', async () => {
    localStorage.setItem('myp-theme', 'light');
    render(
      <Wrapper>
        <ToggleButton />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('toggle'));
    expect(localStorage.getItem('myp-theme')).toBe('dark');
  });
});

// ── useTheme outside provider ─────────────────────────────────────────────────

describe('useTheme – outside provider', () => {
  it('throws when used outside ThemeProvider', () => {
    function Bad() {
      useTheme();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useTheme must be used within ThemeProvider');
  });
});
