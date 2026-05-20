import { useCallback, useMemo, useState } from "react";
import "./EmailAuthCheck.css";

/**
 * EmailAuthCheck — an interactive domain email-authentication auditor.
 * Designed to drop into an Astro brief as `<EmailAuthCheck client:visible />`.
 *
 * For v1 it performs every DNS lookup directly from the browser using
 * Cloudflare's DNS-over-HTTPS JSON endpoint (https://cloudflare-dns.com/dns-query).
 * No backend required. The deep BIMI VMC certificate validation (EKU,
 * LogotypeExtension, logo hash binding, chain) requires a backend — when
 * `PUBLIC_MAILCHECK_API_URL` is set in Astro env, the component will call it
 * to augment the BIMI result with that data.
 */

type Status = "ok" | "warn" | "fail" | "na" | "pending";
type Layer = "spf" | "dkim" | "dmarc" | "bimi";

interface Finding {
  level: "ok" | "warn" | "fail" | "info";
  message: string;
}

interface LayerResult {
  status: Status;
  summary: string;
  raw?: string;
  findings: Finding[];
}

interface AuditResult {
  domain: string;
  spf: LayerResult;
  dkim: LayerResult;
  dmarc: LayerResult;
  bimi: LayerResult;
}

const PRESETS = ["mbank.pl", "pirxey.com", "widelab.co"] as const;

const DKIM_SELECTORS = [
  // generic / multi-platform
  "default", "dkim", "mail", "smtp", "key1", "key2",
  // Google Workspace
  "google",
  // Microsoft 365
  "selector1", "selector2",
  // SendGrid (US + EU)
  "s1", "s2", "eus1", "eus2",
  // Mailgun
  "mailo", "pic", "k1", "smtp",
  // Mailchimp / Mandrill
  "k1", "mandrill",
  // ProtonMail
  "protonmail", "protonmail2", "protonmail3",
  // Zoho
  "zmail",
  // Mailjet / Sendinblue
  "mailjet", "sendinblue",
] as const;

// Known ESP signatures in SPF includes — used to label & sanity-check.
const ESP_INCLUDES: Record<string, string> = {
  "sendgrid.net": "SendGrid",
  "amazonses.com": "Amazon SES",
  "mailgun.org": "Mailgun",
  "_spf.google.com": "Google Workspace",
  "spf.protection.outlook.com": "Microsoft 365",
  "spf.mandrillapp.com": "Mandrill",
  "spf.mailjet.com": "Mailjet",
  "mailjet.com": "Mailjet",
  "_spf.salesforce.com": "Salesforce",
  "_spf.zoho.com": "Zoho",
  "servers.mcsv.net": "Mailchimp",
  "spmail.com": "SparkPost",
};

const DOH = "https://cloudflare-dns.com/dns-query";

