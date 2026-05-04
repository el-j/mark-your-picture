export function ImprintPage() {
  const cardCls = "bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-3";
  const labelCls = "text-[0.62rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1.5";

  return (
    <main className="max-w-[680px] mx-auto py-8 px-5 flex flex-col gap-4 w-full">
      <h2 className="text-2xl font-bold bg-gradient-to-br from-[var(--accent)] to-[#a78bfa] bg-clip-text text-transparent">
        Imprint
      </h2>

      <div className={cardCls}>
        <p className={labelCls}>Responsible for content</p>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          This website is a non-commercial, open-source project. It is provided free of charge without any warranty of fitness for a particular purpose. The project is maintained by the GitHub user <strong className="text-[var(--text)]">el-j</strong>.
        </p>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)] mt-2.5">
          Contact &amp; provider information: See the GitHub profile linked below. For legal inquiries, please open an issue or reach out via the repository.
        </p>
      </div>

      <div className={cardCls}>
        <p className={labelCls}>Liability Notice</p>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          The content on this site is provided for informational purposes only. Despite careful review, we assume no liability for the accuracy, completeness, or timeliness of the information. Links to external websites are outside our control; we accept no responsibility for their content.
        </p>
      </div>

      <div className={cardCls}>
        <p className={labelCls}>Source Code</p>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)] mb-2">
          The full source code is publicly available under an open-source license:
        </p>
        <a href="https://github.com/el-j/mark-your-picture" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-[0.85rem] break-all">
          github.com/el-j/mark-your-picture
        </a>
      </div>

      <div className={cardCls}>
        <p className={labelCls}>Privacy</p>
        <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
          No personal data is collected by this application. All image processing is performed locally in your browser using the HTML5 Canvas API. No cookies are set, no analytics are run, and no files are transmitted to any server. The hosting provider may collect standard web server logs (IP address, request time, user-agent) as part of normal infrastructure operation.
        </p>
      </div>
    </main>
  );
}
