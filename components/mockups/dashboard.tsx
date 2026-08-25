/**
 * A simplified rendering of the product's summary screen.
 *
 * Built as markup rather than a screenshot: it weighs almost nothing, it
 * stays consistent with the brand tokens, and it reflows on a phone instead
 * of turning into an unreadable thumbnail. CLAUDE.md §7 rules out stock
 * photography and faked captures alike.
 *
 * The numbers are illustrative and deliberately generic — they are labelled
 * as an example in the surrounding copy, and they are not a client's data.
 *
 * The whole thing is aria-hidden: it is decoration. Everything it depicts is
 * stated in the text next to it.
 */

const SPARK = [18, 26, 22, 34, 30, 44, 38, 52, 46, 62, 56, 72];

function Sparkline() {
  const w = 260;
  const h = 72;
  const max = Math.max(...SPARK);
  const step = w / (SPARK.length - 1);
  const pts = SPARK.map((v, i) => [i * step, h - (v / max) * (h - 8)] as const);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      role="presentation"
    >
      <defs>
        <linearGradient id="nx-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#nx-spark)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--color-brand-500)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Donut() {
  // Three slices: 52 / 30 / 18.
  const r = 32;
  const c = 2 * Math.PI * r;
  const slices = [
    { pct: 52, color: "var(--color-brand-500)" },
    { pct: 30, color: "var(--color-brand-300)" },
    { pct: 18, color: "var(--color-ink-500)" },
  ];
  let offset = 0;

  return (
    <svg viewBox="0 0 80 80" className="size-20 shrink-0" role="presentation">
      <g transform="rotate(-90 40 40)">
        {slices.map((s) => {
          const dash = (s.pct / 100) * c;
          const el = (
            <circle
              key={s.color}
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </g>
    </svg>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="border-ink-500/12 rounded-xl border bg-white p-3">
      <p className="tracking-eyebrow text-ink-500 text-[0.6rem] uppercase">{label}</p>
      <p className="text-ink-900 mt-1 text-base font-bold tabular-nums">{value}</p>
      <p className="text-brand-700 text-[0.65rem] font-semibold">{delta}</p>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div
      aria-hidden
      className="rounded-card border-ink-500/12 bg-paper-50 shadow-card w-full max-w-xl border p-3 select-none sm:p-4"
    >
      {/* window chrome */}
      <div className="mb-3 flex items-center gap-2">
        <span className="bg-ink-500/25 size-2 rounded-full" />
        <span className="bg-ink-500/25 size-2 rounded-full" />
        <span className="bg-ink-500/25 size-2 rounded-full" />
        <span className="ml-2 h-4 flex-1 rounded-full bg-white" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        {/* sidebar */}
        <div className="bg-ink-900 hidden w-32 flex-col gap-1.5 rounded-xl p-3 sm:flex">
          <span className="bg-brand-500 mb-2 h-2 w-14 rounded-full" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-2 rounded-full ${i === 0 ? "w-full bg-white/80" : "w-3/4 bg-white/20"}`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Ventas del día" value="$ 2.480.500" delta="+12%" />
            <Stat label="Facturas" value="86" delta="+4%" />
            <Stat label="Margen" value="$ 604.200" delta="+8%" />
          </div>

          <div className="border-ink-500/12 rounded-xl border bg-white p-3">
            <div className="flex items-baseline justify-between">
              <p className="tracking-eyebrow text-ink-500 text-[0.6rem] uppercase">
                Ventas del mes
              </p>
              <p className="text-ink-500 text-[0.65rem] font-semibold">Últimos 12 días</p>
            </div>
            <div className="mt-2 h-16">
              <Sparkline />
            </div>
          </div>

          <div className="border-ink-500/12 flex items-center gap-4 rounded-xl border bg-white p-3">
            <Donut />
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="tracking-eyebrow text-ink-500 text-[0.6rem] uppercase">
                Categorías
              </p>
              {[
                { c: "bg-brand-500", w: "w-20" },
                { c: "bg-brand-300", w: "w-14" },
                { c: "bg-ink-500", w: "w-10" },
              ].map((row) => (
                <span key={row.c} className="flex items-center gap-2">
                  <span className={`size-2 shrink-0 rounded-full ${row.c}`} />
                  <span className={`bg-ink-500/20 h-1.5 rounded-full ${row.w}`} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
