// Club Event Radar: the GroupMe reader (Supabase Edge Function "read-channel").
// It reads the new messages in the club's GroupMe group, hands each one to the agent
// (submit-event), and posts the agent's decision back in the group.
// A scheduled job calls it every minute; GroupMe's bot callback can call it too.

import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const SOURCE = "groupme";
const GROUPME_API = "https://api.groupme.com/v3";
const MAX_MESSAGES = 20;
const THREAD_MINUTES = 10;
const THREAD_MAX = 4;
const MAX_CHARS = 2000;
const MAX_REPLY = 990; // GroupMe bot posts are limited to 1000 characters.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
};

type GroupMeMessage = {
  id: string;
  created_at: number;
  sender_id: string;
  sender_type: string;
  name: string;
  text: string | null;
  system?: boolean;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function secretKey(): string {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const parsed = JSON.parse(keys);
      if (parsed?.default) return parsed.default;
    } catch {
      // Fall through to the older key name.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function settings() {
  return {
    token: Deno.env.get("GROUPME_TOKEN") ?? "",
    groupId: Deno.env.get("GROUPME_GROUP_ID") ?? "",
    botId: Deno.env.get("GROUPME_BOT_ID") ?? "",
  };
}

// Read messages from the group. GroupMe answers 304 when there is nothing new.
async function fetchMessages(params: Record<string, string>): Promise<GroupMeMessage[]> {
  const { token, groupId } = settings();
  const query = new URLSearchParams(params);
  const response = await fetch(`${GROUPME_API}/groups/${groupId}/messages?${query}`, {
    headers: { "X-Access-Token": token },
  });
  if (response.status === 304) return [];
  if (!response.ok) throw new Error(`GroupMe answered ${response.status} when reading messages.`);
  const data = await response.json();
  return (data?.response?.messages ?? []) as GroupMeMessage[];
}

function oldestFirst(messages: GroupMeMessage[]): GroupMeMessage[] {
  return [...messages].sort((a, b) => a.created_at - b.created_at || a.id.localeCompare(b.id));
}

function isPerson(message: GroupMeMessage): boolean {
  return message.sender_type !== "bot" && message.sender_type !== "system" && !message.system &&
    (message.text ?? "").trim() !== "";
}

// The same sender's messages from the 10 minutes before this one (at most 4, oldest first).
async function threadFor(message: GroupMeMessage): Promise<string[]> {
  const earlier = await fetchMessages({ before_id: message.id, limit: "20" });
  const since = message.created_at - THREAD_MINUTES * 60;
  return oldestFirst(
    earlier.filter((m) => m.sender_id === message.sender_id && m.created_at >= since && isPerson(m)),
  )
    .slice(-THREAD_MAX)
    .map((m) => (m.text ?? "").trim().slice(0, 500));
}

async function postToGroup(text: string): Promise<void> {
  const { botId } = settings();
  if (!botId) return;
  const response = await fetch(`${GROUPME_API}/bots/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId, text: text.slice(0, MAX_REPLY) }),
  });
  if (!response.ok) console.error(`GroupMe answered ${response.status} when the bot replied.`);
}

function formatWhen(event: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof event.event_date === "string" && event.event_date) {
    const [y, m, d] = event.event_date.split("-").map(Number);
    parts.push(new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
      timeZone: "UTC", weekday: "short", month: "short", day: "numeric",
    }));
  }
  if (typeof event.start_time === "string" && event.start_time) {
    const [h, min] = event.start_time.split(":").map(Number);
    parts.push(`${h % 12 || 12}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`);
  }
  if (typeof event.place_name === "string" && event.place_name) parts.push(event.place_name);
  return parts.join(" · ");
}

// Turn the agent's answer into one short chat reply.
// deno-lint-ignore no-explicit-any
function replyText(answer: any): string {
  if (!answer?.ok) return `Event Radar couldn't read that post: ${answer?.message ?? "please try again in a minute."}`;
  const event = answer.event ?? {};
  const title = event.title ? `“${event.title}”` : "Your event";
  const when = formatWhen(event);
  const reasons: string[] = Array.isArray(answer.reasons) ? answer.reasons : [];
  switch (answer.status) {
    case "published":
      return `✅ ${title} is on Event Radar${when ? `: ${when}` : ""}.`;
    case "waiting":
      return `⏳ ${title} is waiting for a moderator.${reasons.length ? ` ${reasons.join(" ")}` : ""}`;
    case "rejected":
      return `Not posted: ${reasons[0] ?? "this doesn't look like an event."}`;
    case "duplicate":
      return `Already posted: ${answer.message}`;
    default:
      return answer.message ?? "Event Radar read your post.";
  }
}

async function askAgent(message: GroupMeMessage, thread: string[]) {
  const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/submit-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      announcement: (message.text ?? "").trim().slice(0, MAX_CHARS),
      source: SOURCE,
      source_id: message.id,
      source_name: (message.name ?? "").slice(0, 100),
      thread,
    }),
  });
  return await response.json().catch(() => ({ ok: false, message: `the agent answered ${response.status}.` }));
}

