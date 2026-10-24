// Club Event Radar: the website's code.
// It lists published events from Supabase and sends new announcements to the AI agent.

(function () {
  const config = window.EVENT_RADAR_CONFIG || {};
  const db = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
  const AGENT_URL = config.supabaseUrl + "/functions/v1/submit-event";
  // Flyer photos are shown only when they come from this project's flyers bucket.
  const FLYER_PREFIX = config.supabaseUrl + "/storage/v1/object/public/flyers/";
  const MAX_FLYER_BYTES = 5 * 1024 * 1024;

  // Only the columns the website is allowed to read.
  const PUBLIC_COLUMNS =
    "id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url";

  const RESULT_LABELS = {
    published: "Posted!",
    waiting: "Waiting for a moderator",
    rejected: "Not posted",
    duplicate: "Already posted",
    error: "Something went wrong",
  };

  const form = document.getElementById("post-form");
  const textarea = document.getElementById("announcement");
  const flyerInput = document.getElementById("flyer");
  const postButton = document.getElementById("post-button");
  const resultBox = document.getElementById("result");
  const board = document.getElementById("board");
  const refreshButton = document.getElementById("refresh");
  const chips = document.querySelectorAll(".chip");

  let events = [];
  let filter = "all";

  // ---------- small helpers ----------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // "2026-10-29" -> a Date at local midnight (no time-zone shift).
  function parseDate(value) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // "19:00:00" -> "7:00 PM"
  function formatTime(value) {
    if (!value) return "";
    const [h, m] = value.split(":").map(Number);
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return hour12 + ":" + String(m).padStart(2, "0") + (h < 12 ? " AM" : " PM");
  }

  function whenText(event) {
    const parts = [];
    if (event.event_date) {
      parts.push(parseDate(event.event_date).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric",
      }));
    } else {
      parts.push("Date to be announced");
    }
    if (event.start_time) {
      let time = formatTime(event.start_time);
      if (event.end_time) time += " to " + formatTime(event.end_time);
      parts.push(time);
    }
    return parts.join(" · ");
  }

  // ---------- the event list ----------

  function eventCard(event) {
    const item = el("li", "event");

    if (event.event_date) {
      const date = parseDate(event.event_date);
      const box = el("div", "date");
      box.append(
        el("span", "mon", date.toLocaleDateString("en-US", { month: "short" })),
        el("span", "day", String(date.getDate())),
      );
      item.append(box);
    } else {
      const box = el("div", "date tba");
      box.append(el("span", "day", "TBA"));
      item.append(box);
    }

    const body = el("div", "event-body");
    body.append(el("p", "when", whenText(event)));
    body.append(el("h3", "", event.title || "Untitled event"));

    const place = [event.place_name, event.place_detail].filter(Boolean).join(", ");
    const meta = [event.club, place].filter(Boolean).join(" · ");
    if (meta) body.append(el("p", "meta", meta));
    if (event.summary) body.append(el("p", "summary", event.summary));

    const tags = el("p", "tags");
    if (event.cost) tags.append(el("span", "tag", event.cost));
    if (event.free_food) tags.append(el("span", "tag food", "🍕 Free food"));
    if (tags.childNodes.length) body.append(tags);

    item.append(body);

    if (event.flyer_url && event.flyer_url.startsWith(FLYER_PREFIX)) {
      const img = el("img", "flyer");
      img.src = event.flyer_url;
      img.alt = "Flyer for " + (event.title || "this event");
      img.loading = "lazy";
      item.append(img);
    }

    return item;
  }

  function renderBoard() {
    board.replaceChildren();
    const shown = filter === "food" ? events.filter((e) => e.free_food) : events;
    if (shown.length === 0) {
      board.append(el("li", "empty",
        filter === "food" ? "No free food events right now." : "No events yet. Post the first one!"));
      return;
    }
    for (const event of shown) board.append(eventCard(event));
  }

  async function loadEvents() {
    refreshButton.disabled = true;
    const { data, error } = await db
      .from("events")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });
    refreshButton.disabled = false;

    if (error) {
      board.replaceChildren(el("li", "empty", "Couldn’t load events. Please try Refresh."));
      console.error(error);
      return;
    }
    events = data || [];
    renderBoard();
  }

  // ---------- the agent's answer ----------

  function showResult(kind, message, reasons) {
    resultBox.className = "result " + kind;
    resultBox.replaceChildren(el("p", "result-label", RESULT_LABELS[kind] || RESULT_LABELS.error));
    if (message) resultBox.append(el("p", "", message));
    if (reasons && reasons.length) {
      const list = el("ul", "reasons");
      for (const reason of reasons) list.append(el("li", "", reason));
      resultBox.append(list);
    }
    resultBox.hidden = false;
  }

  async function submitPost(e) {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) {
      showResult("error", "Please paste your announcement first.");
      return;
    }
    const flyer = flyerInput.files[0];
    if (flyer) {
      if (flyer.type !== "image/jpeg" && flyer.type !== "image/png") {
        showResult("error", "Please use a JPG or PNG photo.");
        return;
      }
      if (flyer.size > MAX_FLYER_BYTES) {
        showResult("error", "Please use a photo smaller than 5 MB.");
        return;
      }
    }

    postButton.disabled = true;
    postButton.textContent = "Reading your post…";
    resultBox.hidden = true;

    try {
      const body = new FormData();
      body.append("announcement", text);
      if (flyer) body.append("flyer", flyer);
      const response = await fetch(AGENT_URL, {
        method: "POST",
        headers: { apikey: config.publishableKey },
        body,
      });
      const answer = await response.json().catch(() => ({}));

      if (!answer.ok) {
        showResult("error", answer.message || "The agent didn’t answer. Please try again in a minute.");
      } else {
        showResult(answer.status, answer.message, answer.reasons);
        if (answer.status === "published" || answer.status === "waiting") {
          form.reset();
        }
        if (answer.status === "published") loadEvents();
      }
    } catch (err) {
      console.error(err);
      showResult("error", "Couldn’t reach the agent. Check your internet connection and try again.");
    } finally {
      postButton.disabled = false;
      postButton.textContent = "Post event";
    }
  }

  // ---------- wiring ----------

  form.addEventListener("submit", submitPost);
  refreshButton.addEventListener("click", loadEvents);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filter = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      renderBoard();
    });
  });

  loadEvents();
})();
