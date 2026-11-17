// Cloud layer: Supabase auth (email/password, magic link, password reset), profile,
// cross-device sync of app state, and an append-only answer log for weak-area analysis.
// If config.js has no Supabase settings, the app runs in local-only mode (browser storage),
// with export/import still available.
window.CLOUD = (() => {
  const cfg = window.SECPLUS_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const P = "sp:";                                  // must match store prefix in index.html
  const META = P + "__meta", LOGQ = P + "__logq", CQ = P + "__custom";
  // Keys synced to the cloud (everything a user would expect to follow them between devices)
  const KEYS = ["pbq-status","pbq-level","mcq-stats","mcq-prefs","exam-history","exam-len","exam-level",
                "ref-known","ref-prefs","cc-done","cc-cur","exam-date"];
  const $ = s => document.querySelector(s);
  const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const jget = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  let sb = null, user = null, profile = null, status = configured ? "signed-out" : "local";
  let dirty = new Set(), pushTimer = null, lastPull = 0, lastErr = "", view = null;
  const meta = () => jget(META, {});
  const setMeta = m => jset(META, m);

  // ---------------- state sync ----------------
  function changed(k) {
    if (!KEYS.includes(k)) return;
    const m = meta(); m[k] = Date.now(); setMeta(m);
    if (user) { dirty.add(k); schedulePush(); }
  }
  function schedulePush(ms = 1500) { clearTimeout(pushTimer); pushTimer = setTimeout(push, ms); }
  async function push() {
    if (!user || !sb || !dirty.size) return;
    const m = meta(), keys = [...dirty];
    const rows = keys.map(k => ({ user_id: user.id, key: k, value: jget(P + k, null), updated_at: new Date(m[k] || Date.now()).toISOString() }))
                     .filter(r => r.value !== null);
    if (!rows.length) { dirty.clear(); return; }
    setStatus("syncing");
    const { error } = await sb.from("user_state").upsert(rows, { onConflict: "user_id,key" });
    if (error) { lastErr = error.message; setStatus("error"); schedulePush(15000); return; }
    keys.forEach(k => dirty.delete(k));
    await flushLogs();
    setStatus("synced");
  }
  // Pull remote state; newer remote values overwrite local ones. Returns true if anything changed.
  async function pull() {
    if (!user || !sb) return false;
    const { data, error } = await sb.from("user_state").select("key,value,updated_at");
    if (error) { lastErr = error.message; setStatus("error"); return false; }
    lastPull = Date.now();
    const m = meta(); let changedAny = false; const remoteKeys = new Set();
    for (const r of data || []) {
      if (!KEYS.includes(r.key)) continue;
      remoteKeys.add(r.key);
      const rt = Date.parse(r.updated_at), lt = m[r.key] || 0;
      if (rt > lt) {
        const cur = localStorage.getItem(P + r.key), next = JSON.stringify(r.value);
        if (cur !== next) { localStorage.setItem(P + r.key, next); changedAny = true; }
        m[r.key] = rt;
      } else if (lt > rt) dirty.add(r.key);
    }
    // Local keys the cloud has never seen (e.g., progress made before first sign-in) get uploaded
    for (const k of KEYS) if (!remoteKeys.has(k) && localStorage.getItem(P + k) !== null) { dirty.add(k); if (!m[k]) m[k] = Date.now(); }
    setMeta(m);
    if (dirty.size) schedulePush(300); else setStatus("synced");
    return changedAny;
  }
  const examRunning = () => window.EX && EX.inProgress && EX.inProgress();
  // Modules read storage at start-up, so apply remote changes with one controlled reload.
  function applyRemote(soft) {
    if (soft || examRunning()) { toast("Newer progress is available from another device.", "Reload now", () => location.reload()); return; }
    const last = +sessionStorage.getItem("sp-reloaded") || 0;
    if (Date.now() - last < 15000) return;           // loop guard
    sessionStorage.setItem("sp-reloaded", Date.now());
    location.reload();
  }

  // ---------------- answer log ----------------
  function log(ev) {
    const q = jget(LOGQ, { a: [], e: [] });
    q.a.push(Object.assign({ answered_at: new Date().toISOString() }, ev));
    if (q.a.length > 5000) q.a = q.a.slice(-5000);
    jset(LOGQ, q);
    if (user) schedulePush(3000);
  }
  function exam(row) {
    const q = jget(LOGQ, { a: [], e: [] });
    q.e.push(Object.assign({ taken_at: new Date().toISOString() }, row));
    jset(LOGQ, q);
    if (user) schedulePush(500);
  }
  async function flushLogs() {
    if (!user || !sb) return;
    const q = jget(LOGQ, { a: [], e: [] });
    if (q.e.length) {
      const rows = q.e.map(r => Object.assign({ user_id: user.id }, r));
      const { error } = await sb.from("exam_attempts").insert(rows);
      if (!error) q.e = []; else lastErr = error.message;
    }
    while (q.a.length) {
      const chunk = q.a.slice(0, 500).map(r => Object.assign({ user_id: user.id }, r));
      const { error } = await sb.from("question_attempts").insert(chunk);
      if (error) { lastErr = error.message; break; }
      q.a = q.a.slice(500);
    }
    jset(LOGQ, q);
  }

  // ---------------- auth ----------------
  async function loadProfile() {
    const { data } = await sb.from("profiles").select("display_name,exam_date,role").eq("id", user.id).maybeSingle();
    profile = data || { display_name: "", exam_date: null, role: "user" };
    // exam date: prefer whichever side has a value
    if (profile.exam_date) profile.exam_date = String(profile.exam_date).slice(0, 10);   // always YYYY-MM-DD
    if (profile.exam_date && !jget(P + "exam-date", null)) jset(P + "exam-date", profile.exam_date);
  }
  async function afterLogin(isFresh) {
    await loadProfile();
    const changedState = await pull();
    const changedBank = await loadCustom();
    await flushLogs();
    renderAcct(); renderTabs();
    if (changedState || changedBank) applyRemote(!isFresh);
    document.dispatchEvent(new CustomEvent("cloud:login"));
  }

  // ---------------- custom questions ----------------
  // The bank cache (sp:__custom) is read by the loader in index.html at start-up.
  const isAdmin = () => !!(user && profile && profile.role === "admin");
  async function loadCustom() {
    if (!user || !sb) return false;
    const { data, error } = await sb.from("custom_questions").select("id,owner_id,kind,domain,level,data,visibility,updated_at");
    if (error) { lastErr = error.message; return false; }
    const rows = (data || []).filter(r => r.owner_id === user.id || r.visibility === "public");
    const others = [...new Set(rows.filter(r => r.owner_id !== user.id).map(r => r.owner_id))];
    const names = {};
    if (others.length) { const { data: a } = await sb.rpc("question_authors", { ids: others }); (a || []).forEach(x => names[x.id] = x.display_name); }
    const cache = rows.map(r => ({ id: r.id, kind: r.kind, domain: r.domain, level: r.level, data: r.data, vis: r.visibility,
      mine: r.owner_id === user.id, author: r.owner_id === user.id ? "You" : (names[r.owner_id] || "Community") }))
      .sort((x, y) => x.id < y.id ? -1 : 1);
    const prev = localStorage.getItem(CQ), next = JSON.stringify(cache);
    if (prev === next) return false;
    localStorage.setItem(CQ, next); return true;
  }
  async function refreshBank() {
    if (await loadCustom()) toast("Your question bank changed.", "Reload to use it", () => location.reload());
  }
  const must = r => { if (r.error) throw new Error(r.error.message); return r.data; };
  const cqCols = "id,owner_id,kind,domain,level,data,visibility,review_note,reviewed_at,created_at,updated_at";
  const Q = {
    mine:      async () => must(await sb.from("custom_questions").select(cqCols).eq("owner_id", user.id)),
    save:      async (q) => {
      const row = { kind: q.kind, domain: q.domain, level: q.level, data: q.data, visibility: q.visibility };
      const r = q.id ? await sb.from("custom_questions").update(row).eq("id", q.id).select(cqCols)
                     : await sb.from("custom_questions").insert(row).select(cqCols);
      const d = must(r); refreshBank(); return Array.isArray(d) ? d[0] : d;
    },
    remove:    async (id) => { must(await sb.from("custom_questions").delete().eq("id", id)); refreshBank(); },
    setVis:    async (id, visibility) => { must(await sb.from("custom_questions").update({ visibility }).eq("id", id).select("id")); refreshBank(); },
    // admin
    byVis:     async (v) => must(await sb.from("custom_questions").select(cqCols).eq("visibility", v)),
    review:    async (id, visibility, note) => { must(await sb.from("custom_questions").update({ visibility, review_note: note || null }).eq("id", id).select("id")); refreshBank(); },
    profiles:  async () => must(await sb.from("profiles").select("id,display_name,email,role")),
    users:     async () => must(await sb.rpc("admin_user_overview")),
    setRole:   async (id, role) => must(await sb.rpc("admin_set_role", { target: id, new_role: role }))
  };
  function renderTabs() {
    const adm = document.querySelector('[data-tab="admin"]');
    if (adm) adm.hidden = !isAdmin();
  }
  function loadLib() {
    return new Promise((res, rej) => {
      if (window.supabase) return res();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = res; s.onerror = () => rej(new Error("Could not load the Supabase library."));
      document.head.appendChild(s);
    });
  }
  async function init() {
    renderAcct(); renderTabs(); deployWarning();
    if (!configured) { hideAuth(); return; }
    // Show the sign-in page right away (before the library loads) unless there's a stored session or guest choice
    const ref = (() => { try { return new URL(cfg.supabaseUrl).hostname.split(".")[0]; } catch (e) { return ""; } })();
    const hasSession = !!localStorage.getItem(`sb-${ref}-auth-token`);
    if (!hasSession && !isGuest()) showAuth("signin"); else hideAuth();
    try { await loadLib(); } catch (e) { lastErr = e.message; setStatus("error"); msg("Couldn't reach the sign-in service. Check your connection and reload."); return; }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    sb.auth.onAuthStateChange((evt, session) => {
      // Supabase docs: don't await other Supabase calls inside this callback (can deadlock) — defer them.
      if (evt === "PASSWORD_RECOVERY") { user = session?.user || null; setTimeout(() => openModal("newpw"), 0); return; }
      if (evt === "SIGNED_IN" && session?.user && (!user || user.id !== session.user.id)) { user = session.user; localStorage.removeItem(GUEST); hideAuth(); setStatus("syncing"); setTimeout(() => afterLogin(true), 0); }
      if (evt === "SIGNED_OUT") { const hadCustom = !!localStorage.getItem(CQ); user = null; profile = null; localStorage.removeItem(CQ); setStatus("signed-out"); renderTabs(); showAuth("signin"); if (hadCustom) setTimeout(() => location.reload(), 0); }
    });
    const { data } = await sb.auth.getSession();
    // Clean ?code=… left by magic-link / reset redirects (PKCE)
    if (/[?&]code=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    if (data.session?.user && !user) { user = data.session.user; hideAuth(); setStatus("syncing"); await afterLogin(false); }
    else if (!user) { setStatus("signed-out"); if (!isGuest()) showAuth(authView); }
    // Catch changes from other devices when you come back to this tab
    document.addEventListener("visibilitychange", async () => {
      if (!user) return;
      if (document.visibilityState === "hidden") { push(); return; }
      if (Date.now() - lastPull > 60000 && !dirty.size) { if (await pull()) applyRemote(true); }
    });
  }
  const redirectTo = () => location.origin + location.pathname;
  async function signIn(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; }
  async function signUp(email, password, name) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: redirectTo() } });
    if (error) throw error;
    return data.session ? "signed-in" : "confirm";
  }
  async function magic(email) { const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } }); if (error) throw error; }
  async function forgot(email) { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() }); if (error) throw error; }
  async function newPassword(pw) { const { error } = await sb.auth.updateUser({ password: pw }); if (error) throw error; }
  async function signOut() { await push(); await sb.auth.signOut(); user = null; setStatus("signed-out"); localStorage.removeItem(GUEST); showAuth("signin"); }
  async function saveProfile(name, date) {
    jset(P + "exam-date", date || null); changed("exam-date");
    if (user) {
      const { error } = await sb.from("profiles").update({ display_name: name || null, exam_date: date || null }).eq("id", user.id);
      if (error) throw error;
      profile = { display_name: name, exam_date: date || null };
    }
    renderAcct();
  }
  async function resetAll() {
    if (user) {
      await sb.from("user_state").delete().eq("user_id", user.id);
      await sb.from("question_attempts").delete().eq("user_id", user.id);
      await sb.from("exam_attempts").delete().eq("user_id", user.id);
    }
    Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => localStorage.removeItem(k));
    location.reload();
  }

  // ---------------- export / import ----------------
  function exportData() {
    const out = { app: "secplus-practice-lab", version: 1, exported_at: new Date().toISOString(), state: {} };
    for (const k of KEYS) { const v = jget(P + k, undefined); if (v !== undefined) out.state[k] = v; }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `secplus-progress-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  async function importData(file) {
    const data = JSON.parse(await file.text());
    if (data.app !== "secplus-practice-lab" || typeof data.state !== "object") throw new Error("That file isn't a Security+ Practice Lab export.");
    const m = meta(), now = Date.now();
    for (const [k, v] of Object.entries(data.state)) if (KEYS.includes(k)) { jset(P + k, v); m[k] = now; dirty.add(k); }
    setMeta(m);
    if (user) await push();
    location.reload();
  }

  // ---------------- UI ----------------
  const allowGuest = cfg.allowGuest !== false;
  const GUEST = P + "__guest";
  const isGuest = () => localStorage.getItem(GUEST) === "1";
  function daysLeft() {
    const raw = jget(P + "exam-date", null); if (!raw) return null; const d = String(raw).slice(0, 10);
    const t = new Date(d + "T12:00:00"), n = new Date(); n.setHours(12,0,0,0);
    return Math.round((t - n) / 86400000);
  }
  function setStatus(s) { status = s; renderAcct(); document.dispatchEvent(new CustomEvent("cloud:status")); }
  const STATUS = { local: "Saved in this browser", "signed-out": "Not signed in", syncing: "Syncing…", synced: "Synced", error: "Sync error" };
  function renderAcct() {
    const el = $("#acct"); if (!el) return;
    const dl = daysLeft();
    const cd = dl == null ? "" : `<span class="chip countdown ${dl <= 7 ? "lvl-hard" : ""}" title="Exam date">${dl > 0 ? dl + (dl === 1 ? " day" : " days") + " to exam" : dl === 0 ? "Exam day — good luck" : "Exam date passed"}</span>`;
    const label = user ? h((profile && profile.display_name) || user.email.split("@")[0]) : configured ? "Sign in" : "Account";
    const dot = { local: "", "signed-out": "", syncing: "dot-sync", synced: "dot-ok", error: "dot-err" }[status];
    el.innerHTML = `${cd}<button class="acct-btn" data-acct="open" title="${h(STATUS[status])}">${dot ? `<i class="dot ${dot}"></i>` : ""}${label}</button>`;
  }

  // --- Misconfigured deploy warning (e.g. drag-and-drop deploy, or env vars missing) ---
  function deployWarning() {
    const emptyCfg = window.SECPLUS_CONFIG && !configured;
    const hosted = /\.netlify\.app$/.test(location.hostname);
    if (configured || !(emptyCfg || hosted) || $("#cfg-warning")) return;
    const b = document.createElement("div"); b.id = "cfg-warning"; b.className = "cfg-warning";
    b.innerHTML = `<b>Sign-in is off on this deploy.</b> It was published without Supabase settings, so progress is saved in this browser only.
      Fix: in Netlify, link the site to the GitHub repo, set <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code>, then trigger a new deploy (drag-and-drop deploys skip the build step).`;
    document.body.prepend(b);
  }

  // --- Full-page sign-in / sign-up (first screen when cloud sync is configured) ---
  let authView = "signin";
  function field(id, label, type = "text", val = "", extra = "") { return `<label class="f"><span>${label}</span><input id="${id}" type="${type}" value="${h(val)}" ${extra}></label>`; }
  function showAuth(v) {
    if (!configured) return;
    authView = v || authView || "signin";
    document.documentElement.classList.add("auth-mode");
    let pg = $("#auth-page");
    if (!pg) { pg = document.createElement("div"); pg.id = "auth-page"; document.body.appendChild(pg); }
    const forms = {
      signin: `<h2>Sign in</h2>
        ${field("acct-email","Email","email","",'autocomplete="email" required')}${field("acct-pw","Password","password","",'autocomplete="current-password" required')}
        <div class="mrow"><button class="btn primary wide" data-acct="signin">Sign in</button></div>
        <div class="mrow"><button class="btn wide" data-acct="magic">Email me a one-time sign-in link</button></div>
        <p class="muted auth-links"><a href="#" data-acct-view="signup">Create an account</a> · <a href="#" data-acct-view="forgot">Forgot password?</a></p>`,
      signup: `<h2>Create your account</h2>
        ${field("acct-name","Display name","text","",'maxlength="60" autocomplete="nickname"')}${field("acct-email","Email","email","",'autocomplete="email" required')}
        ${field("acct-pw","Password (12+ characters)","password","",'autocomplete="new-password" minlength="12" required')}
        <div class="mrow"><button class="btn primary wide" data-acct="signup">Create account</button></div>
        <p class="muted">You'll get an email to confirm your address. Any progress already in this browser is uploaded to your account.</p>
        <p class="muted auth-links"><a href="#" data-acct-view="signin">I already have an account</a></p>`,
      forgot: `<h2>Reset your password</h2>${field("acct-email","Email","email","",'autocomplete="email" required')}
        <div class="mrow"><button class="btn primary wide" data-acct="forgot">Send reset link</button></div>
        <p class="muted auth-links"><a href="#" data-acct-view="signin">Back to sign in</a></p>`
    };
    pg.innerHTML = `<div class="auth-wrap">
      <section class="auth-pitch">
        <div class="auth-brand">Security+ Practice Lab</div>
        <h1>Pass SY0-701 with practice that looks like the real exam.</h1>
        <ul>
          <li><b>Performance-based questions</b> including a live command-line terminal, log triage and network builds</li>
          <li><b>Timed practice exams</b> weighted to the official domain percentages, with a scaled score estimate</li>
          <li><b>Hundreds of multiple-choice questions</b> with explanations, a hard-only cram mode and an acronym quiz</li>
          <li><b>Your progress follows you</b> across devices, with an account dashboard and countdown to exam day</li>
        </ul>
      </section>
      <section class="auth-card" role="form" aria-label="Account">${forms[authView] || forms.signin}
        <div class="merr" id="acct-msg"></div>
        ${allowGuest ? `<hr><button class="linkbtn" data-acct="guest">Continue without an account →</button><p class="muted" style="margin:4px 0 0">Progress is saved in this browser only. You can create an account later.</p>` : ""}
      </section></div>`;
    const first = pg.querySelector("input"); if (first) first.focus();
  }
  function hideAuth() { document.documentElement.classList.remove("auth-mode"); }

  // --- Small modal kept only for the password-recovery link ---
  function openModal(v) {
    if (v !== "newpw") return;
    let m = $("#acct-modal");
    if (!m) { m = document.createElement("div"); m.id = "acct-modal"; m.className = "modal-bg"; document.body.appendChild(m); }
    m.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>Choose a new password</h3>${field("acct-pw","New password (12+ characters)","password","",'autocomplete="new-password" minlength="12"')}
      <div class="mrow"><button class="btn primary" data-acct="newpw">Update password</button></div><div class="merr" id="acct-msg"></div></div>`;
    hideAuth();
  }
  function closeModal() { const m = $("#acct-modal"); if (m) m.remove(); }
  function msg(t, ok) { const e = $("#acct-msg"); if (e) { e.textContent = t; e.className = "merr" + (ok ? " ok" : ""); } }
  function toast(text, btn, fn) {
    let t = $("#acct-toast"); if (t) t.remove();
    t = document.createElement("div"); t.id = "acct-toast"; t.className = "toast";
    t.innerHTML = `<span>${h(text)}</span>${btn ? `<button class="btn primary">${h(btn)}</button>` : ""}<button class="mclose" aria-label="Dismiss">×</button>`;
    document.body.appendChild(t);
    if (btn) t.querySelector(".btn").onclick = fn;
    t.querySelector(".mclose").onclick = () => t.remove();
  }
  const val = id => ($("#" + id) || {}).value || "";
  const goAccount = () => { if (window.setTab) setTab("account"); };

  document.addEventListener("click", async e => {
    const v = e.target.closest("[data-acct-view]"); if (v) { e.preventDefault(); return showAuth(v.dataset.acctView); }
    const b = e.target.closest("[data-acct]"); if (!b) return;
    const a = b.dataset.acct;
    try {
      if (a === "open") { if (configured && !user) { localStorage.removeItem(GUEST); return showAuth("signin"); } return goAccount(); }
      if (a === "signup-page") { localStorage.removeItem(GUEST); return showAuth("signup"); }
      if (a === "guest") { localStorage.setItem(GUEST, "1"); hideAuth(); renderAcct(); return; }
      if (a === "signin") {
        if (!val("acct-email") || !val("acct-pw")) return msg("Enter your email and password.");
        if (!sb) return msg(lastErr || "Still connecting — try again in a moment.");
        b.disabled = true; await signIn(val("acct-email").trim(), val("acct-pw")); return;
      }
      if (a === "magic") { if (!val("acct-email")) return msg("Enter your email first."); await magic(val("acct-email").trim()); return msg("Check your email for a sign-in link.", true); }
      if (a === "signup") {
        if (!val("acct-email")) return msg("Enter your email.");
        if (val("acct-pw").length < 12) return msg("Use at least 12 characters.");
        b.disabled = true;
        const r = await signUp(val("acct-email").trim(), val("acct-pw"), val("acct-name").trim());
        b.disabled = false;
        if (r === "confirm") return msg("Check your email to confirm your account, then sign in here.", true);
        return;
      }
      if (a === "forgot") { if (!val("acct-email")) return msg("Enter your email."); await forgot(val("acct-email").trim()); return msg("If that account exists, a reset link is on its way.", true); }
      if (a === "newpw") { if (val("acct-pw").length < 12) return msg("Use at least 12 characters."); await newPassword(val("acct-pw")); closeModal(); toast("Password updated."); goAccount(); return; }
    } catch (err) { msg(err.message || String(err)); b.disabled = false; }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && $("#acct-modal")) closeModal();
    if (e.key === "Enter" && e.target.closest && e.target.closest("#auth-page input, #acct-modal input")) {
      const primary = (e.target.closest("#auth-page") || e.target.closest("#acct-modal")).querySelector(".btn.primary"); if (primary) { e.preventDefault(); primary.click(); }
    }
  });

  // Recent activity for the dashboard (signed-in users): answers per day
  async function activity(days = 14) {
    if (!user || !sb) return null;
    await flushLogs();   // upload any answers still queued in this browser so the chart is current
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await sb.from("question_attempts").select("answered_at,correct").gte("answered_at", since);
    if (error) throw new Error(error.message);
    return data || [];
  }
  async function syncNow() { await push(); if (await pull()) applyRemote(false); }

  const api = { changed, log, exam, init, configured: () => configured, user: () => user, isAdmin, profile: () => profile, questions: Q, toast,
    isGuest, showAuth, signOut, saveProfile, changePassword: newPassword, exportData, importData, resetAll, syncNow, activity, daysLeft,
    statusLabel: () => STATUS[status], lastError: () => lastErr, _status: () => status };
  setTimeout(init, 0);
  return api;
})();
