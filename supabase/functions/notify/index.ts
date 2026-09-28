// Prapti reminders. Supabase runs this every 5 minutes (pg_cron). It reads Chhaya's day and sends
// the push reminders that are due, once each. It also tells Tilak when she sends a suggestion.
// Secrets needed (Edge Functions > Secrets): VAPID_PUBLIC, VAPID_PRIVATE, CRON_KEY.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const HER = "chhayap18@gmail.com", HIM = "tilak@parmrgroup.com";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails("mailto:" + HIM, Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-cron-key", "Access-Control-Allow-Methods": "POST, OPTIONS" };

type Msg = { kind: string; at: number; title: string; body: string };

export function london(d = new Date()) {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" });
  const p: Record<string, string> = {}; f.formatToParts(d).forEach((x) => (p[x.type] = x.value));
  return { date: `${p.year}-${p.month}-${p.day}`, mins: (+p.hour % 24) * 60 + +p.minute, dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) };
}
const toMins = (t: string) => { const [h, m] = String(t || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const clock = (m: number) => { const h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + (mm ? ":" + String(mm).padStart(2, "0") : "") + (h < 12 ? "am" : "pm"); };
function addDays(s: string, n: number) { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
const WD = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Everything she could be reminded of today, with the minute of the day it becomes due.
export function plan(now: { date: string; mins: number; dow: number }, settings: any, rtms: any, day: any, weeklyDone: boolean): Msg[] {
  const on = (k: string) => !(settings?.reminders && settings.reminders[k] === false);
  const hide = settings?.hide || {}, out: Msg[] = [];
  const d = day || {};
  if (on("darshan") && !d.begun) out.push({ kind: "darshan", at: 7 * 60, title: "Jay Swaminarayan", body: "Today's darshan is ready." });
  if (on("start") && !d.begun) out.push({ kind: "start", at: 10 * 60, title: "Prapti", body: "Let's get moving and start the day, open Prapti." });
  if (on("checkin") && !(d.checkins || []).length) out.push({ kind: "checkin", at: 13 * 60, title: "How are you?", body: "Ten seconds to check in." });
  if (on("evening") && d.begun) {
    const mode = d.mode || "steady", done = d.done || {};
    const own = mode === "hard" ? (settings?.minimums || []).map((m: string) => "min-" + String(m).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40))
      : (settings?.tasks || []).filter((t: any) => mode === "good" || (t.when || "normal") !== "good").map((t: any) => t.id);
    const ids = own.concat((d.extras || []).map((e: any) => e.id), d.first ? ["first"] : []);
    const left = ids.filter((id: string) => !done[id]).length, total = ids.length;
    if (total && left) out.push({ kind: "evening", at: 19 * 60 + 30, title: "Today's list", body: left === total ? (mode === "hard" ? "Just one small thing before bed?" : "A few minutes for today's list?") : left === 1 ? "One left. Finish it off." : left + " left on today's list. You've got this." });
  }
  const rt = rtms?.schedule?.[WD[now.dow]];
  if (on("rtms") && !hide.rtms && rt && now.date >= (rtms?.start || "2026-10-19") && !d.noRtms) out.push({ kind: "rtms", at: Math.max(0, toMins(rt) - 60), title: "rTMS today", body: "Session at " + clock(toMins(rt)) + ". Leave with time to spare." });
  if (on("sabha") && now.dow === 6 && settings?.sabhaTime) out.push({ kind: "sabha", at: Math.max(0, toMins(settings.sabhaTime) - 120), title: "Sabha today", body: "Sabha at " + clock(toMins(settings.sabhaTime)) + ". Jay Swaminarayan." });
  if (on("weekly") && now.dow === 0 && !weeklyDone) out.push({ kind: "weekly", at: 18 * 60, title: "Weekly check-in", body: "Nine quick questions, about two minutes." });
  return out;
}

async function sendTo(email: string, payload: any) {
  const { data: subs } = await sb.from("push_subs").select("endpoint, sub").eq("email", email);
  let sent = 0;
  for (const s of subs || []) {
    try { await webpush.sendNotification(s.sub, JSON.stringify(payload), { TTL: 3600 }); sent++; }
    catch (e: any) { if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", s.endpoint); else console.error("push failed", e?.statusCode, e?.body); }
  }
  return sent;
}
async function once(key: string) { const { error } = await sb.from("notif_log").insert({ key }); return !error; } // false if already sent
const doc = async (id: string) => (await sb.from("docs").select("data").eq("id", id).maybeSingle()).data?.data;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const body = await req.json().catch(() => ({}));
  // "Send a test" from the app: signed-in user, sends only to their own phone
  if (body.test) {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
    const { data } = await sb.auth.getUser(jwt);
    const email = data?.user?.email?.toLowerCase();
    if (!email || ![HER, HIM].includes(email)) return new Response("no", { status: 401, headers: CORS });
    const n = await sendTo(email, { title: "Prapti", body: "Reminders are on. Jay Swaminarayan.", url: "./", tag: "test" });
    return new Response(JSON.stringify({ sent: n }), { headers: { ...CORS, "content-type": "application/json" } });
  }
  if (req.headers.get("x-cron-key") !== Deno.env.get("CRON_KEY")) return new Response("no", { status: 401, headers: CORS });

  const now = london(), log: string[] = [];
  const [settings, rtms, day] = await Promise.all([doc("app/settings"), doc("app/rtms"), doc("days/" + now.date)]);
  const wk = addDays(now.date, -((now.dow + 6) % 7));
  const { data: wkRows } = await sb.from("docs").select("id").eq("col", "weekly").gte("id", "weekly/" + wk);
  for (const m of plan(now, settings, rtms, day, !!(wkRows || []).length)) {
    if (now.mins < m.at || now.mins >= m.at + 45) continue;
    if (!(await once(now.date + ":" + m.kind))) continue;
    log.push(m.kind + ":" + (await sendTo(HER, { title: m.title, body: m.body, url: "./", tag: m.kind })));
  }
  // suggestions → Tilak
  const { data: fb } = await sb.from("docs").select("id, data").eq("col", "feedback").gte("updated_at", new Date(Date.now() - 36e5 * 6).toISOString());
  for (const f of fb || []) {
    if (f.data?.done || !(await once("fb:" + f.id))) continue;
    log.push("fb:" + (await sendTo(HIM, { title: f.data?.type === "bug" ? "Chhaya reported a problem" : "New idea from Chhaya", body: String(f.data?.text || "Open Prapti to read it").slice(0, 140), url: "./", tag: "fb" })));
  }
  return new Response(JSON.stringify({ at: now, sent: log }), { headers: { ...CORS, "content-type": "application/json" } });
});
