"use client";
import { useState, useRef } from "react";

const srcColor = (s) => {
  if (!s) return "#555";
  const l = s.toLowerCase();
  if (l.includes("linkedin")) return "#0a66c2";
  if (l.includes("indeed")) return "#2164f3";
  if (l.includes("glassdoor")) return "#0caa41";
  if (l.includes("naukri")) return "#ff7555";
  if (l.includes("wellfound") || l.includes("angel")) return "#fb923c";
  return "#6366f1";
};

const Tag = ({ children, color = "#00ff87" }) => (
  <span style={{
    display: "inline-block", padding: "2px 9px", borderRadius: "4px",
    background: `${color}18`, border: `1px solid ${color}40`, color,
    fontSize: "11px", fontWeight: 600, marginRight: "5px", marginBottom: "5px",
    fontFamily: "monospace",
  }}>{children}</span>
);

const CopyBtn = ({ text }) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600); }}
      style={{
        padding: "5px 13px", background: ok ? "#00ff8720" : "transparent",
        border: `1px solid ${ok ? "#00ff87" : "#2a2a2a"}`, borderRadius: "5px",
        color: ok ? "#00ff87" : "#555", fontSize: "11px", cursor: "pointer", transition: "all 0.2s",
      }}>{ok ? "✓ Copied" : "Copy"}</button>
  );
};