async function dohTxt(name: string): Promise<string[]> {
  return doh(name, "TXT");
}
async function dohCname(name: string): Promise<string[]> {
  return doh(name, "CNAME");
}
async function doh(name: string, type: "TXT" | "CNAME"): Promise<string[]> {
  const url = `${DOH}?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  if (!res.ok) throw new Error(`DoH ${type} ${name}: HTTP ${res.status}`);
  const json = (await res.json()) as { Answer?: { type: number; data: string }[] };
  const wanted = type === "TXT" ? 16 : 5;
  // DoH JSON returns TXT data as quoted strings, sometimes split across chunks
  // joined with `" "`. Strip the outer quotes and collapse internal `" "` joins
  // so the caller sees the concatenated record verbatim.
  return (json.Answer ?? [])
    .filter((a) => a.type === wanted)
    .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""));
}

function isLikelyDomain(s: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(s);
}

// ─── SPF ───────────────────────────────────────────────────────────────
async function checkSpf(domain: string): Promise<LayerResult> {
  let records: string[];
  try {
    records = await dohTxt(domain);
  } catch (e) {
    return fail(`Lookup failed: ${(e as Error).message}`);
  }
  const spfRecords = records.filter((r) => /^v=spf1\b/i.test(r));
  if (spfRecords.length === 0) {
    return {
      status: "fail",
      summary: "No SPF record found at the apex.",
      findings: [{ level: "fail", message: "No `v=spf1` TXT record. Receivers cannot verify the sending IP." }],
    };
  }
  if (spfRecords.length > 1) {
    return {
      status: "fail",
      summary: "Multiple SPF records — receivers will reject the policy.",
      raw: spfRecords.join("\n"),
      findings: [{ level: "fail", message: `RFC 7208 forbids multiple SPF records. Found ${spfRecords.length}. Merge them into one.` }],
    };
  }
  const rec = spfRecords[0];
  const findings: Finding[] = [];

  // qualifier check
  const tail = rec.match(/([+\-~?])all\b/i);
  if (!tail) {
    findings.push({ level: "warn", message: "Record does not end with an `all` qualifier — undefined enforcement." });
  } else {
    const q = tail[1];
    if (q === "+") findings.push({ level: "fail", message: "`+all` allows anyone to send as you. This is broken." });
    else if (q === "?") findings.push({ level: "warn", message: "`?all` is neutral — receivers will not enforce. Use `~all` or `-all`." });
    else if (q === "~") findings.push({ level: "info", message: "`~all` is soft fail. Fine for rollout; consider `-all` once confident." });
    else findings.push({ level: "ok", message: "`-all` is hard fail — strictest enforcement, recommended." });
  }

  // includes
  const includes = [...rec.matchAll(/\binclude:([^\s]+)/gi)].map((m) => m[1].toLowerCase());
  const recognized = includes
    .map((inc) => ({ inc, esp: ESP_INCLUDES[inc] }))
    .filter((x) => x.esp);
  if (recognized.length) {
    findings.push({
      level: "info",
      message: `Senders identified from includes: ${recognized.map((r) => r.esp).join(", ")}.`,
    });
  }

  // lookup budget — best-effort count (each include + mx + a + exists + redirect = 1)
  const lookupTokens = (rec.match(/\b(include|mx|a|exists|ptr|redirect=)/gi) ?? []).length;
  if (lookupTokens > 10) {
    findings.push({ level: "fail", message: `~${lookupTokens} top-level DNS lookups in SPF — exceeds the 10-lookup limit. Record will be treated as PermError.` });
  } else if (lookupTokens >= 8) {
    findings.push({ level: "warn", message: `${lookupTokens} top-level lookups — close to the 10-lookup limit. Each \`include:\` may add more.` });
  }

  const overall = worst(findings);
  return {
    status: overall,
    summary: overall === "ok"
      ? "SPF is present, strict, and well within the lookup budget."
      : overall === "warn"
      ? "SPF is present but has soft issues — see details."
      : "SPF has a hard problem — see details.",
    raw: rec,
    findings,
  };
}

// ─── DKIM ──────────────────────────────────────────────────────────────
async function checkDkim(domain: string): Promise<LayerResult> {
  // Probe known selectors in parallel; collect any that resolve to a DKIM record.
  const probes = Array.from(new Set(DKIM_SELECTORS)).map(async (sel) => {
    const name = `${sel}._domainkey.${domain}`;
    try {
      const [txt, cname] = await Promise.all([dohTxt(name), dohCname(name)]);
      const dkimTxt = txt.find((r) => /v=DKIM1/i.test(r));
      if (dkimTxt) return { selector: sel, txt: dkimTxt, via: "TXT" as const };
      if (cname.length) return { selector: sel, txt: undefined, via: "CNAME" as const, cnameTarget: cname[0] };
      return null;
    } catch {
      return null;
    }
  });
  const results = (await Promise.all(probes)).filter(Boolean) as Array<{
    selector: string;
    txt?: string;
    via: "TXT" | "CNAME";
    cnameTarget?: string;
  }>;

  if (results.length === 0) {
    return {
      status: "warn",
      summary: "No DKIM record found at common selectors.",
      findings: [{
        level: "warn",
        message: "Tried " + DKIM_SELECTORS.length + " common selectors (Google, M365, SendGrid, SES, Mailgun, Postmark, Mailchimp, …) — none returned a DKIM record. Either DKIM isn't configured, or your ESP uses a custom selector. Check a recent message's `DKIM-Signature` header for the `s=` tag.",
      }],
    };
  }

  const findings: Finding[] = [];
  for (const r of results) {
    if (r.via === "TXT" && r.txt) {
      const p = r.txt.match(/\bp=([A-Za-z0-9+/=]+)/);
      if (!p || !p[1]) {
        findings.push({ level: "fail", message: `\`${r.selector}\`: empty p= — key is revoked.` });
        continue;
      }
      // Estimate RSA key length from base64 character count.
      const len = p[1].length;
      const bits = len >= 380 ? 2048 : len >= 280 ? 1536 : len >= 200 ? 1024 : 512;
      const level: Finding["level"] = bits >= 2048 ? "ok" : bits >= 1024 ? "warn" : "fail";
      findings.push({
        level,
        message: `\`${r.selector}\`: TXT record, RSA ~${bits}-bit${bits < 2048 ? " (consider rotating to 2048-bit)" : ""}.`,
      });
    } else if (r.via === "CNAME") {
      findings.push({ level: "ok", message: `\`${r.selector}\`: delegated via CNAME → \`${r.cnameTarget}\`.` });
    }
  }
  const overall = worst(findings);
  return {
    status: overall,
    summary: `${results.length} DKIM selector${results.length === 1 ? "" : "s"} found.`,
    raw: results.map((r) => `${r.selector}._domainkey ${r.via}${r.txt ? "  " + r.txt.slice(0, 80) + (r.txt.length > 80 ? "…" : "") : "  → " + r.cnameTarget}`).join("\n"),
    findings,
  };
}

