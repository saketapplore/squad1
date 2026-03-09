export const maxDuration = 60;

const SYSTEM = `You are an elite SDR intelligence engine for SquadXP — a premium IT Staff Augmentation company that places pre-vetted developers, designers, DevOps engineers, data scientists, and product leaders within 48 hours.
SquadXP targets: startups (1-50), SMBs (50-500), mid-market (500-2000).
Key differentiators: 48-hr match time, top 1% global talent, pre-vetted via technical assessments, 98% client satisfaction, flexible engagement, from $25/hr, HIPAA and ISO 27001 compliant.

RESEARCH DEEPLY using web search. Cover ALL of these:
1. HIRING SIGNALS — Scrape actual live job postings from LinkedIn, Indeed, Glassdoor, Naukri, Wellfound, and their careers page. For EACH open role found, return: title, department, location, job_type, source platform, and apply_url.
2. FUNDING — Latest round, amount, date, investors, post-funding implications.
3. TECH STACK — Technologies from job posts, GitHub, BuiltWith signals, their website.
4. COMPANY OVERVIEW — Size, HQ, industry, what they build, growth trajectory.
5. RECENT NEWS — Last 6 months: launches, leadership changes, acquisitions, expansions, layoffs.
6. PAIN POINT — Most acute engineering or team-scaling pain right now.
7. SQUADXP OPPORTUNITY SCORE 1-10 plus reason.

Then produce outreach: cold email (subject + body max 120 words referencing specific roles and stack), LinkedIn DM (max 55 words), cold call opener.

Return ONLY valid JSON, no markdown, no backticks, no preamble:
{
  "company_snapshot": { "name":"","website":"","industry":"","size":"","founded":"","hq":"","description":"" },
  "signals": {
    "hiring": {
      "score": 0, "open_roles_count": 0, "hiring_pain": "", "tech_stack_needed": [],
      "live_jobs": [ { "title":"", "department":"", "location":"", "job_type":"", "source":"", "apply_url":"" } ]
    },
    "funding": { "score":0, "latest_round":"","amount":"","date":"","investors":[],"signal":"" },
    "tech_stack": { "score":0, "technologies":[], "relevance_to_squadxp":"" },
    "news": { "score":0, "recent_events":[], "opportunity":"" }
  },
  "pain_point": "", "squadxp_angle": "", "opportunity_score": 0, "opportunity_reason": "",
  "outreach": { "email_subject":"", "email_body":"", "linkedin_dm":"", "cold_call_opener":"" }
}`;

export async function POST(req) {
  const { name, url } = await req.json();

  if (!name) {
    return Response.json({ error: "Company name is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const prompt = `Research this company for SquadXP's SDR team:\nCompany: ${name}\n${url ? "Website: " + url : ""}\n\nSearch for ALL live open job postings across LinkedIn, Indeed, Glassdoor, Naukri, Wellfound, and their careers page. Collect direct apply URLs. Then produce the full JSON intelligence report.`;

  const messages = [{ role: "user", content: prompt }];
  let finalText = "";

  try {
    for (let t = 0; t < 10; t++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages,
        }),
      });

      const raw = await res.json();
      if (!raw.content) throw new Error(raw.error?.message || "API error");

      const txt = raw.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      if (txt) finalText = txt;

      const hasTools = raw.content.some((b) => b.type === "tool_use");
      if (raw.stop_reason === "end_turn" || !hasTools) break;

      messages.push({ role: "assistant", content: raw.content });
      const results = raw.content
        .filter((b) => b.type === "tool_use")
        .map((b) => ({ type: "tool_result", tool_use_id: b.id, content: "" }));
      messages.push({ role: "user", content: results });
    }

    if (!finalText) throw new Error("No response received");

    const s = finalText.indexOf("{");
    const e = finalText.lastIndexOf("}");
    if (s === -1 || e === -1) throw new Error("Could not parse JSON response");

    const data = JSON.parse(finalText.slice(s, e + 1));
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
