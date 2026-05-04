import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWatermark, WatermarkProvider } from '../contexts/WatermarkContext';
import { I18nProvider } from '../i18n/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <WatermarkProvider>{children}</WatermarkProvider>
    </I18nProvider>
  );
}

function StateDisplay() {
  const { state } = useWatermark();
  return (
    <div>
      <span data-testid="text">{state.text}</span>
      <span data-testid="mode">{state.mode}</span>
      <span data-testid="tab">{state.activeTab}</span>
      <span data-testid="position">{state.position}</span>
      <span data-testid="opacity">{state.opacity}</span>
      <span data-testid="rotation">{state.rotation}</span>
      <span data-testid="font">{state.font}</span>
      <span data-testid="size">{state.size}</span>
      <span data-testid="color">{state.color}</span>
      <span data-testid="hasApplied">{String(state.hasApplied)}</span>
    </div>
  );
}

function DispatchButton({
  action,
  label,
}: {
  action: Parameters<ReturnType<typeof useWatermark>['dispatch']>[0];
  label: string;
}) {
  const { dispatch } = useWatermark();
  return (
    <button type="button" onClick={() => dispatch(action)}>
      {label}
    </button>
  );
}

// ── Default state ─────────────────────────────────────────────────────────────

describe('WatermarkProvider – default state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has the expected default values', () => {
    render(
      <Wrapper>
        <StateDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('text').textContent).toBe('© My Watermark');
    expect(screen.getByTestId('mode').textContent).toBe('single');
    expect(screen.getByTestId('tab').textContent).toBe('text');
    expect(screen.getByTestId('opacity').textContent).toBe('60');
    expect(screen.getByTestId('rotation').textContent).toBe('-30');
  });
});

// ── Dispatch actions ──────────────────────────────────────────────────────────

describe('WatermarkProvider – dispatch actions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('SET_TEXT updates the text value', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_TEXT', value: 'Hello World' }} label="set-text" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-text'));
    expect(screen.getByTestId('text').textContent).toBe('Hello World');
  });

  it('SET_FONT updates the font value', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_FONT', value: 'Georgia' }} label="set-font" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-font'));
    expect(screen.getByTestId('font').textContent).toBe('Georgia');
  });

  it('SET_SIZE updates the size value', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_SIZE', value: 96 }} label="set-size" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-size'));
    expect(screen.getByTestId('size').textContent).toBe('96');
  });

  it('SET_COLOR updates the color value', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_COLOR', value: '#000000' }} label="set-color" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-color'));
    expect(screen.getByTestId('color').textContent).toBe('#000000');
  });

  it('SET_ACTIVE_TAB switches to image tab', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_ACTIVE_TAB', tab: 'image' }} label="set-tab" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-tab'));
    expect(screen.getByTestId('tab').textContent).toBe('image');
  });

  it('SET_MODE switches to batch mode', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_MODE', value: 'batch' }} label="set-mode" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-mode'));
    expect(screen.getByTestId('mode').textContent).toBe('batch');
  });

  it('SET_POSITION updates position', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_POSITION', value: 'top-left' }} label="set-pos" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-pos'));
    expect(screen.getByTestId('position').textContent).toBe('top-left');
  });

  it('SET_OPACITY updates opacity', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_OPACITY', value: 80 }} label="set-opacity" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-opacity'));
    expect(screen.getByTestId('opacity').textContent).toBe('80');
  });

  it('SET_ROTATION updates rotation', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_ROTATION', value: 45 }} label="set-rotation" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-rotation'));
    expect(screen.getByTestId('rotation').textContent).toBe('45');
  });

  it('SET_HAS_APPLIED updates hasApplied flag', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_HAS_APPLIED', value: true }} label="set-applied" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-applied'));
    expect(screen.getByTestId('hasApplied').textContent).toBe('true');
  });

  it('RESET returns state to initial values', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_TEXT', value: 'changed' }} label="set-text" />
        <DispatchButton action={{ type: 'RESET' }} label="reset" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-text'));
    expect(screen.getByTestId('text').textContent).toBe('changed');
    await userEvent.click(screen.getByText('reset'));
    expect(screen.getByTestId('text').textContent).toBe('© My Watermark');
  });

  it('CLEAR_SOURCE resets hasApplied and source', async () => {
    render(
      <Wrapper>
        <StateDisplay />
        <DispatchButton action={{ type: 'SET_HAS_APPLIED', value: true }} label="apply" />
        <DispatchButton action={{ type: 'CLEAR_SOURCE' }} label="clear" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('apply'));
    expect(screen.getByTestId('hasApplied').textContent).toBe('true');
    await userEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('hasApplied').textContent).toBe('false');
  });

  it('SET_BATCH_FILES populates batchFiles and resets statuses', async () => {
    function BatchDisplay() {
      const { state } = useWatermark();
      return <span data-testid="count">{state.batchFiles.length}</span>;
    }
    const files = [new File(['a'], 'a.png', { type: 'image/png' })];
    render(
      <Wrapper>
        <BatchDisplay />
        <DispatchButton action={{ type: 'SET_BATCH_FILES', files }} label="set-files" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('set-files'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });
});

// ── getRenderOpts ─────────────────────────────────────────────────────────────

describe('WatermarkProvider – getRenderOpts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns text render options for text tab', () => {
    function OptsDisplay() {
      const { getRenderOpts } = useWatermark();
      const opts = getRenderOpts();
      return <span data-testid="type">{opts.watermark.type}</span>;
    }
    render(
      <Wrapper>
        <OptsDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('type').textContent).toBe('text');
  });

  it('returns image render options when image tab is active', async () => {
    function OptsDisplay() {
      const { getRenderOpts, state } = useWatermark();
      const opts = getRenderOpts();
      return (
        <span data-testid="type">
          {state.activeTab === 'image' ? opts.watermark.type : 'text-tab-active'}
        </span>
      );
    }
    render(
      <Wrapper>
        <OptsDisplay />
        <DispatchButton action={{ type: 'SET_ACTIVE_TAB', tab: 'image' }} label="to-image" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('to-image'));
    expect(screen.getByTestId('type').textContent).toBe('image');
  });
});

// ── Hook guard ────────────────────────────────────────────────────────────────

describe('useWatermark – outside provider', () => {
  it('throws when used outside WatermarkProvider', () => {
    function Bad() {
      useWatermark();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useWatermark must be used within WatermarkProvider');
  });
});