// ─── DMARC ─────────────────────────────────────────────────────────────
async function checkDmarc(domain: string): Promise<LayerResult> {
  let records: string[];
  try {
    records = await dohTxt(`_dmarc.${domain}`);
  } catch (e) {
    return fail(`Lookup failed: ${(e as Error).message}`);
  }
  const dmarc = records.find((r) => /^v=DMARC1\b/i.test(r));
  if (!dmarc) {
    return {
      status: "fail",
      summary: "No DMARC record at _dmarc.",
      findings: [{ level: "fail", message: "Without DMARC, even valid SPF and DKIM aren't enforced — and you receive zero spoofing reports." }],
    };
  }

  // Parse tags (case-insensitive)
  const tags: Record<string, string> = {};
  for (const part of dmarc.split(/\s*;\s*/)) {
    const m = part.match(/^([a-z]+)\s*=\s*(.+)$/i);
    if (m) tags[m[1].toLowerCase()] = m[2].trim();
  }
  const findings: Finding[] = [];

  const policy = (tags["p"] ?? "").toLowerCase();
  if (policy === "reject") findings.push({ level: "ok", message: "`p=reject` — strictest enforcement, failing mail is dropped at SMTP." });
  else if (policy === "quarantine") findings.push({ level: "ok", message: "`p=quarantine` — failing mail goes to spam. One step short of `reject`." });
  else if (policy === "none") findings.push({ level: "warn", message: "`p=none` — monitoring only, no enforcement. Move to `quarantine` once aggregate reports are clean." });
  else findings.push({ level: "fail", message: `Missing or unknown policy (\`p=${policy || "?"}\`).` });

  const sp = (tags["sp"] ?? "").toLowerCase();
  if (!sp) findings.push({ level: "info", message: "No `sp=` — subdomains inherit the main policy. Setting `sp=reject` explicitly is cleaner." });
  else if (sp === "reject" || sp === "quarantine") findings.push({ level: "ok", message: `\`sp=${sp}\` — subdomains protected.` });

  const pct = tags["pct"];
  if (pct && pct !== "100" && policy !== "none") {
    findings.push({ level: "warn", message: `\`pct=${pct}\` — only ${pct}% of failing mail is subject to the policy. Ramp to 100 once stable.` });
  }

  const rua = tags["rua"];
  if (!rua) findings.push({ level: "warn", message: "No `rua=` reporting address — you'll be blind to spoofing attempts. Add `mailto:dmarc@<your-domain>` or a service like Postmark / dmarcian." });
  else findings.push({ level: "ok", message: `Aggregate reports go to ${rua.replace(/mailto:/gi, "")}.` });

  const overall = worst(findings);
  return {
    status: overall,
    summary: policy === "reject" || policy === "quarantine"
      ? `DMARC is enforcing (\`p=${policy}\`).`
      : policy === "none"
      ? "DMARC is reporting only — not yet enforcing."
      : "DMARC record is malformed.",
    raw: dmarc,
    findings,
  };
}

