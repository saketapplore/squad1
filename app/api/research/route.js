export const maxDuration = 60;

const SYSTEM = `You are an SDR intelligence engine for SquadXP — an IT Staff Augmentation company placing pre-vetted developers, designers, DevOps, and data engineers within 48 hours. Targets: startups (1-50), SMBs (50-500), mid-market (500-2000). USP: 48hr match, top 1% talent, from $25/hr, HIPAA+ISO27001.

Use web search to research the company. Find:
1. Live job postings (title, department, location, job_type, source, apply_url)
2. Funding (round, amount, date, investors)
3. Tech stack (from job posts, GitHub, website)
4. Company overview (size, HQ, industry, description)
5. Recent news (last 6 months)
6. Core pain point + SquadXP opportunity score 1-10

Then write: cold email (subject + max 100 word body), LinkedIn DM (max 45 words), cold call opener.

Return ONLY this JSON, no markdown, no backticks:
{"company_snapshot":{"name":"","website":"","industry":"","size":"","founded":"","hq":"","description":""},"signals":{"hiring":{"score":0,"open_roles_count":0,"hiring_pain":"","tech_stack_needed":[],"live_jobs":[{"title":"","department":"","location":"","job_type":"","source":"","apply_url":""}]},"funding":{"score":0,"latest_round":"","amount":"","date":"","investors":[],"signal":""},"tech_stack":{"score":0,"technologies":[],"relevance_to_squadxp":""},"news":{"score":0,"recent_events":[],"opportunity":""}},"pain_point":"","squadxp_angle":"","opportunity_score":0,"opportunity_reason":"","outreach":{"email_subject":"","email_body":"","linkedin_dm":"","cold_call_opener":""}}`;

export async function POST(req) {
  const { name, url } = await req.json();

  if (!name) return Response.json({ error: "Company name is required" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "API key not configured" }, { status: 500 });

  const prompt = `Research company for SquadXP SDR team:\nCompany: ${name}${url ? "\nWebsite: " + url : ""}\n\nFind live job postings, funding, tech stack, recent news. Return full JSON report.`;

  const messages = [{ role: "user", content: prompt }];
  let finalText = "";

  try {
    for (let t = 0; t < 5; t++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
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
      const toolResults = raw.content
        .filter((b) => b.type === "tool_use")
        .map((b) => ({ type: "tool_result", tool_use_id: b.id, content: "" }));
      messages.push({ role: "user", content: toolResults });
    }

    if (!finalText) throw new Error("No response received");

    const s = finalText.indexOf("{");
    const e = finalText.lastIndexOf("}");
    if (s === -1 || e === -1) throw new Error("Could not parse response — please retry");

    const data = JSON.parse(finalText.slice(s, e + 1));
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
