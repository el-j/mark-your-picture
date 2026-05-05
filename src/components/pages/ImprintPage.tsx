import { useT } from '../../i18n/index';

export function ImprintPage() {
  const t = useT();
  const cardCls =
    'bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-3';
  const labelCls =
    'text-[0.62rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1.5';

  return (
    <main className="mx-auto flex w-full max-w-[680px] flex-col gap-4 px-5 py-8">
      <h2 className="bg-gradient-to-br from-[var(--accent)] to-[#a78bfa] bg-clip-text font-bold text-2xl text-transparent">
        {t('imprint.title')}
      </h2>

      <div className={cardCls}>
        <p className={labelCls}>{t('imprint.responsible.label')}</p>
        <p className="text-[0.85rem] text-[var(--text-muted)] leading-relaxed">
          {t('imprint.responsible.body')} <strong className="text-[var(--text)]">el-j</strong>.
        </p>
        <p className="mt-2.5 text-[0.85rem] text-[var(--text-muted)] leading-relaxed">
          {t('imprint.responsible.contact')}
        </p>
      </div>

      <div className={cardCls}>
        <p className={labelCls}>{t('imprint.liability.label')}</p>
        <p className="text-[0.85rem] text-[var(--text-muted)] leading-relaxed">
          {t('imprint.liability.body')}
        </p>
      </div>

      <div className={cardCls}>
        <p className={labelCls}>{t('imprint.source.label')}</p>
        <p className="mb-2 text-[0.85rem] text-[var(--text-muted)] leading-relaxed">
          {t('imprint.source.body')}
        </p>
        <a
          href="https://github.com/el-j/mark-your-picture"
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-[0.85rem] text-[var(--accent)]"
        >
          github.com/el-j/mark-your-picture
        </a>
      </div>

      <div className={cardCls}>
        <p className={labelCls}>{t('imprint.privacy.label')}</p>
        <p className="text-[0.85rem] text-[var(--text-muted)] leading-relaxed">
          {t('imprint.privacy.body')}
        </p>
      </div>
    </main>
  );
}