const Bar = ({ score, label }) => {
  const c = score >= 7 ? "#00ff87" : score >= 4 ? "#ffd166" : "#ff6b6b";
  return (
    <div style={{ marginBottom: "11px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
        <span style={{ fontSize: "11px", color: c, fontWeight: 700 }}>{score}/10</span>
      </div>
      <div style={{ height: "3px", background: "#1c1c1c", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score * 10}%`, background: c, borderRadius: "2px", transition: "width 1s ease" }} />
      </div>
    </div>
  );
};

const Ring = ({ score }) => {
  const c = score >= 7 ? "#00ff87" : score >= 4 ? "#ffd166" : "#ff6b6b";
  const r = 30, circ = 2 * Math.PI * r, dash = (score / 10) * circ;
  return (
    <svg width="80" height="80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#1a1a1a" strokeWidth="5" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={c} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 1.2s ease" }} />
      <text x="40" y="45" textAnchor="middle" fill={c}
        style={{ fontSize: "16px", fontWeight: "800", fontFamily: "sans-serif" }}>{score}</text>
    </svg>
  );
};

const Card = ({ children, border = "#181818", style = {} }) => (
  <div style={{ background: "#0d0d0d", border: `1px solid ${border}`, borderRadius: "10px", padding: "20px", ...style }}>
    {children}
  </div>
);

export default function SDRIntel() {
  const [name, setName]     = useState("");
  const [url, setUrl]       = useState("");
  const [loading, setLoad]  = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData]     = useState(null);
  const [err, setErr]       = useState("");
  const [tab, setTab]       = useState("overview");
  const iv = useRef(null);

  const statuses = [
    "🔍 Scraping company profile...",
    "💼 Hunting live jobs on LinkedIn, Indeed, Naukri, Glassdoor...",
    "💰 Checking funding & investor signals...",
    "⚙️  Mapping tech stack...",
    "📰 Pulling recent news & leadership changes...",
    "🧠 Diagnosing pain points...",
    "✍️  Crafting killer outreach messages...",
  ];

  async function research() {
    if (!name.trim()) return;
    setLoad(true); setData(null); setErr(""); setTab("overview");
    let si = 0; setStatus(statuses[0]);
    iv.current = setInterval(() => { si = (si + 1) % statuses.length; setStatus(statuses[si]); }, 2400);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Request failed");
      setData(json);
    } catch (e) {
      setErr(`Error: ${e.message}`);
    } finally {
      clearInterval(iv.current); setLoad(false); setStatus("");
    }
  }

  const reset = () => { setData(null); setName(""); setUrl(""); setErr(""); setTab("overview"); };
  const jobs = data?.signals?.hiring?.live_jobs || [];
  const tabs = ["overview", "signals", "jobs", "outreach"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .fu { animation: fadeUp .4s ease forwards; }
        .pu { animation: pulse 1.8s ease-in-out infinite; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #333; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; font-family: inherit; }
      `}</style>

      {/* HEADER */}
      <div style={{
        borderBottom: "1px solid #141414", padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#0a0a0a", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "28px", height: "28px", background: "#00ff87", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "14px", color: "#0a0a0a", fontWeight: 900 }}>S</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "-0.02em" }}>
            SquadXP <span style={{ color: "#00ff87" }}>SDR Intel</span>
          </span>
        </div>
        <span style={{ fontSize: "10px", color: "#252525", fontFamily: "monospace", letterSpacing: "0.1em" }}>
          SALES INTELLIGENCE ENGINE v2.0
        </span>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 18px 80px" }}>

        {/* HERO */}
        {!data && !loading && (
          <div style={{ textAlign: "center", marginBottom: "44px" }} className="fu">
            <p style={{ fontSize: "10px", color: "#00ff87", letterSpacing: "0.2em", fontFamily: "monospace", marginBottom: "12px", textTransform: "uppercase" }}>
              Kill Generic Outreach Forever
            </p>
            <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "12px" }}>
              Drop a company name.<br />
              <span style={{ color: "#00ff87" }}>Get the killer pitch.</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#3a3a3a", maxWidth: "420px", margin: "0 auto", lineHeight: 1.7 }}>
              Live job scraping · Funding signals · Tech stack · Pain points · Outreach that books meetings.
            </p>
          </div>
        )}

        {/* INPUT */}
        <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: "22px", marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && research()}
              placeholder="Company name (e.g. Razorpay, Digio)"
              style={{ flex: 2, minWidth: "150px", background: "#080808", border: "1px solid #1c1c1c", borderRadius: "8px", padding: "12px 14px", color: "#e8e8e8", fontSize: "13px", fontFamily: "monospace" }} />
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="Website URL (optional)"
              style={{ flex: 2, minWidth: "150px", background: "#080808", border: "1px solid #1c1c1c", borderRadius: "8px", padding: "12px 14px", color: "#e8e8e8", fontSize: "13px", fontFamily: "monospace" }} />
            <button onClick={research} disabled={loading || !name.trim()}
              style={{ padding: "12px 24px", background: loading || !name.trim() ? "#161616" : "#00ff87", border: "none", borderRadius: "8px", color: loading || !name.trim() ? "#333" : "#0a0a0a", fontWeight: 800, fontSize: "14px", whiteSpace: "nowrap", transition: "all 0.2s", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Researching…" : "Research →"}
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }} className="fu">
            <div style={{ width: "36px", height: "36px", border: "2px solid #1a1a1a", borderTop: "2px solid #00ff87", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#3a3a3a", fontSize: "12px", fontFamily: "monospace" }} className="pu">{status}</p>
          </div>
        )}

        {/* ERROR */}
        {err && (
          <div style={{ background: "#150a0a", border: "1px solid #ff6b6b20", borderRadius: "10px", padding: "14px 18px", marginBottom: "18px", color: "#ff6b6b", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{err}</span>
            <button onClick={() => setErr("")} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: "18px", lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>
        )}

        {/* RESULTS */}
        {data && (
          <div className="fu">

            {/* Company card */}
            <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: "24px", marginBottom: "14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "7px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "21px", fontWeight: 800, letterSpacing: "-0.02em" }}>{data.company_snapshot?.name}</h2>
                  <Tag color="#00ff87">{data.company_snapshot?.industry}</Tag>
                </div>
                <p style={{ fontSize: "13px", color: "#3a3a3a", marginBottom: "12px", lineHeight: 1.65 }}>{data.company_snapshot?.description}</p>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {[["👥", data.company_snapshot?.size], ["📍", data.company_snapshot?.hq], ["📅", data.company_snapshot?.founded]]
                    .filter(([, v]) => v).map(([ic, val]) => (
                      <span key={ic} style={{ fontSize: "11px", color: "#2e2e2e", fontFamily: "monospace" }}>{ic} {val}</span>
                    ))}
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <Ring score={data.opportunity_score || 0} />
                <p style={{ fontSize: "9px", color: "#2a2a2a", marginTop: "4px", fontFamily: "monospace", letterSpacing: "0.1em" }}>OPP SCORE</p>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: "3px", marginBottom: "14px", background: "#0d0d0d", border: "1px solid #181818", borderRadius: "8px", padding: "3px" }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex: 1, padding: "8px 4px", background: tab === t ? "#1a1a1a" : "transparent", border: "none", borderRadius: "6px", color: tab === t ? "#e8e8e8" : "#333", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.15s" }}>
                  {t}
                  {t === "jobs" && jobs.length > 0 && (
                    <span style={{ marginLeft: "5px", background: "#00ff87", color: "#0a0a0a", fontSize: "9px", fontWeight: 900, borderRadius: "10px", padding: "1px 6px", fontFamily: "monospace" }}>{jobs.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Card border="#ff6b6b20" style={{ gridColumn: "1/-1" }}>
                  <p style={{ fontSize: "9px", color: "#ff6b6b", letterSpacing: "0.16em", fontFamily: "monospace", marginBottom: "8px" }}>🎯 CORE PAIN POINT</p>
                  <p style={{ fontSize: "13px", lineHeight: 1.75, color: "#aaa" }}>{data.pain_point}</p>
                </Card>
                <Card border="#00ff8720" style={{ gridColumn: "1/-1" }}>
                  <p style={{ fontSize: "9px", color: "#00ff87", letterSpacing: "0.16em", fontFamily: "monospace", marginBottom: "8px" }}>⚡ SQUADXP ANGLE</p>
                  <p style={{ fontSize: "13px", lineHeight: 1.75, color: "#aaa" }}>{data.squadxp_angle}</p>
                </Card>
                <Card>
                  <p style={{ fontSize: "9px", color: "#2a2a2a", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "12px" }}>SIGNAL SCORES</p>
                  <Bar score={data.signals?.hiring?.score || 0} label="Hiring Activity" />
                  <Bar score={data.signals?.funding?.score || 0} label="Funding Signals" />
                  <Bar score={data.signals?.tech_stack?.score || 0} label="Tech Relevance" />
                  <Bar score={data.signals?.news?.score || 0} label="News Momentum" />
                </Card>
                <Card>
                  <p style={{ fontSize: "9px", color: "#2a2a2a", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "10px" }}>WHY THIS SCORE</p>
                  <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.75 }}>{data.opportunity_reason}</p>
                </Card>
              </div>
            )}

            {/* SIGNALS */}
            {tab === "signals" && (
              <div style={{ display: "grid", gap: "12px" }}>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700 }}>💼 Hiring Signals</p>
                    <Tag color="#ffd166">{data.signals?.hiring?.open_roles_count || jobs.length} Open Roles</Tag>
                  </div>
                  <p style={{ fontSize: "12px", color: "#444", marginBottom: "12px", lineHeight: 1.65 }}>{data.signals?.hiring?.hiring_pain}</p>
                  {(data.signals?.hiring?.tech_stack_needed || []).length > 0 && <>
                    <p style={{ fontSize: "9px", color: "#222", marginBottom: "6px", fontFamily: "monospace", letterSpacing: "0.1em" }}>SKILLS THEY NEED</p>
                    <div>{(data.signals?.hiring?.tech_stack_needed || []).map(t => <Tag key={t} color="#ffd166">{t}</Tag>)}</div>
                  </>}
                </Card>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700 }}>💰 Funding Signals</p>
                    {data.signals?.funding?.latest_round && <Tag color="#a78bfa">{data.signals.funding.latest_round}</Tag>}
                  </div>
                  {data.signals?.funding?.amount && <p style={{ fontSize: "22px", fontWeight: 800, color: "#a78bfa", marginBottom: "8px" }}>{data.signals.funding.amount}</p>}
                  <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.65, marginBottom: "10px" }}>{data.signals?.funding?.signal}</p>
                  {(data.signals?.funding?.investors || []).length > 0 && <div>{data.signals.funding.investors.map(i => <Tag key={i} color="#a78bfa">{i}</Tag>)}</div>}
                  {data.signals?.funding?.date && <p style={{ fontSize: "10px", color: "#222", marginTop: "8px", fontFamily: "monospace" }}>{data.signals.funding.date}</p>}
                </Card>
                <Card>
                  <p style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>⚙️ Tech Stack</p>
                  <div style={{ marginBottom: "10px" }}>{(data.signals?.tech_stack?.technologies || []).map(t => <Tag key={t} color="#38bdf8">{t}</Tag>)}</div>
                  <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.65 }}>{data.signals?.tech_stack?.relevance_to_squadxp}</p>
                </Card>
                <Card>
                  <p style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>📰 Recent News</p>
                  {(data.signals?.news?.recent_events || []).map((e, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #111", fontSize: "12px", color: "#444", lineHeight: 1.6 }}>
                      <span style={{ color: "#222", marginRight: "8px" }}>→</span>{e}
                    </div>
                  ))}
                  <p style={{ fontSize: "12px", color: "#00ff87", lineHeight: 1.65, marginTop: "10px" }}>{data.signals?.news?.opportunity}</p>
                </Card>
              </div>
            )}

            {/* JOBS */}
            {tab === "jobs" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, marginBottom: "3px" }}>
                      🔎 Live Job Listings
                      <span style={{ marginLeft: "8px", background: "#00ff8715", border: "1px solid #00ff8730", color: "#00ff87", fontSize: "9px", fontWeight: 800, borderRadius: "20px", padding: "2px 8px", fontFamily: "monospace" }}>{jobs.length} found</span>
                    </p>
                    <p style={{ fontSize: "10px", color: "#2a2a2a", fontFamily: "monospace" }}>Scraped from LinkedIn · Indeed · Glassdoor · Naukri · Wellfound · Careers page</p>
                  </div>
                </div>
                {jobs.length === 0 ? (
                  <Card style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ fontSize: "13px", color: "#2a2a2a" }}>No live job postings found.</p>
                    <p style={{ fontSize: "11px", color: "#1e1e1e", marginTop: "5px", fontFamily: "monospace" }}>They may be hiring privately or pausing recruitment.</p>
                  </Card>
                ) : (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {jobs.map((job, i) => (
                      <div key={i} style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "10px", padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", transition: "border-color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#00ff8728"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#181818"}>
                        <div style={{ flex: 1, minWidth: "150px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px", flexWrap: "wrap" }}>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "#ddd" }}>{job.title}</p>
                            {job.job_type && <Tag color="#38bdf8">{job.job_type}</Tag>}
                          </div>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            {job.department && <span style={{ fontSize: "11px", color: "#333", fontFamily: "monospace" }}>🏢 {job.department}</span>}
                            {job.location && <span style={{ fontSize: "11px", color: "#333", fontFamily: "monospace" }}>📍 {job.location}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px", flexShrink: 0 }}>
                          {job.source && (
                            <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "monospace", color: srcColor(job.source), background: `${srcColor(job.source)}15`, border: `1px solid ${srcColor(job.source)}30`, borderRadius: "4px", padding: "2px 8px" }}>{job.source}</span>
                          )}
                          {job.apply_url ? (
                            <a href={job.apply_url} target="_blank" rel="noreferrer"
                              style={{ padding: "7px 14px", background: "#00ff87", color: "#0a0a0a", borderRadius: "6px", fontSize: "11px", fontWeight: 800, fontFamily: "monospace", whiteSpace: "nowrap", display: "inline-block" }}>
                              Apply →
                            </a>
                          ) : (
                            <span style={{ padding: "7px 14px", background: "#141414", color: "#2a2a2a", borderRadius: "6px", fontSize: "11px", fontFamily: "monospace" }}>No link</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {data.signals?.hiring?.hiring_pain && (
                  <div style={{ marginTop: "12px", background: "#0d0d0d", border: "1px solid #ffd16618", borderRadius: "10px", padding: "15px 18px" }}>
                    <p style={{ fontSize: "9px", color: "#ffd166", letterSpacing: "0.14em", fontFamily: "monospace", marginBottom: "6px" }}>SDR ANGLE ON THESE ROLES</p>
                    <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.7 }}>{data.signals.hiring.hiring_pain}</p>
                  </div>
                )}
              </div>
            )}

            {/* OUTREACH */}
            {tab === "outreach" && (
              <div style={{ display: "grid", gap: "12px" }}>
                <Card border="#00ff8715">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700 }}>📧 Cold Email</p>
                    <CopyBtn text={`Subject: ${data.outreach?.email_subject}\n\n${data.outreach?.email_body}`} />
                  </div>
                  <div style={{ background: "#080808", border: "1px solid #141414", borderRadius: "8px", padding: "15px" }}>
                    <p style={{ fontSize: "9px", color: "#2a2a2a", fontFamily: "monospace", marginBottom: "5px", letterSpacing: "0.1em" }}>SUBJECT LINE</p>
                    <p style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "#e0e0e0", lineHeight: 1.4 }}>{data.outreach?.email_subject}</p>
                    <p style={{ fontSize: "9px", color: "#2a2a2a", fontFamily: "monospace", marginBottom: "5px", letterSpacing: "0.1em" }}>BODY</p>
                    <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{data.outreach?.email_body}</p>
                  </div>
                </Card>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700 }}>💼 LinkedIn DM</p>
                    <CopyBtn text={data.outreach?.linkedin_dm} />
                  </div>
                  <div style={{ background: "#080808", border: "1px solid #141414", borderRadius: "8px", padding: "15px" }}>
                    <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.85 }}>{data.outreach?.linkedin_dm}</p>
                  </div>
                </Card>
                <Card border="#ffd16615">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700 }}>📞 Cold Call Opener</p>
                    <CopyBtn text={data.outreach?.cold_call_opener} />
                  </div>
                  <div style={{ background: "#080808", border: "1px solid #141414", borderRadius: "8px", padding: "15px" }}>
                    <p style={{ fontSize: "14px", color: "#ffd166", lineHeight: 1.85, fontStyle: "italic" }}>"{data.outreach?.cold_call_opener}"</p>
                  </div>
                </Card>
                <button onClick={reset}
                  style={{ width: "100%", padding: "13px", background: "transparent", border: "1px solid #181818", borderRadius: "8px", color: "#2a2a2a", fontSize: "12px", transition: "all 0.2s", marginTop: "2px" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#00ff8728"; e.currentTarget.style.color = "#00ff8870"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#181818"; e.currentTarget.style.color = "#2a2a2a"; }}>
                  ← Research Another Company
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