// GET ?check=groupme: does GroupMe accept the token, the group, and the bot? Results only, never values.
async function checkGroupMe(): Promise<Response> {
  const { token, groupId, botId } = settings();
  const result = { ok: true, token_set: token !== "", group_set: groupId !== "", bot_set: botId !== "",
    token_works: false, group_works: false, bot_in_group: false, message: "" };
  if (!token || !groupId) {
    result.message = "Add GROUPME_TOKEN and GROUPME_GROUP_ID in Supabase → Edge Functions → Secrets.";
    return json(result);
  }
  const group = await fetch(`${GROUPME_API}/groups/${groupId}`, { headers: { "X-Access-Token": token } });
  result.token_works = group.status !== 401;
  result.group_works = group.ok;
  if (botId && result.token_works) {
    const bots = await fetch(`${GROUPME_API}/bots`, { headers: { "X-Access-Token": token } });
    const list = bots.ok ? ((await bots.json())?.response ?? []) : [];
    // deno-lint-ignore no-explicit-any
    result.bot_in_group = list.some((b: any) => b.bot_id === botId && b.group_id === groupId);
  }
  result.message = !result.token_works
    ? "GroupMe didn't accept the token. Copy it again from dev.groupme.com → Access Token."
    : !result.group_works
    ? "The token works, but GroupMe can't find that group. Check GROUPME_GROUP_ID."
    : botId && !result.bot_in_group
    ? "The token and group work, but that bot isn't in this group. Check GROUPME_BOT_ID."
    : "GroupMe accepts the token and the group." + (botId ? " The bot is in the group." : " No bot is set, so the agent won't reply in the chat.");
  return json(result);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const key = secretKey();
  const db = createClient(Deno.env.get("SUPABASE_URL")!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { token, groupId, botId } = settings();

  try {
    if (req.method === "GET") {
      if (new URL(req.url).searchParams.get("check") === "groupme") return await checkGroupMe();
      const { data: cursor } = await db.from("channel_cursor").select("last_id, read_count").eq("source", SOURCE)
        .maybeSingle();
      return json({
        ok: true,
        ready: token !== "" && groupId !== "" && key !== "",
        last_message_id: cursor?.last_id ?? null,
        read_count: cursor?.read_count ?? 0,
        bot: botId !== "",
      });
    }

    if (req.method !== "POST") return json({ ok: false, message: "Use GET or POST." }, 405);
    // The body is ignored: the reader always reads the group itself, with the token.
    await req.body?.cancel();

    if (!token || !groupId || !key) {
      return json({ ok: false, message: "Add GROUPME_TOKEN and GROUPME_GROUP_ID in Supabase → Edge Functions → Secrets." }, 503);
    }

    const { data: cursor, error: cursorError } = await db
      .from("channel_cursor").select("last_id, read_count").eq("source", SOURCE).maybeSingle();
    if (cursorError) throw cursorError;

    // First run: bookmark the newest message and stop. Old history is never read.
    if (!cursor) {
      const newest = await fetchMessages({ limit: "1" });
      const lastId = newest[0]?.id ?? "0";
      const { error } = await db.from("channel_cursor")
        .upsert({ source: SOURCE, last_id: lastId, read_count: 0, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true, read: 0, message: "Bookmark set. New messages from now on will be read." });
    }

    const messages = oldestFirst(await fetchMessages({ after_id: cursor.last_id, limit: String(MAX_MESSAGES) }));
    let readCount = cursor.read_count;
    const handled: string[] = [];

    for (const message of messages) {
      if (isPerson(message)) {
        const thread = await threadFor(message).catch(() => []);
        const answer = await askAgent(message, thread);
        if (!answer?.already_read) await postToGroup(replyText(answer));
        handled.push(answer?.status ?? "error");
      } else {
        handled.push("skipped");
      }
      // Move the bookmark past every message read, including skipped ones.
      readCount += 1;
      const { error } = await db.from("channel_cursor")
        .update({ last_id: message.id, read_count: readCount, updated_at: new Date().toISOString() })
        .eq("source", SOURCE);
      if (error) throw error;
    }

    return json({ ok: true, read: messages.length, results: handled });
  } catch (error) {
    console.error("read-channel failed:", error);
    return json({ ok: false, message: "The reader couldn't finish. It will try again on the next run." }, 500);
  }
});
