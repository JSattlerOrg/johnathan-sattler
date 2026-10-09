/* ==========================================================================
   SattlerOS — shell, apps, gestures and routing
   Content comes from assets/js/content.js (window.SITE).
   ========================================================================== */
(() => {
  "use strict";

  const S = window.SITE || {};
  const root = document.documentElement;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem("jsos:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem("jsos:" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    },
  };
  const session = {
    get(k) { try { return sessionStorage.getItem("jsos:" + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem("jsos:" + k, v); } catch (e) { /* storage unavailable */ } },
  };
  const reducedMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const windowedMQ = matchMedia("(min-width: 768px) and (min-height: 560px)");
  const motionOK = () => !reducedMQ.matches && !root.classList.contains("reduce-motion");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const bootTime = Date.now();
  const OS = S.osName || "SattlerOS";
  const SITE_HOST = location.hostname && location.hostname !== "localhost" ? location.hostname : "johnathansattler.com";

  const syncWindowed = () => root.classList.toggle("windowed", windowedMQ.matches);
  syncWindowed();
  (windowedMQ.addEventListener ? windowedMQ.addEventListener("change", syncWindowed) : windowedMQ.addListener(syncWindowed));

  /* ------------------------------------------------------------------------
     Icons
     ------------------------------------------------------------------------ */
  const svg = (inner, vb = "0 0 24 24") => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${inner}</svg>`;
  const gearTeeth = Array.from({ length: 8 }, (_, i) =>
    `<rect class="solid" x="10.5" y="1.8" width="3" height="4.2" rx="1" transform="rotate(${i * 45} 12 12)"/>`).join("");
  const petals = ["#ff9f0a", "#ffd60a", "#8be04e", "#30d158", "#64d2ff", "#0a84ff", "#bf5af2", "#ff375f"]
    .map((c, i) => `<ellipse cx="12" cy="7.1" rx="2.7" ry="4.6" fill="${c}" stroke="none" opacity=".82" style="mix-blend-mode:multiply" transform="rotate(${i * 45} 12 12)"/>`).join("");

  const ICON = {
    about: svg('<circle cx="12" cy="8.4" r="3.8"/><path d="M4.6 20c1.2-3.8 4.1-5.8 7.4-5.8s6.2 2 7.4 5.8"/>'),
    projects: svg('<path d="M12 3.2c2.9 1.7 4.5 4.9 4.3 9.2l-2.4 3H10.1l-2.4-3C7.5 8.1 9.1 4.9 12 3.2z"/><circle cx="12" cy="9.3" r="1.6"/><path d="M7.8 12.3 5.3 14.8l1.5 3.3 3.2-2.4M16.2 12.3l2.5 2.5-1.5 3.3-3.2-2.4M10.6 18.4 12 21l1.4-2.6"/>'),
    resume: svg('<rect x="3" y="7" width="18" height="13" rx="2.6"/><path d="M8.8 7V5.6c0-.9.7-1.6 1.6-1.6h3.2c.9 0 1.6.7 1.6 1.6V7M3 12.4h18M10.5 12.4v1.4h3v-1.4"/>'),
    notes: svg('<rect x="5" y="3.4" width="14" height="17.2" rx="2.6"/><path d="M8.6 8.4h6.8M8.6 12h6.8M8.6 15.6h4"/>'),
    messages: svg('<path class="solid" d="M12 3.6c5 0 9 3.2 9 7.2S17 18 12 18c-.9 0-1.8-.1-2.6-.3L5 20.3l.9-3.6C4.1 15.4 3 13.2 3 10.8c0-4 4-7.2 9-7.2z"/>'),
    safari: svg('<circle cx="12" cy="12" r="8.7"/><path class="solid" d="m16 8-2.6 5.4L8 16l2.6-5.4z"/><path d="M12 3.3v1.6M12 19.1v1.6M3.3 12h1.6M19.1 12h1.6"/>'),
    mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.6"/><path d="m3.8 7 8.2 6.2L20.2 7"/>'),
    photos: svg(petals),
    calculator: svg('<rect x="5" y="2.8" width="14" height="18.4" rx="3"/><rect x="8" y="5.8" width="8" height="3.4" rx="1"/><path d="M8.6 12.8h.01M12 12.8h.01M15.4 12.8h.01M8.6 16.8h.01M12 16.8h.01M15.4 16.8h.01" stroke-width="2.6"/>'),
    settings: svg(gearTeeth + '<circle cx="12" cy="12" r="6.1"/><circle cx="12" cy="12" r="2.4"/>'),
    terminal: svg('<rect x="3" y="4.6" width="18" height="14.8" rx="3"/><path d="m7.6 9.4 3 2.6-3 2.6M12.6 15h4"/>'),
  };

  const UI = {
    chev: '<svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5 6.5 7l-5 5.5"/></svg>',
    back: '<svg viewBox="0 0 13 22" aria-hidden="true"><path d="M11 2 2 11l9 9"/></svg>',
    send: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    chat: svg('<path d="M12 4.5c4.7 0 8.5 3 8.5 6.7S16.7 18 12 18c-.9 0-1.7-.1-2.5-.3L5 19.8l1-3.4C4.5 15.2 3.5 13.3 3.5 11.2c0-3.7 3.8-6.7 8.5-6.7z"/>'),
    mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.6"/><path d="m3.8 7 8.2 6.2L20.2 7"/>'),
    link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>'),
    grid: svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>'),
    moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    photo: svg('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4"/>'),
    motion: svg('<path d="M4 12h3l2-5 4 10 2-5h5"/>'),
    info: svg('<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.5M12 7.8v.01"/>'),
    power: svg('<path d="M12 3.5v7M7 6.3a7.5 7.5 0 1 0 10 0"/>'),
    reset: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.7h3.7"/>'),
  };

  const avatar = (size) =>
    `<span class="avatar"${size ? ` style="--av:${size}px"` : ""}><span>${esc(S.initials || "")}</span>${
      S.avatar ? `<img src="${esc(S.avatar)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : ""
    }</span>`;
  const iconTile = (app) => `<span class="icon-tile" style="--tile:${app.tile}">${app.icon}</span>`;
  const extLink = (url) => `href="${esc(url)}" target="_blank" rel="noopener noreferrer"`;
  const fmtDate = (iso, opts = { month: "long", day: "numeric", year: "numeric" }) => {
    const d = new Date(iso + (String(iso).length === 10 ? "T12:00:00" : ""));
    return isNaN(d) ? esc(iso) : d.toLocaleDateString(undefined, opts);
  };
  const links = () => (S.links || []).filter((l) => l.url);
  const mailto = (subject, body) =>
    `mailto:${S.email}?subject=${encodeURIComponent(subject || "")}${body ? "&body=" + encodeURIComponent(body) : ""}`;

  /* ------------------------------------------------------------------------
     Apps
     Each app: { id, name, icon, tile, chrome?, views: { root(data, api) -> view } }
     A view: { title, html, mount?(el, api), large?: bool, nav?: "none"|"solid", right?, dark? }
     ------------------------------------------------------------------------ */
  const APPS = {};
  const defineApp = (app) => (APPS[app.id] = app);

  /* About ------------------------------------------------------------------ */
  defineApp({
    id: "about",
    name: "About",
    tile: "linear-gradient(160deg,#ffb340,#ff5e3a)",
    icon: ICON.about,
    keywords: "me profile bio contact who",
    views: {
      root: () => {
        const facts = [
          S.location && { label: "Location", value: S.location },
          ...(S.facts || []),
        ].filter((f) => f && f.value);
        const firstLink = links()[0];
        return {
          title: "About",
          large: false,
          html: `
            <div class="profile-head">
              ${avatar()}
              <h2 class="profile-name">${esc(S.name)}</h2>
              <div class="profile-headline">${esc(S.headline)}</div>
            </div>
            <div class="actions">
              <button class="action" data-open="messages">${UI.chat}message</button>
              <button class="action" data-open="mail">${UI.mail}mail</button>
              <button class="action" data-open="projects">${UI.grid}projects</button>
              <a class="action" ${firstLink ? extLink(firstLink.url) : 'aria-disabled="true"'}>${UI.link}${esc(firstLink ? firstLink.label.toLowerCase() : "links")}</a>
            </div>
            <div class="card">${(S.about || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
            ${facts.length ? `<div class="list">${facts.map((f) =>
              f.url
                ? `<a class="row fact" ${extLink(f.url)}><div class="row-main"><div class="fact-label">${esc(f.label)}</div><div class="fact-value">${esc(f.value)}</div></div></a>`
                : `<div class="row fact"><div class="row-main"><div class="fact-label">${esc(f.label)}</div><div class="fact-value">${esc(f.value)}</div></div></div>`
            ).join("")}</div>` : ""}
            <div class="list">
              <button class="row" data-open="resume"><span class="row-main" style="color:var(--accent)">View Résumé</span></button>
              <button class="row" data-open="notes"><span class="row-main" style="color:var(--accent)">Read Notes</span></button>
            </div>`,
        };
      },
    },
  });

  /* Projects --------------------------------------------------------------- */
  defineApp({
    id: "projects",
    name: "Projects",
    tile: "linear-gradient(160deg,#c86dff,#5e5ce6)",
    icon: ICON.projects,
    keywords: "work portfolio apps code",
    views: {
      root: () => {
        const list = S.projects || [];
        const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
        return {
          title: "Projects",
          html: `
            <p class="today-date" style="margin-top:-10px;margin-bottom:14px">${esc(today)}</p>
            ${list.length ? `<div class="today-grid">${list.map((p) => {
              const [c1, c2] = p.colors || ["#5e5ce6", "#bf5af2"];
              const tag = p.url ? "a" : "div";
              return `<${tag} class="today-card" style="--c1:${esc(c1)};--c2:${esc(c2)}" ${p.url ? extLink(p.url) : ""}>
                <div class="today-head">
                  <div class="today-eyebrow">${esc(p.eyebrow || "Project")}</div>
                  <h3 class="today-title">${esc(p.name)}</h3>
                </div>
                <div class="today-tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}${
                  p.emoji ? `<span class="today-emoji" aria-hidden="true">${esc(p.emoji)}</span>` : ""}</div>
                <div class="today-foot">
                  <div class="today-desc">${esc(p.description)}</div>
                  <span class="get ${p.url ? "" : "soon"}">${p.url ? "VIEW" : "SOON"}</span>
                </div>
              </${tag}>`;
            }).join("")}</div>` : `<div class="empty"><div class="big">🛠️</div>Projects are on the way.</div>`}`,
        };
      },
    },
  });

  /* Résumé ----------------------------------------------------------------- */
  defineApp({
    id: "resume",
    name: "Résumé",
    tile: "linear-gradient(160deg,#3a3a3c,#0c0c0e)",
    icon: ICON.resume,
    keywords: "resume cv experience work history jobs education skills",
    views: {
      root: () => {
        const xp = S.experience || [];
        const skills = S.skills || [];
        return {
          title: "Résumé",
          html: `
            ${xp.length ? `<div class="passes">${xp.map((x) => `
              <article class="pass" style="--c:${esc(x.color || "#0a84ff")}">
                <div class="pass-top"><span class="pass-org">${esc(x.org)}</span><span class="pass-period">${esc(x.period)}</span></div>
                <h3 class="pass-role">${esc(x.role)}</h3>
                ${x.summary ? `<p class="pass-summary">${esc(x.summary)}</p>` : ""}
              </article>`).join("")}</div>` : `<div class="empty"><div class="big">💼</div>Résumé coming soon.</div>`}
            ${skills.length ? `<div class="list-header">Skills</div><div class="chips">${skills.map((s) => `<span class="chip-s">${esc(s)}</span>`).join("")}</div>` : ""}
            ${S.resumeUrl ? `<a class="btn block" ${extLink(S.resumeUrl)}>Download Résumé</a>` : ""}`,
        };
      },
    },
  });

  /* Notes ------------------------------------------------------------------ */
  const notes = () => (S.notes || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  defineApp({
    id: "notes",
    name: "Notes",
    tile: "linear-gradient(160deg,#ffe066,#ffb800)",
    icon: ICON.notes,
    keywords: "blog writing posts thoughts",
    route: (arg) => (notes()[+arg] ? { name: "note", data: +arg } : null),
    views: {
      root: () => {
        const list = notes();
        return {
          title: "Notes",
          html: list.length
            ? `<div class="list">${list.map((n, i) => `
                <button class="row note-row" data-push="note" data-arg="${i}">
                  <div class="row-main">
                    <div class="row-title">${esc(n.title)}</div>
                    <div class="row-sub">${fmtDate(n.date, { month: "numeric", day: "numeric", year: "2-digit" })}&nbsp;&nbsp;${esc(String(n.body || "").split("\n")[0])}</div>
                  </div>${UI.chev}
                </button>`).join("")}</div>
               <p class="list-footer" style="margin-top:-16px;text-align:center">${list.length} Note${list.length === 1 ? "" : "s"}</p>`
            : `<div class="empty"><div class="big">📝</div>No notes yet.</div>`,
        };
      },
      note: (i) => {
        const n = notes()[i];
        if (!n) return { title: "Notes", html: "" };
        return {
          title: n.title,
          large: false,
          sub: String(i),
          html: `<article class="note-detail">
              <p class="note-date">${fmtDate(n.date)}</p>
              <h2>${esc(n.title)}</h2>
              ${String(n.body || "").split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")}
            </article>`,
        };
      },
    },
  });

  /* Photos ----------------------------------------------------------------- */
  const photoTile = (p, i, big) => {
    const [c1, c2] = p.colors || ["#5e5ce6", "#bf5af2"];
    const inner = p.src ? `<img src="${esc(p.src)}" alt="${esc(p.caption || "")}" loading="lazy">` : `<span aria-hidden="true">${esc(p.emoji || "📷")}</span>`;
    return big
      ? `<div class="photo" style="--c1:${esc(c1)};--c2:${esc(c2)}" role="img" aria-label="${esc(p.caption || "Photo")}">${inner}</div>`
      : `<button class="photo" style="--c1:${esc(c1)};--c2:${esc(c2)}" data-push="photo" data-arg="${i}" aria-label="${esc(p.caption || "Photo " + (i + 1))}">${inner}</button>`;
  };
  defineApp({
    id: "photos",
    name: "Photos",
    tile: "#ffffff",
    icon: ICON.photos,
    keywords: "pictures gallery images camera",
    route: (arg) => ((S.photos || [])[+arg] ? { name: "photo", data: +arg } : null),
    views: {
      root: () => {
        const ps = S.photos || [];
        return {
          title: "Library",
          html: `<div class="photo-grid">${ps.map((p, i) => photoTile(p, i)).join("")}</div>
                 <p class="photo-count">${ps.length} Photo${ps.length === 1 ? "" : "s"}</p>`,
        };
      },
      photo: (i) => {
        const p = (S.photos || [])[i] || {};
        return {
          title: p.caption || "Photo",
          large: false,
          dark: true,
          sub: String(i),
          bare: true,
          html: `<div class="viewer">${photoTile(p, i, true)}<div class="viewer-caption">${esc(p.caption || "")}</div></div>`,
        };
      },
    },
  });

  /* Messages --------------------------------------------------------------- */
  let messagesPlayed = session.get("messagesPlayed") === "1";
  defineApp({
    id: "messages",
    name: "Messages",
    tile: "linear-gradient(160deg,#6cf38a,#0fbf3e)",
    icon: ICON.messages,
    keywords: "chat contact text say hi hello",
    views: {
      root: () => ({
        title: S.firstName || S.name,
        large: false,
        html: `
          <div class="chat-head">${avatar()}<div class="chat-head-name">${esc(S.firstName || S.name)} <svg viewBox="0 0 6 10"><path d="m1 1 4 4-4 4"/></svg></div></div>
          <div class="chat" id="chat" aria-live="polite">
            <p class="chat-stamp"><b>iMessage</b><br>Today ${new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p>
          </div>`,
        after: `
          <form class="compose" id="compose" autocomplete="off">
            <label class="compose-field">
              <span class="visually-hidden">Message</span>
              <input id="composeInput" type="text" placeholder="iMessage" enterkeyhint="send" maxlength="1000">
              <button class="send" type="submit" aria-label="Send" disabled>${UI.send}</button>
            </label>
          </form>`,
        mount(el) {
          const chat = $("#chat", el);
          const scroller = $(".scroll", el);
          const input = $("#composeInput", el);
          const sendBtn = $(".send", el);
          const msgs = S.messages || [];
          const scrollDown = () => scroller.scrollTo({ top: scroller.scrollHeight, behavior: motionOK() ? "smooth" : "auto" });
          const add = (text, who, isHTML) => {
            const prevTail = chat.lastElementChild;
            if (prevTail && prevTail.classList.contains(who)) prevTail.classList.remove("tail");
            const b = document.createElement("div");
            b.className = `bubble ${who} tail`;
            if (isHTML) b.innerHTML = text; else b.textContent = text;
            chat.appendChild(b);
            scrollDown();
            return b;
          };
          const typeThen = async (text, isHTML) => {
            const t = document.createElement("div");
            t.className = "bubble in typing";
            t.innerHTML = "<i></i><i></i><i></i>";
            chat.appendChild(t);
            scrollDown();
            await wait(motionOK() ? 650 + Math.min(String(text).length * 12, 900) : 0);
            t.remove();
            if (el.isConnected) add(text, "in", isHTML);
          };
          (async () => {
            if (messagesPlayed) { msgs.forEach((m) => add(m, "in")); return; }
            messagesPlayed = true;
            session.set("messagesPlayed", "1");
            await wait(motionOK() ? 450 : 0);
            for (const m of msgs) { if (!el.isConnected) return; await typeThen(m); }
          })();
          input.addEventListener("input", () => (sendBtn.disabled = !input.value.trim()));
          $("#compose", el).addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            input.value = "";
            sendBtn.disabled = true;
            add(text, "out");
            const d = document.createElement("div");
            d.className = "delivered";
            d.textContent = "Delivered";
            chat.appendChild(d);
            if (S.email) {
              await typeThen("Thanks! Opening your mail app so this lands in my inbox ✉️");
              await wait(500);
              location.href = mailto(`Hello from ${SITE_HOST}`, text);
            } else {
              const l = links()[0];
              await typeThen(l
                ? `Thanks for the message! The best way to reach me right now is <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" style="color:inherit;font-weight:600">${esc(l.label)}</a>.`
                : "Thanks for the message! 🙌", true);
            }
          });
        },
      }),
    },
  });

  /* Mail ------------------------------------------------------------------- */
  defineApp({
    id: "mail",
    name: "Mail",
    tile: "linear-gradient(160deg,#5ac8fa,#1a6dff)",
    icon: ICON.mail,
    keywords: "email contact inbox write",
    views: {
      root: () => {
        if (!S.email) {
          return {
            title: "Mail",
            html: `<div class="empty"><div class="big">📭</div><p>No public inbox yet.</p><p>Say hi in Messages, or find me here:</p></div>
              ${links().length ? `<div class="list">${links().map((l) => `<a class="row" ${extLink(l.url)}><span class="row-main" style="color:var(--accent)">${esc(l.label)}</span>${UI.chev}</a>`).join("")}</div>` : ""}`,
          };
        }
        return {
          title: "New Message",
          large: false,
          nav: "solid",
          right: `<button class="nav-btn" type="submit" form="mailForm" style="font-weight:600">Send</button>`,
          html: `
            <form class="mail" id="mailForm">
              <div class="mail-row"><span>To:</span><span class="mail-to">${esc(S.name)}</span></div>
              <label class="mail-row"><span>Subject:</span><input name="subject" type="text" value="Hello!" maxlength="200"></label>
              <textarea name="body" aria-label="Message" placeholder="Write something nice…" rows="10"></textarea>
            </form>`,
          mount(el) {
            $("#mailForm", el).addEventListener("submit", (e) => {
              e.preventDefault();
              const f = e.currentTarget;
              location.href = mailto(f.subject.value, f.body.value);
            });
          },
        };
      },
    },
  });

  /* Safari ----------------------------------------------------------------- */
  defineApp({
    id: "safari",
    name: "Safari",
    tile: "linear-gradient(160deg,#6be3ff,#0a7cff)",
    icon: ICON.safari,
    keywords: "links social web github linkedin browser",
    views: {
      root: () => ({
        title: "Favorites",
        large: false,
        html: `
          <div class="address" style="margin-top:6px">${svg('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>')}${esc(SITE_HOST)}</div>
          <div class="list-header" style="text-transform:none;font-size:20px;font-weight:700;color:var(--text);margin-left:20px">Favorites</div>
          <div class="favs" style="margin-top:12px">${links().map((l) => `
            <a class="fav" ${extLink(l.url)}><span class="fav-tile" style="--c:${esc(l.color || "#8e8e93")}">${esc(l.glyph || l.label[0])}</span>${esc(l.label)}</a>`).join("")}
          </div>
          <div class="list-header" style="text-transform:none;font-size:20px;font-weight:700;color:var(--text);margin-left:20px">Reading List</div>
          <div class="list" style="margin-top:10px">${notes().map((n, i) => `
            <button class="row" data-open="notes" data-arg="${i}"><div class="row-main"><div class="row-title">${esc(n.title)}</div><div class="row-sub">${esc(SITE_HOST)}</div></div>${UI.chev}</button>`).join("")}
          </div>`,
      }),
    },
  });

  /* Settings --------------------------------------------------------------- */
  const WALLPAPERS = ["aurora", "sunset", "ocean", "meadow", "graphite"];
  const prefs = {
    theme: root.dataset.theme || "auto",
    wallpaper: root.dataset.wallpaper || "aurora",
    reduceMotion: root.classList.contains("reduce-motion"),
  };
  const setTheme = (t) => {
    if (!["light", "dark", "auto"].includes(t)) return false;
    prefs.theme = root.dataset.theme = t;
    store.set("theme", t);
    return true;
  };
  const setWallpaper = (w) => {
    if (!WALLPAPERS.includes(w)) return false;
    prefs.wallpaper = root.dataset.wallpaper = w;
    store.set("wallpaper", w);
    return true;
  };
  const setReduceMotion = (on) => {
    prefs.reduceMotion = on;
    root.classList.toggle("reduce-motion", on);
    store.set("reduceMotion", on);
  };
  const sq = (c, icon) => `<span class="sq" style="--c:${c}">${icon}</span>`;

  defineApp({
    id: "settings",
    name: "Settings",
    tile: "linear-gradient(160deg,#b4b4ba,#6b6b70)",
    icon: ICON.settings,
    keywords: "preferences theme dark mode light wallpaper appearance motion",
    views: {
      root: () => ({
        title: "Settings",
        html: `
          <div class="list">
            <button class="row settings-profile" data-open="about">${avatar()}<div class="row-main"><div class="row-title">${esc(S.name)}</div><div class="row-sub">${esc(OS)} ID, Profile &amp; Links</div></div>${UI.chev}</button>
          </div>
          <div class="list">
            <div class="row has-icon">${sq("#5e5ce6", UI.moon)}<span class="row-main">Appearance</span>
              <div class="seg" role="group" aria-label="Appearance">${["light", "dark", "auto"].map((t) =>
                `<button type="button" data-theme-set="${t}" aria-pressed="${prefs.theme === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}
              </div>
            </div>
            <label class="row has-icon">${sq("#0a84ff", UI.motion)}<span class="row-main">Reduce Motion</span>
              <input class="switch" type="checkbox" id="rmSwitch" ${prefs.reduceMotion ? "checked" : ""}>
            </label>
          </div>
          <div class="list-header">Wallpaper</div>
          <div class="list">
            <div class="walls" role="group" aria-label="Wallpaper">${WALLPAPERS.map((w) =>
              `<button type="button" class="wall" data-wallpaper="${w}" data-wall-set="${w}" aria-pressed="${prefs.wallpaper === w}" aria-label="${w} wallpaper" title="${w[0].toUpperCase() + w.slice(1)}"></button>`).join("")}
            </div>
          </div>
          <div class="list">
            <button class="row has-icon" data-push="device">${sq("#8e8e93", UI.info)}<span class="row-main">About This Site</span>${UI.chev}</button>
            <button class="row has-icon" data-action="lock">${sq("#ff3b30", UI.power)}<span class="row-main">Lock Screen</span>${UI.chev}</button>
            <button class="row has-icon" data-action="reset">${sq("#ff9500", UI.reset)}<span class="row-main">Reset Preferences</span>${UI.chev}</button>
          </div>`,
        mount(el, api) {
          const sync = () => {
            $$("[data-theme-set]", el).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeSet === prefs.theme)));
            $$("[data-wall-set]", el).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.wallSet === prefs.wallpaper)));
            $("#rmSwitch", el).checked = prefs.reduceMotion;
          };
          el.addEventListener("click", (e) => {
            const t = e.target.closest("[data-theme-set]");
            const w = e.target.closest("[data-wall-set]");
            const a = e.target.closest("[data-action]");
            if (t) setTheme(t.dataset.themeSet);
            if (w) setWallpaper(w.dataset.wallSet);
            if (a && a.dataset.action === "lock") api.close().then(showLock);
            if (a && a.dataset.action === "reset") { setTheme("auto"); setWallpaper("aurora"); setReduceMotion(false); }
            sync();
          });
          $("#rmSwitch", el).addEventListener("change", (e) => setReduceMotion(e.target.checked));
        },
      }),
      device: () => ({
        title: "About This Site",
        large: false,
        html: `
          <div class="list" style="margin-top:8px">${[
            ["Name", OS],
            ["Owner", S.name],
            ["Software Version", "1.0"],
            ["Model", SITE_HOST],
            ["Built With", "HTML · CSS · JavaScript"],
            ["Hosting", "GitHub Pages"],
            ["Apps", Object.keys(APPS).length],
          ].map(([k, v]) => `<div class="row"><span class="row-main">${esc(k)}</span><span class="row-value">${esc(v)}</span></div>`).join("")}
          </div>
          <div class="list">
            <a class="row" ${extLink("https://github.com/jsattlerorg/johnathan-sattler")}><span class="row-main" style="color:var(--accent)">View Source on GitHub</span>${UI.chev}</a>
          </div>
          <p class="list-footer" style="margin-top:-12px">Tip: every app has its own link, e.g. ${esc(SITE_HOST)}/#/projects</p>`,
      }),
    },
  });

  /* Calculator ------------------------------------------------------------- */
  defineApp({
    id: "calculator",
    name: "Calculator",
    tile: "linear-gradient(160deg,#ffae33 0%,#ff9500 34%,#3a3a3c 35%,#1c1c1e)",
    icon: ICON.calculator,
    chrome: "dark",
    keywords: "math numbers",
    views: {
      root: () => ({
        title: "Calculator",
        nav: "none",
        html: `<div class="calc">
            <div class="calc-display" id="calcDisplay" aria-live="polite">0</div>
            <div class="calc-keys">${[
              ["AC", "fn"], ["±", "fn"], ["%", "fn"], ["÷", "op"],
              ["7"], ["8"], ["9"], ["×", "op"],
              ["4"], ["5"], ["6"], ["−", "op"],
              ["1"], ["2"], ["3"], ["+", "op"],
              ["0", "zero"], ["."], ["=", "op"],
            ].map(([k, c]) => `<button type="button" class="key ${c || ""}" data-k="${k}">${k}</button>`).join("")}</div>
          </div>`,
        mount(el, api) {
          const disp = $("#calcDisplay", el);
          const acKey = $('[data-k="AC"]', el);
          let cur = "0", acc = null, op = null, waiting = false;
          const compute = (a, b, o) => (o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : b === 0 ? NaN : a / b);
          const fmt = (n) => {
            if (!isFinite(n)) return "Error";
            let s = String(parseFloat(n.toPrecision(9)));
            if (s.replace(/[-.]/g, "").length > 9) s = n.toExponential(3);
            return s;
          };
          const pretty = (s) => {
            if (s === "Error" || /e/.test(s)) return s;
            const [i, d] = s.split(".");
            const neg = i.startsWith("-");
            const int = Number(neg ? i.slice(1) : i).toLocaleString("en-US");
            return (neg ? "-" : "") + int + (d !== undefined ? "." + d : "");
          };
          const render = () => {
            const txt = pretty(cur);
            disp.textContent = txt;
            disp.style.fontSize = txt.length > 9 ? `${Math.max(0.5, 9 / txt.length)}em` : "";
            acKey.textContent = cur !== "0" && !waiting ? "C" : "AC";
            $$(".key.op", el).forEach((k) => k.classList.toggle("active", waiting && k.dataset.k === op));
          };
          const press = (k) => {
            if (cur === "Error" && k !== "AC") { cur = "0"; acc = null; op = null; }
            if (/^\d$/.test(k)) {
              if (waiting || cur === "0") { cur = k; waiting = false; }
              else if (cur.replace(/[-.]/g, "").length < 9) cur += k;
            } else if (k === ".") {
              if (waiting) { cur = "0."; waiting = false; } else if (!cur.includes(".")) cur += ".";
            } else if (k === "AC") {
              if (acKey.textContent === "C") cur = "0"; else { cur = "0"; acc = null; op = null; waiting = false; }
            } else if (k === "±") {
              cur = cur.startsWith("-") ? cur.slice(1) : cur === "0" ? cur : "-" + cur;
              if (waiting) waiting = false;
            } else if (k === "%") {
              cur = fmt(parseFloat(cur) / 100);
            } else if ("+−×÷".includes(k)) {
              if (op !== null && !waiting) { acc = compute(acc, parseFloat(cur), op); cur = fmt(acc); }
              else acc = parseFloat(cur);
              op = k; waiting = true;
            } else if (k === "=") {
              if (op !== null) { cur = fmt(compute(acc, parseFloat(cur), op)); acc = null; op = null; waiting = true; }
            }
            render();
          };
          $(".calc-keys", el).addEventListener("click", (e) => {
            const b = e.target.closest("[data-k]");
            if (b) press(b.dataset.k === "AC" ? "AC" : b.dataset.k);
          });
          const keymap = { "*": "×", x: "×", "/": "÷", "-": "−", "+": "+", Enter: "=", "=": "=", ".": ".", ",": ".", "%": "%", c: "AC", C: "AC", Backspace: "AC", Delete: "AC" };
          api.onKey((e) => {
            const k = /^\d$/.test(e.key) ? e.key : keymap[e.key];
            if (!k) return false;
            press(k);
            const btn = $(`[data-k="${k}"]`, el);
            if (btn && btn.animate && motionOK()) btn.animate([{ filter: "brightness(1.6)" }, { filter: "none" }], { duration: 250 });
            return true;
          });
          render();
        },
      }),
    },
  });

  /* Terminal --------------------------------------------------------------- */
  defineApp({
    id: "terminal",
    name: "Terminal",
    tile: "linear-gradient(160deg,#3a3a3c,#050505)",
    icon: ICON.terminal,
    chrome: "dark",
    keywords: "shell command line cli hacker",
    views: {
      root: () => ({
        title: "Terminal",
        nav: "none",
        html: `<div class="term-bar" id="appTitle">${esc((S.firstName || "guest").toLowerCase())} — zsh — 80×24</div>
               <div class="term" id="term"><pre id="termOut"></pre>
                 <form class="term-line" id="termForm" autocomplete="off"><span class="p">➜</span><span class="d">~</span>
                   <input id="termIn" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal input" enterkeyhint="go">
                 </form>
               </div>`,
        mount(el, api) {
          const out = $("#termOut", el);
          const input = $("#termIn", el);
          const term = $("#term", el);
          const user = (S.firstName || "guest").toLowerCase();
          const hist = [];
          let hi = 0;
          const print = (html) => { out.insertAdjacentHTML("beforeend", html + "\n"); term.scrollTop = term.scrollHeight; };
          const uptime = () => {
            const m = Math.floor((Date.now() - bootTime) / 60000);
            return m < 1 ? "less than a minute" : `${m} min${m === 1 ? "" : "s"}`;
          };
          const cmds = {
            help: () => [
              '<span class="y">Available commands</span>',
              "  <b>whoami</b>       who runs this machine",
              "  <b>about</b>        a short bio",
              "  <b>projects</b>     things I've built",
              "  <b>resume</b>       experience & skills",
              "  <b>notes</b>        recent writing",
              "  <b>links</b>        where to find me",
              "  <b>contact</b>      how to reach me",
              "  <b>open</b> &lt;app&gt;   launch an app (e.g. open photos)",
              "  <b>theme</b> &lt;light|dark|auto&gt;",
              "  <b>wallpaper</b> &lt;" + WALLPAPERS.join("|") + "&gt;",
              "  <b>neofetch</b>     system info",
              "  <b>ls</b>, <b>date</b>, <b>echo</b>, <b>history</b>, <b>clear</b>, <b>exit</b>",
            ].join("\n"),
            whoami: () => `${esc(S.name)}\n<span class="m">${esc(S.headline)}</span>`,
            about: () => (S.about || []).map(esc).join("\n\n"),
            projects: () => (S.projects || []).map((p) =>
              `<span class="d">•</span> <b>${esc(p.name)}</b> <span class="m">— ${esc(p.description)}</span>${p.url ? `\n  <a ${extLink(p.url)}>${esc(p.url)}</a>` : ""}`).join("\n") || "No projects yet.",
            resume: () => [
              ...(S.experience || []).map((x) => `<span class="d">${esc(x.period)}</span>  <b>${esc(x.role)}</b> @ ${esc(x.org)}`),
              (S.skills || []).length ? `\n<span class="y">skills:</span> ${(S.skills || []).map(esc).join(", ")}` : "",
            ].join("\n"),
            notes: () => notes().map((n, i) => `<span class="d">[${i}]</span> ${esc(n.title)} <span class="m">(${esc(n.date)})</span>`).join("\n") + '\n<span class="m">tip: open notes</span>',
            links: () => links().map((l) => `${esc(l.label.padEnd(12))} <a ${extLink(l.url)}>${esc(l.url)}</a>`).join("\n") || "No links yet.",
            contact: () => S.email ? `email: <a href="mailto:${esc(S.email)}">${esc(S.email)}</a>` : `Say hi in Messages (try: <b>open messages</b>)${links()[0] ? `\nor on ${esc(links()[0].label)}: <a ${extLink(links()[0].url)}>${esc(links()[0].url)}</a>` : ""}`,
            open: (a) => {
              const id = findApp(a);
              if (!id) return `<span class="e">open: no such app: ${esc(a || "")}</span>\n<span class="m">apps: ${Object.keys(APPS).join(", ")}</span>`;
              if (id === "terminal") return "You're already here 🙂";
              setTimeout(() => openApp(id), 250);
              return `<span class="m">launching ${esc(APPS[id].name)}…</span>`;
            },
            theme: (t) => (setTheme(t) ? `theme set to <b>${esc(t)}</b>` : `<span class="e">usage: theme light|dark|auto</span>`),
            wallpaper: (w) => (setWallpaper(w) ? `wallpaper set to <b>${esc(w)}</b>` : `<span class="e">usage: wallpaper ${WALLPAPERS.join("|")}</span>`),
            ls: () => `<span class="d">projects/</span>  <span class="d">notes/</span>  <span class="d">photos/</span>  about.txt  resume.pdf  secrets.txt`,
            cat: (f) => f === "about.txt" ? cmds.about() : f === "secrets.txt" ? "🤫 The best things in life are open source." : f === "resume.pdf" ? cmds.resume() : `<span class="e">cat: ${esc(f || "")}: No such file or directory</span>`,
            cd: () => '<span class="m">You can go anywhere — try: open projects</span>',
            date: () => new Date().toString(),
            echo: (...a) => esc(a.join(" ")),
            history: () => hist.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join("\n"),
            neofetch: () => {
              const art = [
                "  ╭─────────╮",
                "  │  ▂▂▂▂▂  │",
                "  │ ▢ ▢ ▢ ▢ │",
                "  │ ▢ ▢ ▢ ▢ │",
                "  │ ▢ ▢ ▢ ▢ │",
                "  │         │",
                "  │   ───   │",
                "  ╰─────────╯",
              ];
              const info = [
                `<span class="p"><b>${esc(user)}</b></span>@<span class="p"><b>${esc(OS.toLowerCase())}</b></span>`,
                "─".repeat(user.length + OS.length + 1),
                `<span class="y">OS</span>: ${esc(OS)} 1.0`,
                `<span class="y">Host</span>: ${esc(SITE_HOST)}`,
                `<span class="y">Kernel</span>: HTML5 / CSS3 / ES2020`,
                `<span class="y">Uptime</span>: ${uptime()}`,
                `<span class="y">Theme</span>: ${esc(prefs.theme)} · ${esc(prefs.wallpaper)}`,
                `<span class="y">Apps</span>: ${Object.keys(APPS).length}`,
              ];
              return art.map((l, i) => `<span class="d">${l}</span>   ${info[i] || ""}`).join("\n");
            },
            sudo: () => `<span class="e">${esc(user)} is not in the sudoers file. This incident will be reported.</span> 😉`,
            rm: () => '<span class="e">Nice try. 🙂</span>',
            clear: () => { out.innerHTML = ""; return null; },
            exit: () => { setTimeout(() => api.close(), 150); return '<span class="m">logout</span>'; },
            hello: () => "Hey there! 👋", hi: () => "Hey there! 👋",
          };
          cmds.experience = cmds.resume; cmds.socials = cmds.links; cmds.about_me = cmds.about;
          const run = (line) => {
            print(`<span class="p">➜</span> <span class="d">~</span> ${esc(line)}`);
            const [cmd, ...args] = line.trim().split(/\s+/);
            if (!cmd) return;
            hist.push(line.trim());
            hi = hist.length;
            const fn = cmds[cmd.toLowerCase()];
            if (!fn) return print(`<span class="e">zsh: command not found: ${esc(cmd)}</span>\n<span class="m">type <b>help</b> for a list of commands</span>`);
            const res = fn(...args.map((a) => a.toLowerCase()));
            if (res != null) print(res);
          };
          print(`<span class="m">Last login: ${new Date().toLocaleString()} on ttys000</span>\nWelcome to <b>${esc(OS)}</b>, ${esc(S.firstName || "friend")}'s corner of the internet.\nType <span class="y">help</span> to get started.\n`);
          $("#termForm", el).addEventListener("submit", (e) => { e.preventDefault(); run(input.value); input.value = ""; });
          input.addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp" && hi > 0) { input.value = hist[--hi]; e.preventDefault(); }
            else if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault(); }
            else if (e.key === "Tab") {
              e.preventDefault();
              const m = Object.keys(cmds).filter((c) => c.startsWith(input.value.trim().toLowerCase()));
              if (m.length === 1) input.value = m[0] + " ";
              else if (m.length > 1 && input.value.trim()) print(m.join("  "));
            } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
          });
          term.addEventListener("click", () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });
          api.focusTarget = input;
        },
      }),
    },
  });

  const findApp = (q) => {
    if (!q) return null;
    q = q.toLowerCase().replace(/[^a-z]/g, "");
    return Object.keys(APPS).find((id) => id === q || APPS[id].name.toLowerCase().replace(/[^a-z]/g, "") === q) ||
      Object.keys(APPS).find((id) => APPS[id].name.toLowerCase().startsWith(q)) || null;
  };

  /* ------------------------------------------------------------------------
     Home screen
     ------------------------------------------------------------------------ */
  const LAYOUT = {
    pages: [
      ["w:profile", "w:clock", "w:now", "about", "projects", "resume", "notes"],
      ["w:levels", "calculator", "settings", "terminal", "w:tip"],
    ],
    dock: ["messages", "safari", "mail", "photos"],
  };

  const clockSVG = () => {
    let ticks = "";
    for (let i = 0; i < 60; i++) {
      const major = i % 5 === 0;
      ticks += `<line class="tick${major ? " major" : ""}" x1="50" y1="${major ? 4.5 : 4.5}" x2="50" y2="${major ? 9.5 : 7}" transform="rotate(${i * 6} 50 50)"/>`;
    }
    let nums = "";
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 * Math.PI) / 180;
      nums += `<text class="num" x="${(50 + 34 * Math.sin(a)).toFixed(2)}" y="${(50 - 34 * Math.cos(a)).toFixed(2)}">${n}</text>`;
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${ticks}${nums}
      <line class="hand h" x1="50" y1="50" x2="50" y2="27"/>
      <line class="hand m" x1="50" y1="50" x2="50" y2="14"/>
      <line class="hand s" x1="50" y1="58" x2="50" y2="10"/>
      <circle class="pin" cx="50" cy="50" r="2.4"/></svg>`;
  };

  const WIDGETS = {
    profile: () => `
      <button class="widget w-4x2 w-profile anim-in" data-open="about" aria-label="${esc(S.name)} — open About">
        <div class="w-profile-top">${avatar()}<div class="w-profile-text">
          <div class="w-profile-name">${esc(S.name)}</div>
          <div class="w-profile-headline">${esc(S.headline)}</div>
        </div></div>
        <div class="w-profile-bottom"><span class="muted">${esc(S.location || SITE_HOST)}</span><span class="chip">View profile</span></div>
      </button>`,
    clock: () => `<div class="widget w-2x2 w-clock anim-in" role="img" aria-label="Clock" id="clockWidget">${clockSVG()}</div>`,
    now: () => `
      <div class="widget w-2x2 w-now anim-in">
        <div class="widget-label">${esc((S.now && S.now.label) || "Now")}</div>
        <div class="w-now-text">${esc((S.now && S.now.text) || "")}</div>
        <div class="w-now-foot"><span class="dot"></span>Live</div>
      </div>`,
    levels: () => `
      <div class="widget w-2x2 w-levels anim-in" role="group" aria-label="Status levels">
        ${(S.levels || []).slice(0, 3).map((l) => `
          <div class="level"><span>${esc(l.label)}</span><span class="level-val">${esc(l.value)}%</span>
            <div class="level-bar"><span style="--c:${esc(l.color || "#30d158")}" data-w="${Math.max(0, Math.min(100, +l.value || 0))}"></span></div>
          </div>`).join("")}
      </div>`,
    tip: () => `
      <button class="widget w-4x2 w-tip anim-in" data-open="terminal" aria-label="Tip: open Terminal">
        <div class="widget-label">Tip</div>
        <div class="w-tip-title">There's a terminal in here.</div>
        <div class="w-tip-body">Open it and type <span class="kbd">help</span>. Press <span class="kbd">/</span> anywhere to search.</div>
      </button>`,
  };

  const appIcon = (id, i) => {
    const a = APPS[id];
    const badge = id === "messages" && session.get("messagesPlayed") !== "1" ? `<span class="badge" aria-hidden="true">1</span>` : "";
    return `<button class="app-icon anim-in" style="--i:${i}" data-open="${id}" data-app="${id}" aria-label="${esc(a.name)}">${badge}${iconTile(a)}<span class="icon-label">${esc(a.name)}</span></button>`;
  };

  const pagesEl = $("#pages");
  const dotsEl = $("#dots");
  const dockEl = $("#dock");

  function renderHome() {
    let i = 0;
    pagesEl.innerHTML = LAYOUT.pages.map((items, p) => `
      <div class="page" role="group" aria-roledescription="page" aria-label="Page ${p + 1} of ${LAYOUT.pages.length}">${items.map((it) =>
        it.startsWith("w:") ? WIDGETS[it.slice(2)]().replace("anim-in", `anim-in" style="--i:${i++}`) : appIcon(it, i++)).join("")}
      </div>`).join("");
    dockEl.innerHTML = LAYOUT.dock.map((id) => appIcon(id, i++)).join("");
    dotsEl.innerHTML = LAYOUT.pages.map((_, p) =>
      `<button type="button" role="tab" aria-label="Page ${p + 1}" aria-selected="${p === 0}" data-page="${p}"></button>`).join("");
  }
  renderHome();

  const pageCount = LAYOUT.pages.length;
  let currentPage = 0;
  const goPage = (p) => {
    p = Math.max(0, Math.min(pageCount - 1, p));
    pagesEl.scrollTo({ left: p * pagesEl.clientWidth, behavior: motionOK() ? "smooth" : "auto" });
  };
  pagesEl.addEventListener("scroll", () => {
    const p = Math.round(pagesEl.scrollLeft / Math.max(1, pagesEl.clientWidth));
    if (p !== currentPage) {
      currentPage = p;
      $$("button", dotsEl).forEach((d, k) => d.setAttribute("aria-selected", String(k === p)));
      if (p === 1) fillLevels();
    }
  }, { passive: true });
  dotsEl.addEventListener("click", (e) => { const b = e.target.closest("[data-page]"); if (b) goPage(+b.dataset.page); });

  // Mouse wheel → page flip on desktop
  let wheelLock = 0;
  pagesEl.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal scroll
    const page = pagesEl.children[currentPage];
    if (page && page.scrollHeight > page.clientHeight + 2) return; // let page scroll vertically
    if (Date.now() < wheelLock || Math.abs(e.deltaY) < 12) return;
    wheelLock = Date.now() + 650;
    goPage(currentPage + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  function fillLevels() {
    $$(".level-bar span").forEach((s) => (s.style.width = s.dataset.w + "%"));
  }

  /* ------------------------------------------------------------------------
     Clock & battery
     ------------------------------------------------------------------------ */
  const shortTime = (d) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, "");
  function tick() {
    const d = new Date();
    const t = shortTime(d);
    $$('[data-clock="short"], [data-clock="lock"]').forEach((e) => e.textContent !== t && (e.textContent = t));
    const ld = d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    $$('[data-clock="long-date"]').forEach((e) => e.textContent !== ld && (e.textContent = ld));
    const id = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    $$('[data-clock="ipad-date"]').forEach((e) => e.textContent !== id && (e.textContent = id));
    const cw = $("#clockWidget");
    if (cw) {
      const s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      $(".hand.h", cw).style.transform = `rotate(${h * 30}deg)`;
      $(".hand.m", cw).style.transform = `rotate(${m * 6}deg)`;
      $(".hand.s", cw).style.transform = `rotate(${s * 6}deg)`;
    }
  }
  tick();
  setInterval(tick, 1000);

  const batt = $("#batteryLevel");
  const setBattery = (level, charging) => {
    batt.style.setProperty("--level", Math.round(level * 100) + "%");
    batt.parentElement.classList.toggle("low", level <= 0.2 && !charging);
    batt.parentElement.classList.toggle("charging", !!charging);
  };
  setBattery(1, false);
  if (navigator.getBattery) {
    navigator.getBattery().then((b) => {
      const u = () => setBattery(b.level, b.charging);
      u();
      b.addEventListener("levelchange", u);
      b.addEventListener("chargingchange", u);
    }).catch(() => {});
  }

  /* ------------------------------------------------------------------------
     App window: open / close / navigation
     ------------------------------------------------------------------------ */
  const appEl = $("#app");
  const contentEl = $("#appContent");
  const backdrop = $("#backdrop");
  const homeEl = $("#home");
  let current = null; // { id, stack: [{name,data}], originId, keyHandler }
  let pushedHistory = false;
  let busy = false;

  const EASE = "cubic-bezier(0.2, 0.9, 0.25, 1)";

  function visibleOrigin(id, preferEl) {
    const cands = [preferEl, ...$$(`[data-app="${id}"]`, homeEl)].filter(Boolean);
    for (const el of cands) {
      const target = $(".icon-tile", el) || el;
      const r = target.getBoundingClientRect();
      if (r.width && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight) return target;
    }
    return null;
  }

  const setHomeInert = (on) => {
    if ("inert" in homeEl) homeEl.inert = on;
    else homeEl.setAttribute("aria-hidden", on ? "true" : "false");
  };

  function buildView(app, entry, dir) {
    const fn = app.views[entry.name] || app.views.root;
    const v = fn(entry.data, api);
    const prev = current.stack[current.stack.length - 2];
    const prevTitle = prev ? (app.views[prev.name] || app.views.root)(prev.data, api).title : "";
    const wrap = document.createElement("div");
    wrap.className = "app-view" + (dir ? ` ${dir}` : "") + (v.dark ? " dark-view" : "");
    if (v.nav === "none") {
      wrap.innerHTML = (v.html.includes('id="appTitle"') ? "" : `<h2 class="visually-hidden" id="appTitle">${esc(v.title)}</h2>`) + v.html;
    } else {
      const showLarge = v.large !== false;
      wrap.innerHTML = `
        <header class="nav${v.nav === "solid" || v.bare ? " solid" : ""}${showLarge ? "" : " scrolled"}">
          <div class="nav-left">${prev ? `<button class="nav-btn" type="button" data-back>${UI.back}<span>${esc(prevTitle)}</span></button>` : ""}</div>
          <h2 class="nav-title" id="appTitle" style="margin:0">${esc(v.title)}</h2>
          <div class="nav-right">${v.right || ""}</div>
        </header>
        ${v.bare ? v.html : `<div class="scroll"><div class="wrap">${showLarge ? `<h1 class="large-title" aria-hidden="true">${esc(v.title)}</h1>` : ""}${v.html}</div></div>`}
        ${v.after || ""}`;
      const sc = $(".scroll", wrap);
      const nav = $(".nav", wrap);
      if (sc && showLarge && v.nav !== "solid") {
        sc.addEventListener("scroll", () => nav.classList.toggle("scrolled", sc.scrollTop > 34), { passive: true });
      }
    }
    appEl.dataset.chrome = v.dark ? "dark" : app.chrome || "system";
    root.classList.toggle("chrome-dark", appEl.dataset.chrome === "dark");
    return { el: wrap, view: v };
  }

  function renderTop(dir) {
    const app = APPS[current.id];
    const entry = current.stack[current.stack.length - 1];
    const { el, view } = buildView(app, entry, dir);
    current.keyHandler = null;
    api.focusTarget = null;
    contentEl.replaceChildren(el);
    if (view.mount) view.mount(el, api);
    if (current.stack.length > 1 && view.sub != null) {
      history.replaceState(history.state, "", `#/${current.id}/${view.sub}`);
    } else if (current.stack.length === 1) {
      history.replaceState(history.state, "", `#/${current.id}`);
    }
    return el;
  }

  const api = {
    focusTarget: null,
    push(name, data) {
      if (!current) return;
      current.stack.push({ name, data });
      renderTop(motionOK() ? "push-in" : "");
      focusApp();
    },
    back() {
      if (!current || current.stack.length < 2) return api.close();
      current.stack.pop();
      renderTop(motionOK() ? "pop-in" : "");
      focusApp();
    },
    close: () => closeApp(),
    onKey(fn) { if (current) current.keyHandler = fn; },
  };

  function focusApp() {
    requestAnimationFrame(() => {
      const t = api.focusTarget;
      if (t && t.isConnected && !matchMedia("(pointer: coarse)").matches) t.focus({ preventScroll: true });
      else { appEl.setAttribute("tabindex", "-1"); appEl.focus({ preventScroll: true }); }
    });
  }

  async function openApp(id, opts = {}) {
    const app = APPS[id];
    if (!app || busy) return;
    if (current) {
      if (current.id === id) { if (opts.route) { current.stack = [{ name: "root" }, opts.route]; renderTop(); } return; }
      await closeApp({ instant: true });
    }
    if (root.classList.contains("locked")) unlock({ quiet: true });
    busy = true;
    closeSpotlight();
    dismissBanner();

    current = { id, stack: [{ name: "root" }], opener: opts.originEl || null };
    if (opts.route) current.stack.push(opts.route);
    appEl.dataset.app = id;
    appEl.style.setProperty("--tile", app.tile);

    if (!opts.fromHistory) {
      if (location.hash.startsWith("#/") && history.state && history.state.app) history.replaceState({ app: id }, "", `#/${id}`);
      else { history.pushState({ app: id }, "", `#/${id}`); pushedHistory = true; }
    }
    renderTop();
    document.title = `${app.name} · ${S.name}`;

    if (id === "messages") $$('[data-app="messages"] .badge').forEach((b) => b.remove());

    appEl.hidden = false;
    backdrop.hidden = false;
    backdrop.classList.remove("closing");
    root.classList.add("app-open");
    setHomeInert(true);

    const splash = document.createElement("div");
    splash.className = "app-splash";
    splash.innerHTML = app.icon;
    appEl.appendChild(splash);

    const origin = opts.instant ? null : visibleOrigin(id, opts.originEl);
    const to = appEl.getBoundingClientRect();
    const finalRadius = getComputedStyle(appEl).borderTopLeftRadius;
    const dur = motionOK() && !opts.instant ? 560 : 0;
    let anim;
    if (origin && dur) {
      const from = origin.getBoundingClientRect();
      const r = parseFloat(getComputedStyle(origin).borderTopLeftRadius) || 14;
      const sx = from.width / to.width, sy = from.height / to.height;
      anim = appEl.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`, borderRadius: `${r / sx}px / ${r / sy}px` },
        { transform: "none", borderRadius: finalRadius },
      ], { duration: dur, easing: EASE });
    } else {
      anim = appEl.animate([
        { transform: `translate(${to.width * 0.04}px, ${to.height * 0.04}px) scale(0.92)`, opacity: 0 },
        { transform: "none", opacity: 1 },
      ], { duration: dur ? 360 : 0, easing: EASE });
    }
    splash.animate([{ opacity: 1 }, { opacity: 1, offset: 0.22 }, { opacity: 0 }], { duration: dur ? dur * 0.75 : 0, fill: "forwards" });
    await anim.finished.catch(() => {});
    splash.remove();
    busy = false;
    focusApp();
  }

  async function closeApp(opts = {}) {
    if (!current || (busy && !opts.instant)) return;
    busy = true;
    const { id, opener } = current;
    current = null;
    // opts.instant is used when switching apps: the next app replaces this history entry.
    if (opts.fromHistory) pushedHistory = false;
    else if (!opts.instant) {
      if (pushedHistory) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
      pushedHistory = false;
    }
    document.title = S.name || document.title;

    root.classList.remove("app-open", "chrome-dark");
    setHomeInert(false);
    backdrop.classList.add("closing");

    const dur = motionOK() && !opts.instant ? 440 : 0;
    const origin = dur ? visibleOrigin(id, opener) : null;
    const to = appEl.getBoundingClientRect();
    let anim;
    if (origin) {
      // The home screen is scaling back to 1; aim for the icon's final position.
      const fr = origin.getBoundingClientRect();
      const cx = innerWidth / 2, cy = innerHeight / 2, k = 1 / 0.94;
      const from = { left: cx + (fr.left - cx) * k, top: cy + (fr.top - cy) * k, width: fr.width * k, height: fr.height * k };
      const r = parseFloat(getComputedStyle(origin).borderTopLeftRadius) * k || 14;
      const sx = from.width / to.width, sy = from.height / to.height;
      const splash = document.createElement("div");
      splash.className = "app-splash";
      splash.innerHTML = APPS[id].icon;
      appEl.appendChild(splash);
      splash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.55 }, { opacity: 1 }], { duration: dur, fill: "forwards" });
      anim = appEl.animate([
        { transform: "none", borderRadius: getComputedStyle(appEl).borderTopLeftRadius },
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`, borderRadius: `${r / sx}px / ${r / sy}px` },
      ], { duration: dur, easing: EASE, fill: "forwards" });
    } else {
      anim = appEl.animate([
        { transform: "none", opacity: 1 },
        { transform: `translate(${to.width * 0.04}px, ${to.height * 0.04}px) scale(0.92)`, opacity: 0 },
      ], { duration: dur ? 260 : 0, easing: EASE, fill: "forwards" });
    }
    await anim.finished.catch(() => {});
    appEl.hidden = true;
    backdrop.hidden = true;
    appEl.getAnimations().forEach((a) => a.cancel());
    $$(".app-splash", appEl).forEach((s) => s.remove());
    contentEl.replaceChildren();
    busy = false;
    const focusBack = opener && opener.isConnected ? opener : $(`[data-app="${id}"]`, homeEl);
    if (focusBack && !opts.instant && !root.classList.contains("locked")) focusBack.focus({ preventScroll: true });
  }

  // Home indicator: tap or swipe up to close
  const hi = $("#homeIndicator");
  let hiStart = null;
  hi.addEventListener("pointerdown", (e) => { hiStart = e.clientY; hi.setPointerCapture(e.pointerId); });
  hi.addEventListener("pointermove", (e) => {
    if (hiStart != null && hiStart - e.clientY > 24) { hiStart = null; closeApp(); }
  });
  hi.addEventListener("pointerup", () => (hiStart = null));
  hi.addEventListener("click", () => closeApp());
  backdrop.addEventListener("click", () => closeApp());

  // Delegated clicks: open apps, push views, go back
  document.addEventListener("click", (e) => {
    const back = e.target.closest("[data-back]");
    if (back) { api.back(); return; }
    const push = e.target.closest("[data-push]");
    if (push && current) { api.push(push.dataset.push, push.dataset.arg != null ? +push.dataset.arg : undefined); return; }
    const open = e.target.closest("[data-open]");
    if (open) {
      e.preventDefault();
      const id = open.dataset.open;
      const route = open.dataset.arg != null && APPS[id] && APPS[id].route ? APPS[id].route(open.dataset.arg) : null;
      if (current) { closeApp({ instant: true }).then(() => openApp(id, { route })); }
      else openApp(id, { originEl: open, route });
    }
  });

  /* ------------------------------------------------------------------------
     Routing (#/app or #/app/arg)
     ------------------------------------------------------------------------ */
  const parseHash = () => {
    const m = location.hash.match(/^#\/([a-z]+)(?:\/([^/]+))?/i);
    if (!m) return null;
    const id = findApp(m[1]);
    if (!id) return null;
    const route = m[2] != null && APPS[id].route ? APPS[id].route(decodeURIComponent(m[2])) : null;
    return { id, route };
  };
  window.addEventListener("popstate", () => {
    const h = parseHash();
    if (!h) { if (current) closeApp({ fromHistory: true }); return; }
    if (!current || current.id !== h.id) openApp(h.id, { route: h.route, fromHistory: true });
  });

  /* ------------------------------------------------------------------------
     Lock screen
     ------------------------------------------------------------------------ */
  const lockEl = $("#lock");
  function renderLockNotifs() {
    const latest = notes()[0];
    const items = [
      { app: "messages", title: S.firstName || S.name, body: (S.messages || [])[0] ? `${S.messages[0]} ${(S.messages || [])[1] || ""}` : "Thanks for stopping by!", time: "now" },
      latest && { app: "notes", route: "0", title: latest.title, body: String(latest.body || "").split("\n")[0], time: fmtDate(latest.date, { month: "short", day: "numeric" }) },
    ].filter(Boolean);
    $("#lockNotifs").innerHTML = items.map((n, i) => `
      <button class="notif" style="--i:${i}" data-notif="${n.app}" ${n.route ? `data-route="${n.route}"` : ""}>
        ${iconTile(APPS[n.app])}
        <span class="notif-title">${esc(n.title)}</span><span class="notif-time">${esc(n.time)}</span>
        <span class="notif-body">${esc(n.body)}</span>
      </button>`).join("");
  }

  function showLock(opts = {}) {
    root.classList.remove("no-lock");
    renderLockNotifs();
    lockEl.hidden = false;
    lockEl.classList.remove("unlocking", "snapback");
    lockEl.style.transform = "";
    root.classList.add("locked");
    setHomeInert(true);
    session.set("unlocked", "0");
    if (opts.focus !== false) setTimeout(() => $("#unlockBtn").focus({ preventScroll: true }), 60);
  }

  function unlock(opts = {}) {
    if (!root.classList.contains("locked")) return;
    root.classList.remove("locked");
    if (!current) setHomeInert(false);
    session.set("unlocked", "1");
    lockEl.classList.remove("snapback");
    lockEl.classList.add("unlocking");
    if (!opts.quiet) {
      root.classList.add("entering");
      setTimeout(() => root.classList.remove("entering"), 1400);
      if (currentPage === 1) fillLevels();
      maybeBanner();
    }
    setTimeout(() => {
      lockEl.hidden = true;
      lockEl.classList.remove("unlocking");
      lockEl.style.transform = "";
    }, motionOK() ? 520 : 0);
  }

  // Swipe-up (or tap) gesture on the lock screen
  let drag = null;
  lockEl.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { y: e.clientY, t: performance.now(), dy: 0, target: e.target };
    lockEl.classList.remove("snapback");
    lockEl.setPointerCapture(e.pointerId);
  });
  lockEl.addEventListener("pointermove", (e) => {
    if (!drag) return;
    drag.dy = Math.min(0, e.clientY - drag.y);
    if (drag.dy < -4) lockEl.style.transform = `translateY(${drag.dy}px)`;
  });
  const endDrag = (e) => {
    if (!drag) return;
    const { dy, t, target } = drag;
    drag = null;
    const v = dy / Math.max(1, performance.now() - t);
    if (dy < -110 || v < -0.6) return unlock();
    if (Math.abs(dy) < 6 && e.type === "pointerup") {
      lockEl.style.transform = "";
      const n = target.closest && target.closest("[data-notif]");
      if (n) {
        const id = n.dataset.notif;
        const route = n.dataset.route != null && APPS[id].route ? APPS[id].route(n.dataset.route) : null;
        unlock();
        setTimeout(() => openApp(id, { route }), motionOK() ? 260 : 0);
      } else unlock();
      return;
    }
    lockEl.classList.add("snapback");
    lockEl.style.transform = "";
  };
  lockEl.addEventListener("pointerup", endDrag);
  lockEl.addEventListener("pointercancel", endDrag);
  lockEl.addEventListener("wheel", (e) => { if (e.deltaY > 20) unlock(); }, { passive: true });
  // Keyboard users: buttons inside the lock screen activate via click (pointer events don't fire)
  lockEl.addEventListener("click", (e) => {
    if (e.detail !== 0) return; // real pointer clicks are handled above
    const n = e.target.closest("[data-notif]");
    unlock();
    if (n) {
      const id = n.dataset.notif;
      const route = n.dataset.route != null && APPS[id].route ? APPS[id].route(n.dataset.route) : null;
      setTimeout(() => openApp(id, { route }), motionOK() ? 260 : 0);
    }
  });

  /* ------------------------------------------------------------------------
     Notification banner
     ------------------------------------------------------------------------ */
  const banner = $("#banner");
  let bannerTimer = 0;
  function maybeBanner() {
    if (session.get("bannerShown") === "1") return;
    session.set("bannerShown", "1");
    setTimeout(() => {
      if (current || root.classList.contains("locked") || root.classList.contains("search-open")) return;
      banner.innerHTML = `${iconTile(APPS.messages)}
        <span><b>${esc(S.firstName || S.name)}</b></span><span class="notif-time">now</span>
        <span class="notif-body">${esc((S.messages || [])[0] || "Hey!")} Tap to say hi.</span>`;
      banner.hidden = false;
      banner.classList.remove("out");
      bannerTimer = setTimeout(dismissBanner, 6500);
    }, motionOK() ? 1500 : 300);
  }
  function dismissBanner() {
    if (banner.hidden) return;
    clearTimeout(bannerTimer);
    banner.classList.add("out");
    setTimeout(() => (banner.hidden = true), motionOK() ? 350 : 0);
  }
  let bannerY = null;
  banner.addEventListener("pointerdown", (e) => (bannerY = e.clientY));
  banner.addEventListener("pointermove", (e) => { if (bannerY != null && e.clientY - bannerY < -20) { bannerY = null; dismissBanner(); } });
  banner.addEventListener("pointerup", (e) => {
    if (bannerY != null && Math.abs(e.clientY - bannerY) < 8) { dismissBanner(); openApp("messages"); }
    bannerY = null;
  });
  banner.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { dismissBanner(); openApp("messages"); } });
  banner.tabIndex = 0;

  /* ------------------------------------------------------------------------
     Spotlight search
     ------------------------------------------------------------------------ */
  const spot = $("#spotlight");
  const spotInput = $("#spotlightInput");
  const spotResults = $("#spotlightResults");
  let spotItems = [];
  let spotSel = 0;

  function searchIndex() {
    const idx = [];
    Object.values(APPS).forEach((a) => idx.push({ group: "Apps", title: a.name, sub: "Application", hay: `${a.name} ${a.keywords || ""}`, tile: a, run: () => openApp(a.id) }));
    (S.projects || []).forEach((p) => idx.push({
      group: "Projects", title: p.name, sub: p.description, emoji: p.emoji || "🚀",
      hay: `${p.name} ${p.description} ${(p.tags || []).join(" ")} ${p.eyebrow || ""}`, run: () => openApp("projects"),
    }));
    notes().forEach((n, i) => idx.push({ group: "Notes", title: n.title, sub: fmtDate(n.date), emoji: "📝", hay: `${n.title} ${n.body}`, run: () => openApp("notes", { route: { name: "note", data: i } }) }));
    links().forEach((l) => idx.push({ group: "Links", title: l.label, sub: l.url, emoji: "🔗", hay: `${l.label} ${l.url}`, run: () => window.open(l.url, "_blank", "noopener") }));
    idx.push({ group: "Actions", title: "Toggle Dark Mode", sub: "Settings", emoji: "🌓", hay: "dark light mode theme appearance toggle", run: () => {
      const dark = prefs.theme === "dark" || (prefs.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
      setTheme(dark ? "light" : "dark");
    } });
    idx.push({ group: "Actions", title: "Lock Screen", sub: OS, emoji: "🔒", hay: "lock screen sleep", run: () => showLock() });
    return idx;
  }

  function renderSpot() {
    const q = spotInput.value.trim().toLowerCase();
    if (!q) {
      spotItems = [];
      spotResults.innerHTML = `<div><div class="sp-group-title">Suggestions</div>
        <div class="sp-suggest">${["about", "projects", "resume", "messages", "notes", "terminal", "calculator", "settings"].map((id) =>
          `<button class="app-icon" data-open="${id}" aria-label="${esc(APPS[id].name)}">${iconTile(APPS[id])}<span class="icon-label">${esc(APPS[id].name)}</span></button>`).join("")}</div></div>`;
      return;
    }
    const terms = q.split(/\s+/);
    spotItems = searchIndex().filter((it) => terms.every((t) => it.hay.toLowerCase().includes(t)));
    spotSel = 0;
    if (!spotItems.length) {
      spotResults.innerHTML = `<div class="sp-empty">No results for “${esc(spotInput.value.trim())}”</div>`;
      return;
    }
    const groups = {};
    spotItems.forEach((it, i) => { it.i = i; (groups[it.group] = groups[it.group] || []).push(it); });
    spotResults.innerHTML = Object.entries(groups).map(([g, items]) => `
      <div><div class="sp-group-title">${esc(g)}</div><div class="sp-list">${items.map((it) => `
        <button class="sp-item" role="option" data-i="${it.i}" aria-selected="${it.i === 0}">
          ${it.tile ? iconTile(it.tile) : `<span class="sp-emoji" aria-hidden="true">${esc(it.emoji)}</span>`}
          <span class="sp-text"><span class="sp-title">${esc(it.title)}</span><br><span class="sp-sub">${esc(it.sub)}</span></span>
        </button>`).join("")}</div></div>`).join("");
  }
  const selectSpot = (i) => {
    spotSel = (i + spotItems.length) % spotItems.length;
    $$(".sp-item", spotResults).forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.i === spotSel)));
    const el = $(`.sp-item[data-i="${spotSel}"]`, spotResults);
    if (el) el.scrollIntoView({ block: "nearest" });
  };
  const runSpot = (i) => {
    const it = spotItems[i];
    if (!it) return;
    closeSpotlight();
    if (current && it.group !== "Links" && it.group !== "Actions") closeApp({ instant: true }).then(it.run);
    else it.run();
  };

  function openSpotlight() {
    if (root.classList.contains("locked")) unlock({ quiet: true });
    dismissBanner();
    spot.hidden = false;
    root.classList.add("search-open");
    spotInput.value = "";
    renderSpot();
    setTimeout(() => spotInput.focus(), 30);
  }
  function closeSpotlight() {
    if (spot.hidden) return;
    spot.hidden = true;
    root.classList.remove("search-open");
    spotInput.blur();
  }
  $("#searchPill").addEventListener("click", openSpotlight);
  $("#spotlightCancel").addEventListener("click", closeSpotlight);
  spot.addEventListener("click", (e) => {
    if (e.target === spot) closeSpotlight();
    const it = e.target.closest(".sp-item");
    if (it) runSpot(+it.dataset.i);
  });
  spotInput.addEventListener("input", renderSpot);
  spotInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && spotItems.length) { e.preventDefault(); selectSpot(spotSel + 1); }
    else if (e.key === "ArrowUp" && spotItems.length) { e.preventDefault(); selectSpot(spotSel - 1); }
    else if (e.key === "Enter") { e.preventDefault(); runSpot(spotSel); }
  });

  // Pull down on the home screen to search
  let pull = null;
  pagesEl.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch") return;
    const page = pagesEl.children[currentPage];
    if (page && page.scrollTop > 0) return;
    pull = { x: e.clientX, y: e.clientY };
  });
  pagesEl.addEventListener("pointermove", (e) => {
    if (!pull) return;
    const dx = Math.abs(e.clientX - pull.x), dy = e.clientY - pull.y;
    if (dx > 24) pull = null;
    else if (dy > 70) { pull = null; openSpotlight(); }
  });
  ["pointerup", "pointercancel"].forEach((t) => pagesEl.addEventListener(t, () => (pull = null)));
  // Touch fallback (pointermove may be swallowed by native scrolling)
  let tpull = null;
  pagesEl.addEventListener("touchstart", (e) => {
    const page = pagesEl.children[currentPage];
    tpull = page && page.scrollTop <= 0 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }, { passive: true });
  pagesEl.addEventListener("touchmove", (e) => {
    if (!tpull) return;
    const dx = Math.abs(e.touches[0].clientX - tpull.x), dy = e.touches[0].clientY - tpull.y;
    if (dx > 24) tpull = null;
    else if (dy > 80) { tpull = null; openSpotlight(); }
  }, { passive: true });

  /* ------------------------------------------------------------------------
     Keyboard
     ------------------------------------------------------------------------ */
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); spot.hidden ? openSpotlight() : closeSpotlight(); return; }
    if (e.key === "Escape") {
      if (!spot.hidden) { closeSpotlight(); return; }
      if (current) { current.stack.length > 1 ? api.back() : closeApp(); return; }
      return;
    }
    if (root.classList.contains("locked")) {
      if (["Enter", " ", "ArrowUp"].includes(e.key) && e.target === document.body) { e.preventDefault(); unlock(); }
      else if (e.key === "/") { e.preventDefault(); openSpotlight(); }
      return;
    }
    if (current && current.keyHandler && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (current.keyHandler(e)) { e.preventDefault(); return; }
    }
    if (typing || current || !spot.hidden) return;
    if (e.key === "/") { e.preventDefault(); openSpotlight(); }
    else if (e.key === "ArrowRight") goPage(currentPage + 1);
    else if (e.key === "ArrowLeft") goPage(currentPage - 1);
  });

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  const initial = parseHash();
  if (initial) {
    root.classList.remove("locked");
    lockEl.hidden = true;
    history.replaceState({ app: initial.id }, "", location.hash);
    pushedHistory = false;
    openApp(initial.id, { route: initial.route, fromHistory: true, instant: !motionOK() });
  } else if (session.get("unlocked") === "1") {
    lockEl.hidden = true;
    root.classList.add("entering");
    setTimeout(() => root.classList.remove("entering"), 1400);
  } else {
    showLock({ focus: false });
  }

  // Register for "Add to Home Screen" polish; no service worker needed.
  window.SattlerOS = { open: openApp, close: closeApp, lock: showLock, apps: APPS };
})();