// ─── BIMI ──────────────────────────────────────────────────────────────
async function checkBimi(domain: string, dmarcPolicy: string | null): Promise<LayerResult> {
  let records: string[];
  try {
    records = await dohTxt(`default._bimi.${domain}`);
  } catch (e) {
    return fail(`Lookup failed: ${(e as Error).message}`);
  }
  const bimi = records.find((r) => /^v=BIMI1\b/i.test(r));
  if (!bimi) {
    return {
      status: "na",
      summary: "BIMI not configured.",
      findings: [{ level: "info", message: "Optional. BIMI lets you display a brand logo next to your name in Gmail / Yahoo / Apple Mail — but only with `p=quarantine` or `p=reject` DMARC and a VMC certificate." }],
    };
  }

  const tags: Record<string, string> = {};
  for (const part of bimi.split(/\s*;\s*/)) {
    const m = part.match(/^([a-z]+)\s*=\s*(.+)$/i);
    if (m) tags[m[1].toLowerCase()] = m[2].trim();
  }
  const findings: Finding[] = [];
  const l = tags["l"];
  const a = tags["a"];

  if (dmarcPolicy && dmarcPolicy !== "quarantine" && dmarcPolicy !== "reject") {
    findings.push({ level: "fail", message: `BIMI requires DMARC at \`p=quarantine\` or \`p=reject\`. Current DMARC policy is \`${dmarcPolicy || "none"}\` — no mailbox will render the logo.` });
  }

  if (!l) {
    findings.push({ level: "fail", message: "No `l=` URL — BIMI record is incomplete." });
  } else {
    // Try to fetch the SVG and run quick conformance checks.
    try {
      const r = await fetch(l, { method: "GET" });
      if (!r.ok) {
        findings.push({ level: "fail", message: `Logo URL returned HTTP ${r.status}.` });
      } else {
        const ct = r.headers.get("content-type") ?? "";
        if (!/image\/svg\+xml/i.test(ct)) {
          findings.push({ level: "warn", message: `Logo Content-Type is \`${ct}\` — expected \`image/svg+xml\`.` });
        }
        const svg = await r.text();
        const size = new Blob([svg]).size;
        if (size > 32 * 1024) {
          findings.push({ level: "fail", message: `SVG is ${(size / 1024).toFixed(1)} KB — over the 32 KB BIMI limit.` });
        }
        if (!/baseProfile\s*=\s*"tiny-ps"/i.test(svg)) {
          findings.push({ level: "fail", message: "SVG is missing `baseProfile=\"tiny-ps\"` — required for BIMI." });
        }
        if (!/version\s*=\s*"1\.2"/i.test(svg)) {
          findings.push({ level: "warn", message: "SVG `version=\"1.2\"` not declared on root element." });
        }
        const vb = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
        if (!vb) {
          findings.push({ level: "fail", message: "SVG has no `viewBox`." });
        } else {
          const [vx, vy, vw, vh] = vb[1].trim().split(/\s+/).map(Number);
          if (vx !== 0 || vy !== 0 || vw !== vh) {
            findings.push({ level: "fail", message: `\`viewBox\` must be square and start at 0 0 — found \`${vb[1]}\`.` });
          }
        }
        if (!/<title>[^<]+<\/title>/i.test(svg)) {
          findings.push({ level: "warn", message: "SVG has no `<title>` element (required for accessibility + BIMI conformance)." });
        }
        const forbidden = svg.match(/<(script|a\s|foreignObject|image\s|animate|set\s)|xlink:href=|on(click|load|mouseover|error)=|@import/gi);
        if (forbidden) {
          findings.push({ level: "fail", message: `SVG contains forbidden constructs: ${[...new Set(forbidden.map((s) => s.replace(/[<\s=].*/, "").toLowerCase()))].join(", ")}.` });
        }
        if (findings.filter((f) => f.message.startsWith("SVG ") || f.message.includes("viewBox")).every((f) => f.level !== "fail")) {
          findings.push({ level: "ok", message: `SVG conformance OK — ${(size / 1024).toFixed(1)} KB, tiny-ps profile.` });
        }
      }
    } catch (e) {
      findings.push({ level: "warn", message: `Could not fetch the SVG: ${(e as Error).message}` });
    }
  }

  if (!a) {
    findings.push({ level: "warn", message: "No `a=` certificate — Gmail and Yahoo will not render the logo without a VMC/CMC." });
  } else {
    try {
      const r = await fetch(a, { method: "GET" });
      if (!r.ok) {
        findings.push({ level: "fail", message: `Certificate URL returned HTTP ${r.status}.` });
      } else {
        const pem = await r.text();
        const count = (pem.match(/BEGIN CERTIFICATE/g) ?? []).length;
        if (count === 0) {
          findings.push({ level: "fail", message: "Certificate URL did not return a PEM bundle." });
        } else {
          findings.push({ level: "info", message: `Certificate bundle reachable — ${count} cert${count > 1 ? "s" : ""} in chain.` });
          findings.push({ level: "info", message: "Deep VMC validation (EKU `id-kp-bimi`, LogotypeExtension, hash binding, chain verify) requires the backend or the CLI — see the GitHub link in the Sources section." });
        }
      }
    } catch (e) {
      findings.push({ level: "warn", message: `Could not fetch the certificate: ${(e as Error).message}` });
    }
  }

  const overall = worst(findings);
  return {
    status: overall === "ok" || overall === "warn" ? overall : "fail",
    summary: overall === "ok"
      ? "BIMI is configured and the assets pass surface checks."
      : overall === "warn"
      ? "BIMI is configured but has soft issues — see details."
      : "BIMI is configured but the assets have problems — see details.",
    raw: bimi,
    findings,
  };
}

