import { useMemo, useState } from "react";
import "./Cockpit.css";

/**
 * Cockpit — the interactive geometric-decay widget.
 * Encapsulates a slider, the AI×Human formula display, a tunable input panel,
 * and an inline SVG chart with three views (curve, breakdown, archetypes).
 *
 * Designed to be a self-contained Astro island. Drop it anywhere with
 * `<Cockpit client:visible />` and it boots itself.
 */

type Tier = "micro" | "small" | "medium" | "large" | "enterprise";

interface DataPoint { label: string; tier: Tier; }
const DATA: DataPoint[] = [
  { label: "Micro project", tier: "micro" }, { label: "Micro+", tier: "micro" },
  { label: "Micro++", tier: "micro" }, { label: "Micro+++", tier: "micro" },
  { label: "Small project", tier: "small" }, { label: "Small+", tier: "small" },
  { label: "Small++", tier: "small" }, { label: "Small+++", tier: "small" }, { label: "Small++++", tier: "small" },
  { label: "Medium project", tier: "medium" }, { label: "Medium+", tier: "medium" }, { label: "Medium++", tier: "medium" },
  { label: "Medium+++", tier: "medium" }, { label: "Medium++++", tier: "medium" },
  { label: "Large project", tier: "large" }, { label: "Large+", tier: "large" }, { label: "Large++", tier: "large" },
  { label: "Large+++", tier: "large" }, { label: "Large++++", tier: "large" },
  { label: "Large+5", tier: "large" }, { label: "Large+6", tier: "large" }, { label: "Large+7", tier: "large" },
  { label: "Large+8", tier: "large" }, { label: "Large+9", tier: "large" }, { label: "Large+10", tier: "large" },
  { label: "Pre-enterprise", tier: "large" }, { label: "Pre-enterprise+", tier: "large" }, { label: "Pre-enterprise++", tier: "large" },
  { label: "Enterprise edge", tier: "enterprise" }, { label: "Enterprise", tier: "enterprise" },
];
const TIERS: Record<Tier, { label: string; kloc: string; team: string; examples: string }> = {
  micro: { label: "Micro", kloc: "< 5k LOC", team: "1–2 devs", examples: "Landing page, internal tool, MVP prototype, Zapier-style automation" },
  small: { label: "Small", kloc: "5–50k LOC", team: "2–4 devs", examples: "Mobile app, marketing site + CMS, focused SaaS module" },
  medium: { label: "Medium", kloc: "50–250k LOC", team: "4–8 devs", examples: "B2B SaaS product, fintech dashboard, e-commerce platform" },
  large: { label: "Large", kloc: "250k–1M LOC", team: "8–25 devs", examples: "Multi-tenant platform, banking core integration, scaled SaaS" },
  enterprise: { label: "Enterprise", kloc: "> 1M LOC", team: "25+ devs", examples: "Legacy modernization, ERP, regulated mature codebase 10y+" },
};
type Focus = "curve" | "breakdown" | "archetypes";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const pct = (n: number) => Math.round(n * 100) + "%";
const pct1 = (n: number) => (n * 100).toFixed(1).replace(/\.0$/, "") + "%";
const fmt = (n: number) => n.toFixed(1);
const shortProduct = (base: number, n: number) => {
  const b = pct1(base);
  if (n <= 1) return b;
  if (n === 2) return `${b} × ${b}`;
  if (n === 3) return `${b} × ${b} × ${b}`;
  return `${b} × ${b} × ${b} × … × ${b}`;
};

