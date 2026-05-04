import { useT } from '../../i18n/index';

export function AboutPage() {
  const t = useT();
  const cardCls =
    'bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-3';

  return (
    <main className="max-w-[680px] mx-auto py-8 px-5 flex flex-col gap-4 w-full">
      <h2 className="text-2xl font-bold bg-gradient-to-br from-[var(--accent)] to-[#a78bfa] bg-clip-text text-transparent">
        {t('about.title')}
      </h2>

      <div className={cardCls}>
        <h3 className="text-[0.95rem] font-bold mb-1.5 text-[var(--text)]">
          {t('about.why.heading')}
        </h3>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          {t('about.why.body')}
        </p>
      </div>

      <div className={cardCls}>
        <h3 className="text-[0.95rem] font-bold mb-1.5 text-[var(--text)]">
          {t('about.noUpload.heading')}
        </h3>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          {t('about.noUpload.body')}
        </p>
      </div>

      <div className={cardCls}>
        <h3 className="text-[0.95rem] font-bold mb-1.5 text-[var(--text)]">
          {t('about.clientSide.heading')}
        </h3>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          {t('about.clientSide.body')}
        </p>
      </div>

      <div className={cardCls}>
        <h3 className="text-[0.95rem] font-bold mb-1.5 text-[var(--text)]">
          {t('about.whatYouCanDo.heading')}
        </h3>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          {t('about.whatYouCanDo.body')}
        </p>
      </div>

      <div className={cardCls}>
        <h3 className="text-[0.95rem] font-bold mb-1.5 text-[var(--text)]">
          {t('about.openSource.heading')}
        </h3>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          {t('about.openSource.body')}
        </p>
        <a
          href="https://github.com/el-j/mark-your-picture"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 py-2.5 px-4 rounded-[var(--radius-sm)] text-[0.82rem] font-semibold bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-glow)] no-underline hover:bg-[var(--accent-hover)] hover:-translate-y-px transition-all"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          {t('about.openSource.github')}
        </a>
      </div>

      <div className={`${cardCls} flex items-center justify-between`}>
        <span className="text-[0.78rem] font-medium text-[var(--text-muted)]">
          {t('about.version')}
        </span>
        <span className="text-[0.78rem] font-mono font-semibold text-[var(--accent)]">
          v{__APP_VERSION__}
        </span>
      </div>
    </main>
  );
}