// ─── helpers ──────────────────────────────────────────────────────────
function worst(findings: Finding[]): Status {
  if (findings.some((f) => f.level === "fail")) return "fail";
  if (findings.some((f) => f.level === "warn")) return "warn";
  if (findings.some((f) => f.level === "ok" || f.level === "info")) return "ok";
  return "ok";
}
function fail(msg: string): LayerResult {
  return { status: "fail", summary: msg, findings: [{ level: "fail", message: msg }] };
}

// ─── component ────────────────────────────────────────────────────────
export default function EmailAuthCheck() {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [progress, setProgress] = useState<Record<Layer, Status>>({
    spf: "pending", dkim: "pending", dmarc: "pending", bimi: "pending",
  });

  const run = useCallback(async (rawDomain: string) => {
    const domain = rawDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!domain || !isLikelyDomain(domain)) {
      setError(`"${rawDomain}" doesn't look like a domain (try \`example.com\`).`);
      return;
    }
    setError(null);
    setRunning(true);
    setProgress({ spf: "pending", dkim: "pending", dmarc: "pending", bimi: "pending" });
    setResult({
      domain,
      spf: blank(), dkim: blank(), dmarc: blank(), bimi: blank(),
    });

    // SPF + DKIM + DMARC run in parallel; BIMI runs after because it depends on the DMARC policy.
    const layers = await Promise.all([
      checkSpf(domain).then((r) => { setProgress((p) => ({ ...p, spf: r.status })); setResult((cur) => cur && { ...cur, spf: r }); return r; }),
      checkDmarc(domain).then((r) => { setProgress((p) => ({ ...p, dmarc: r.status })); setResult((cur) => cur && { ...cur, dmarc: r }); return r; }),
      checkDkim(domain).then((r) => { setProgress((p) => ({ ...p, dkim: r.status })); setResult((cur) => cur && { ...cur, dkim: r }); return r; }),
    ]);
    const dmarc = layers[1];
    const dmarcPolicy = dmarc.raw?.match(/\bp\s*=\s*(\w+)/i)?.[1]?.toLowerCase() ?? null;
    const bimi = await checkBimi(domain, dmarcPolicy);
    setProgress((p) => ({ ...p, bimi: bimi.status }));
    setResult((cur) => cur && { ...cur, bimi });
    setRunning(false);
  }, []);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input && !running) run(input);
  }, [input, running, run]);

  const verdict = useMemo<Status>(() => {
    if (!result || running) return "pending";
    const layers: Status[] = [progress.spf, progress.dkim, progress.dmarc, progress.bimi];
    if (layers.some((s) => s === "fail")) return "fail";
    if (layers.some((s) => s === "warn")) return "warn";
    if (layers.every((s) => s === "ok" || s === "na")) return "ok";
    return "pending";
  }, [result, running, progress]);

  return (
    <div className="eac-shell">
      <div className="eac-grid">
        <div className="eac-panel">
          <form className="eac-form" onSubmit={onSubmit}>
            <label htmlFor="eac-domain" className="eac-label">Domain to audit</label>
            <div className="eac-input-row">
              <input
                id="eac-domain"
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="example.com"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={running}
                aria-invalid={!!error}
              />
              <button type="submit" disabled={!input || running} className="eac-submit">
                {running ? <Spinner /> : "Audit"}
              </button>
            </div>
            <div className="eac-presets">
              <span className="eac-presets-label">Try:</span>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="eac-preset"
                  disabled={running}
                  onClick={() => { setInput(p); run(p); }}
                >
                  {p}
                </button>
              ))}
            </div>
            {error && <div className="eac-error">{error}</div>}
          </form>

          <div className="eac-verdict">
            <div className="eac-verdict-head">Verdict</div>
            <div className={`eac-verdict-badge eac-status-${verdict}`}>
              {verdict === "pending" ? (result ? "Auditing…" : "Awaiting domain") :
               verdict === "ok" ? "Healthy" :
               verdict === "warn" ? "Soft issues" :
               verdict === "fail" ? "Hard problems" : "—"}
            </div>
            {result && (
              <ul className="eac-summary-list">
                {(["spf", "dkim", "dmarc", "bimi"] as Layer[]).map((k) => (
                  <li key={k}>
                    <span className={`eac-dot eac-status-${progress[k]}`} />
                    <span className="eac-summary-key">{k.toUpperCase()}</span>
                    <span className="eac-summary-val">
                      {progress[k] === "pending" ? <em>checking…</em> : result[k].summary}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="eac-foot">
            <div className="eac-foot-title">How this works</div>
            <p>
              Every lookup runs <strong>directly from your browser</strong> against Cloudflare's
              public DNS-over-HTTPS endpoint. We don't store the domain, we don't log the result.
              Deep VMC certificate validation (EKU, LogotypeExtension, hash binding) requires our
              CLI / backend — linked below in <em>Sources</em>.
            </p>
          </div>
        </div>

        <div className="eac-results">
          {!result ? (
            <Placeholder />
          ) : (
            <>
              <LayerCard layer="spf" title="SPF" subtitle="Sender Policy Framework" result={result.spf} pending={progress.spf === "pending"} />
              <LayerCard layer="dkim" title="DKIM" subtitle="DomainKeys Identified Mail" result={result.dkim} pending={progress.dkim === "pending"} />
              <LayerCard layer="dmarc" title="DMARC" subtitle="Domain-based Message Authentication" result={result.dmarc} pending={progress.dmarc === "pending"} />
              <LayerCard layer="bimi" title="BIMI" subtitle="Brand Indicators for Message Identification" result={result.bimi} pending={progress.bimi === "pending"} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LayerCard({ layer, title, subtitle, result, pending }: {
  layer: Layer; title: string; subtitle: string; result: LayerResult; pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const status = pending ? "pending" : result.status;
  const badgeText =
    status === "pending" ? "Checking" :
    status === "ok" ? "OK" :
    status === "warn" ? "Warn" :
    status === "fail" ? "Fail" :
    status === "na" ? "n/a" : "—";
  return (
    <article className={`eac-layer eac-layer-${layer}`}>
      <header className="eac-layer-head" onClick={() => !pending && setOpen((o) => !o)} role="button" aria-expanded={open}>
        <div className="eac-layer-id">
          <span className="eac-layer-title">{title}</span>
          <span className="eac-layer-sub">{subtitle}</span>
        </div>
        <span className={`eac-badge eac-status-${status}`}>{badgeText}</span>
      </header>
      <div className="eac-layer-summary">{pending ? <em>Running checks…</em> : result.summary}</div>
      {!pending && result.findings.length > 0 && (
        <>
          <button
            type="button"
            className="eac-layer-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "Hide details" : `Show ${result.findings.length} finding${result.findings.length === 1 ? "" : "s"}`}
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
              <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          {open && (
            <div className="eac-layer-detail">
              {result.raw && (
                <pre className="eac-raw">{result.raw}</pre>
              )}
              <ul className="eac-findings">
                {result.findings.map((f, i) => (
                  <li key={i} className={`eac-finding eac-finding-${f.level}`}>
                    <span className="eac-finding-dot" />
                    <span dangerouslySetInnerHTML={{ __html: renderFinding(f.message) }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </article>
  );
}

function Placeholder() {
  return (
    <div className="eac-placeholder">
      <div className="eac-placeholder-grid">
        {(["SPF", "DKIM", "DMARC", "BIMI"] as const).map((t) => (
          <div key={t} className="eac-placeholder-card">
            <span className="eac-placeholder-title">{t}</span>
            <span className="eac-placeholder-dash">—</span>
            <span className="eac-placeholder-hint">awaiting domain</span>
          </div>
        ))}
      </div>
      <p className="eac-placeholder-note">
        Enter a domain or pick one of the presets to start the audit.
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="eac-spinner" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeOpacity="0.25" />
      <path d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function blank(): LayerResult {
  return { status: "pending", summary: "", findings: [] };
}

// Minimal Markdown-ish inline renderer for finding bodies — only backticks → <code>.
function renderFinding(msg: string): string {
  return escapeHtml(msg).replace(/`([^`]+)`/g, '<code>$1</code>');
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}