export default function Cockpit() {
  const [idx, setIdx] = useState(9);
  const [focus, setFocus] = useState<Focus>("curve");
  const [baseAi, setBaseAi] = useState(0.97);
  const [baseHuman, setBaseHuman] = useState(0.95);

  const point = useMemo(() => {
    const n = idx + 1;
    const ai = Math.pow(baseAi, n);
    const human = Math.pow(baseHuman, n);
    const final = ai * human;
    return { n, ai, human, final, x: final * 10 };
  }, [idx, baseAi, baseHuman]);

  const row = DATA[idx];
  const tier = TIERS[row.tier];

  // SVG chart sizing
  const W = 720, H = 360, padL = 56, padR = 24, padT = 24, padB = 44;
  const innerW = W - padL - padR, innerH = H - padT - padB, N = DATA.length;
  const xAt = (i: number) => padL + (i / (N - 1)) * innerW;
  const yAt = (v: number) => padT + innerH - v * innerH;
  const yAtX = (x: number) => yAt(x / 10);
  const pointVals = (i: number) => {
    const n = i + 1;
    const ai = Math.pow(baseAi, n), human = Math.pow(baseHuman, n);
    return { n, ai, human, final: ai * human, x: ai * human * 10 };
  };
  const finalPts = DATA.map((_, i) => [xAt(i), yAtX(pointVals(i).x)] as const);
  const finalPath = finalPts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  const finalArea = finalPath + ` L${xAt(N - 1)} ${yAt(0)} L${xAt(0)} ${yAt(0)} Z`;

  const titles: Record<Focus, [string, string]> = {
    curve: ["Geometric decay curve", "Base factors multiplied step-by-step as project scale grows"],
    breakdown: ["AIⁿ × Humanⁿ breakdown", "One input per factor — the slider changes n, both sequences compound"],
    archetypes: ["Five archetypes", "Average geometric boost by project tier"],
  };

  return (
    <div className="cockpit-grid">
      <div className="panel">
        <div className="tier-row">
          <span className={`tier-pill tier-${row.tier}`}>{tier.label}</span>
          <span className="tier-meta">{tier.kloc} · {tier.team} · step {point.n}</span>
        </div>

        <div className="x-display">
          <span className="num">{fmt(point.x)}</span>
          <span className="sym">×</span>
        </div>
        <div className="x-caption">Realized productivity boost</div>

        <div className="formula">
          <div className="formula-cell">
            <div className="formula-v">{pct(point.ai)}</div>
            <div className="formula-l">AI efficiency</div>
            <div className="formula-h">model usefulness</div>
          </div>
          <span className="formula-op">×</span>
          <div className="formula-cell">
            <div className="formula-v">{pct(point.human)}</div>
            <div className="formula-l">Human factor</div>
            <div className="formula-h">coord. + review + integration</div>
          </div>
          <span className="formula-op">=</span>
          <div className="formula-cell is-final">
            <div className="formula-v">{pct(point.final)}</div>
            <div className="formula-l">Final</div>
            <div className="formula-h">of theoretical 10×</div>
          </div>
        </div>

        <div className="tune">
          <div className="tune-head">
            <div>
              <div className="tune-title">Tune the model</div>
              <div className="tune-hint">Set once — slider applies as geometric sequence</div>
            </div>
            <button className="tune-reset" type="button"
              onClick={() => { setBaseAi(0.97); setBaseHuman(0.95); }}>
              Reset defaults
            </button>
          </div>
          <div className="tune-grid">
            <Field label="AI efficiency / step" id="aiInput" value={Math.round(baseAi * 100)}
              onChange={(v) => setBaseAi(clamp01(v / 100))} />
            <Field label="Human factor / step" id="humanInput" value={Math.round(baseHuman * 100)}
              onChange={(v) => setBaseHuman(clamp01(v / 100))} />
          </div>
          <div className="tune-formulas">
            <div className="tune-formula"><strong>AI</strong> = <code>{shortProduct(baseAi, point.n)}</code> = {pct1(point.ai)}</div>
            <div className="tune-formula"><strong>HF</strong> = <code>{shortProduct(baseHuman, point.n)}</code> = {pct1(point.human)}</div>
          </div>
        </div>

        <div className="notes">
          <Note title="Measured, not modeled" body="Pulled from 53 production codebases we built or co-built between 2024 and 2026 — greenfield MVPs, scale-ups, legacy rescues. Same toolchain, different terrain." />
          <Note title="Boost = shipped value" body="We track reviewed, merged, deployed work — not lines generated. Code thrown away, rewritten, or rolled back does not count." />
          <Note title="Why the curve bends" body="Below ~30k LOC AI compounds the engineer. Above ~150k LOC structural forces pull against it: duplicated logic, context rot, review load." />
        </div>

        <div>
          <div className="examples-label">Typical scope at this size</div>
          <div className="examples-text">{tier.examples}</div>
        </div>
        <div className="credit">Model by <strong>Łukasz Graliński</strong> · Pirxey</div>
      </div>

      <div className="chart-panel">
        <div className="chart-head">
          <div>
            <div className="chart-title">{titles[focus][0]}</div>
            <div className="chart-sub">{titles[focus][1]}</div>
          </div>
          <div className="chart-tag">scale: 0 → 10×</div>
        </div>
        <div className="chart-tabs">
          {(["curve", "breakdown", "archetypes"] as Focus[]).map((f) => (
            <button key={f} className={`chart-tab ${focus === f ? "active" : ""}`}
              onClick={() => setFocus(f)}>
              {f === "curve" ? "Boost curve" : f === "breakdown" ? "AI × Human" : "Archetypes"}
            </button>
          ))}
        </div>

        <div className="slider-shell">
          <div className="slider-labels">
            <span>Micro</span><span>Small</span><span>Medium</span><span>Large</span><span>Enterprise</span>
          </div>
          <p className="slider-proof">
            <strong>No assumptions.</strong> We measured the boost across 53 products we shipped over the last two years — from solo prototypes to multi-team platforms. <em>Drag and see for yourself.</em>
          </p>
          <input type="range" className="slider" min={0} max={DATA.length - 1} step={1}
            value={idx} onChange={(e) => setIdx(+e.target.value)} aria-label="Project size" />
          <div className="slider-ticks">
            {DATA.map((_, i) => (
              <span key={i} className={`slider-tick ${i === idx ? "active" : ""}`} />
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="AI boost decay chart">
          <defs>
            <linearGradient id="finalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6026" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#FF6026" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="finalStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFB46B" />
              <stop offset="100%" stopColor="#FF6026" />
            </linearGradient>
            <pattern id="grid" width={innerW / 10} height={innerH / 5} patternUnits="userSpaceOnUse" x={padL} y={padT}>
              <path d={`M0 0 L0 ${innerH / 5} M0 0 L${innerW / 10} 0`} stroke="rgba(249,249,234,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x={padL} y={padT} width={innerW} height={innerH} fill="url(#grid)" />
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={padL} y1={yAtX(v)} x2={W - padR} y2={yAtX(v)}
                stroke="rgba(249,249,234,0.08)" strokeWidth="1" strokeDasharray={v === 10 ? "0" : "2 4"} />
              <text x={padL - 10} y={yAtX(v) + 4} textAnchor="end" className="axis-text">{v}×</text>
            </g>
          ))}
          {(["micro", "small", "medium", "large", "enterprise"] as Tier[]).map((t) => {
            const ix = DATA.map((d, i) => d.tier === t ? i : -1).filter((i) => i >= 0);
            if (!ix.length) return null;
            const step = xAt(1) - xAt(0);
            const x1 = xAt(ix[0]) - step / 2, x2 = xAt(ix[ix.length - 1]) + step / 2;
            return (
              <text key={t} x={(x1 + x2) / 2} y={H - padB + 20} textAnchor="middle" className="tier-text">
                {TIERS[t].label.toUpperCase()}
              </text>
            );
          })}

          {focus === "archetypes" ? (
            (["micro", "small", "medium", "large", "enterprise"] as Tier[]).map((t, i) => {
              const colors: Record<Tier, string> = { micro: "#FFD46B", small: "#FFB46B", medium: "#FF8C5A", large: "#FF6026", enterprise: "#C13D14" };
              const tiers: Tier[] = ["micro", "small", "medium", "large", "enterprise"];
              const gap = innerW / tiers.length, barW = gap * 0.55;
              const rows = DATA.map((d, j) => ({ d, j })).filter(({ d }) => d.tier === t);
              const avg = rows.reduce((s, r) => s + pointVals(r.j).x, 0) / rows.length;
              const cx = padL + gap * (i + 0.5), yt = yAtX(avg), yb = yAtX(0);
              return (
                <g key={t}>
                  <rect x={cx - barW / 2} y={yt} width={barW} height={yb - yt} fill={colors[t]} opacity={0.85} rx={3} />
                  <text x={cx} y={yt - 8} textAnchor="middle" className="point-label">{fmt(avg)}×</text>
                </g>
              );
            })
          ) : (
            <>
              {focus === "breakdown" && (
                <>
                  <path d={DATA.map((_, i) => [xAt(i), yAtX(pointVals(i).ai * 10)] as const).map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ")}
                    fill="none" stroke="#7BD8FF" strokeWidth="1.5" strokeDasharray="4 3" opacity={0.85} />
                  <path d={DATA.map((_, i) => [xAt(i), yAtX(pointVals(i).human * 10)] as const).map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ")}
                    fill="none" stroke="#B98FFF" strokeWidth="1.5" strokeDasharray="4 3" opacity={0.85} />
                  {[["#7BD8FF", "AI efficiency", 0], ["#B98FFF", "Human factor", 20], ["#FF6026", "Final = AI × Human", 40]].map(([c, l, y]) => (
                    <g key={l as string} transform={`translate(${padL + 12},${padT + 12 + (y as number)})`}>
                      <line x1={0} y1={6} x2={20} y2={6} stroke={c as string} strokeWidth="2" strokeDasharray={(y as number) < 40 ? "4 3" : "0"} />
                      <text x={28} y={10} className="legend-text">{l}</text>
                    </g>
                  ))}
                </>
              )}
              <path d={finalArea} fill="url(#finalFill)" />
              <path d={finalPath} fill="none" stroke="url(#finalStroke)" strokeWidth="2.5" />
              {focus === "curve" && (
                <>
                  <circle cx={xAt(0)} cy={yAtX(pointVals(0).x)} r={3} fill="#F9F9EA" opacity={0.6} />
                  <text x={xAt(0) + 12} y={yAtX(pointVals(0).x) - 8} textAnchor="start" className="anno-text">{fmt(pointVals(0).x)}× — greenfield MVP</text>
                  <circle cx={xAt(N - 1)} cy={yAtX(pointVals(N - 1).x)} r={3} fill="#F9F9EA" opacity={0.6} />
                  <text x={xAt(N - 1) - 12} y={yAtX(pointVals(N - 1).x) - 8} textAnchor="end" className="anno-text">{fmt(pointVals(N - 1).x)}× — legacy enterprise</text>
                </>
              )}
              <line x1={xAt(idx)} y1={padT} x2={xAt(idx)} y2={H - padB} stroke="rgba(249,249,234,0.22)" strokeDasharray="3 4" />
              <circle cx={xAt(idx)} cy={yAtX(point.x)} r={7} fill="#FF6026" stroke="#060411" strokeWidth="3" />
              <text x={xAt(idx)} y={yAtX(point.x) - 14} textAnchor="middle" className="point-label">{fmt(point.x)}×</text>
            </>
          )}

          {DATA.map((_, i) => {
            const step = xAt(1) - xAt(0);
            return (
              <rect key={i} x={xAt(i) - step / 2} y={padT} width={step} height={innerH}
                fill="transparent" style={{ cursor: "pointer" }}
                onClick={() => setIdx(i)} />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function Field({ label, id, value, onChange }: { label: string; id: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="tune-input">
      <label htmlFor={id}>{label}</label>
      <div className="percent-field">
        <input id={id} type="number" min={0} max={100} step={1} inputMode="decimal"
          value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
        <span>%</span>
      </div>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className="note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}
