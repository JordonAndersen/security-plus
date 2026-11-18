// Account page: progress dashboard (exam countdown, readiness, accuracy by domain, last 3 practice exams,
// recent activity) plus profile/settings. Works for signed-in users, guests and local-only copies.
(() => {
  const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const $ = s => document.querySelector(s);
  const C = () => window.CLOUD;
  const PASS = 750;
  const pct = x => x == null || isNaN(x) ? "—" : Math.round(x * 100) + "%";
  const cls = x => x == null ? "" : x >= 0.8 ? "" : x >= 0.65 ? "mid" : "low";
  const when = t => new Date(t).toLocaleDateString([], { month: "short", day: "numeric" });
  const fmtTime = s => `${Math.floor(s / 60)}m`;
  const WEIGHT = { 1: 12, 2: 22, 3: 18, 4: 28, 5: 20 };   // SY0-701 domain weights (% of exam)
  const dName = d => DOMAINS[d].replace(/^\d\.0 /, "");
  let actCache = null;

  function metrics() {
    const mc = store.get("mcq-stats", {}), bank = PBQ.mc, byId = Object.fromEntries(bank.map(q => [q.id, q]));
    let s = 0, c = 0, hs = 0, hc = 0; const dom = {1:{s:0,c:0},2:{s:0,c:0},3:{s:0,c:0},4:{s:0,c:0},5:{s:0,c:0}};
    for (const [id, t] of Object.entries(mc)) {
      const q = byId[id]; s += t.s; c += t.c;
      if (q) { dom[q.domain].s += t.s; dom[q.domain].c += t.c; if (lvl(q) === "hard") { hs += t.s; hc += t.c; } }
    }
    const seen = bank.filter(q => mc[q.id]).length;
    const pbqStatus = store.get("pbq-status", {});
    const pbqPassed = Q.filter(q => pbqStatus[q.id] === "pass").length, pbqTried = Q.filter(q => pbqStatus[q.id]).length;
    const known = store.get("ref-known", {}), acrMastered = PBQ.acr.filter(a => known["a:" + a.a] === 1).length;
    const hist = store.get("exam-history", []), last3 = hist.slice(-3).reverse();
    const avg3 = last3.length ? Math.round(last3.reduce((a, x) => a + x.score, 0) / last3.length) : null;
    const examDom = {};
    [1,2,3,4,5].forEach(d => { const xs = last3.filter(x => x.dom && x.dom[d] != null); examDom[d] = xs.length ? xs.reduce((a, x) => a + x.dom[d], 0) / xs.length : null; });
    const domAcc = Object.fromEntries([1,2,3,4,5].map(d => [d, dom[d].s ? dom[d].c / dom[d].s : null]));
    // weakest domain: prefer recent exam data, fall back to MC accuracy (needs ≥5 answers)
    const score = d => examDom[d] != null ? examDom[d] : (dom[d].s >= 5 ? domAcc[d] : null);
    const ranked = [1,2,3,4,5].filter(d => score(d) != null).sort((a, b) => score(a) - score(b));
    return { answered: s, acc: s ? c / s : null, hardAcc: hs ? hc / hs : null, seen, bankSize: bank.length,
      pbqPassed, pbqTried, pbqTotal: Q.length, acrMastered, acrTotal: PBQ.acr.length,
      hist, last3, avg3, trend: (() => { if (hist.length < 2) return null; const prev = hist.slice(0, -1).slice(-3); const pa = Math.round(prev.reduce((a, x) => a + x.score, 0) / prev.length); return { d: avg3 - pa, since: hist[hist.length - 2].d }; })(), best: hist.length ? Math.max(...hist.map(x => x.score)) : null, domAcc, examDom, weakest: ranked[0], ranked };
  }

  function readiness(m) {
    if (m.avg3 != null) {
      const v = m.avg3, basis = `average of your last ${m.last3.length} practice exam${m.last3.length > 1 ? "s" : ""}`;
      if (v >= 800) return { v, basis, tone: "ok", label: "On track", note: "Keep doing full exams to stay sharp. Consistent 800+ is a strong sign." };
      if (v >= PASS) return { v, basis, tone: "mid", label: "Borderline", note: "You're at the pass line. Aim for 800+ on several exams in a row for a safety margin." };
      return { v, basis, tone: "bad", label: "Not there yet", note: "Focus on your weakest domain below, then retake a practice exam." };
    }
    if (m.answered >= 20) {
      const v = Math.round(100 + 800 * m.acc);
      return { v, basis: "estimated from your multiple-choice accuracy", tone: v >= 800 ? "ok" : v >= PASS ? "mid" : "bad", label: "Estimate", note: "Take a full practice exam for a much better read on readiness." };
    }
    return { v: null, basis: "", tone: "", label: "Not enough data", note: "Answer at least 20 questions or take a practice exam to see an estimate." };
  }

  function tile(label, value, sub) { return `<div class="tile"><div class="tile-v">${value}</div><div class="tile-l">${h(label)}</div>${sub ? `<div class="tile-s">${sub}</div>` : ""}</div>`; }
  function bar(x) { return `<span class="bar"><i class="${cls(x)}" style="width:${x == null ? 0 : Math.round(x * 100)}%"></i></span>`; }

  async function home() {
    const cloud = C(), user = cloud && cloud.user(), prof = cloud && cloud.profile(), m = metrics(), r = readiness(m);
    const dl = cloud ? cloud.daysLeft() : null, date = (store.get("exam-date", "") || "").slice(0, 10);
    const name = user ? ((prof && prof.display_name) || user.email.split("@")[0]) : (cloud && cloud.isGuest() ? "Guest" : "Your progress");
    $("#score").textContent = "";
    const dateLabel = date ? new Date(date + "T12:00:00").toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "";
    const datePill = !date ? `<button class="btn" data-accgo="date">📅 Set exam date</button>`
      : `<button class="btn" data-accgo="date" title="Change exam date">📅 Exam ${h(dateLabel)} · <b>${dl > 0 ? `${dl} day${dl === 1 ? "" : "s"}` : dl === 0 ? "today" : "done"}</b></button>`;
    // readiness card: big score + 100–900 scale with the 750 pass line
    const pos = v => Math.max(0, Math.min(100, (v - 100) / 8));
    const readyCard = r.v == null
      ? `<div class="card ready"><div class="overline">Estimated readiness</div>
          <p style="margin:12px 0 4px;font-size:16px">No estimate yet.</p><p class="muted" style="margin:0 0 16px">Answer 20 multiple-choice questions or take a practice exam to see your estimate.</p>
          <div class="mrow"><button class="btn primary" data-accgo="exam">Take a practice exam</button><button class="btn" data-accgo="mcq">Practice questions</button></div></div>`
      : `<div class="card ready"><div class="overline">Estimated readiness</div>
          <div class="ready-v">${r.v}<span class="of"> / 900</span>${m.trend && m.avg3 != null ? `<span class="trend ${m.trend.d > 0 ? "up" : m.trend.d < 0 ? "down" : ""}" title="Change in your 3-exam average since your ${h(when(m.trend.since))} exam">${m.trend.d > 0 ? "▲ +" : m.trend.d < 0 ? "▼ " : "± "}${m.trend.d} since ${h(when(m.trend.since))}</span>` : ""}</div>
          <div class="scale" role="img" aria-label="Score ${r.v} on a 100 to 900 scale; passing is 750"><b class="tone-${r.tone}" style="width:${pos(r.v)}%"></b><span class="pass" style="left:${pos(PASS)}%"></span></div>
          <div class="scale-l"><span>100</span><span style="margin-left:auto;margin-right:${100 - pos(PASS) - 3}%">750 pass</span><span>900</span></div>
          <div class="mrow" style="margin-top:0"><span class="chip ${r.v >= PASS ? "vis-public" : "vis-pending"}">${r.v >= PASS ? "Above passing" : `${PASS - r.v} points to pass`}</span><span class="chip">${h(r.label)}</span></div>
          <p class="muted" style="margin:10px 0 0">${h(r.basis)}${r.basis ? ". " : ""}${h(r.note)}</p></div>`;
    const focusCard = m.weakest
      ? `<div class="card focus"><div class="overline">Focus next</div>
          <div class="fname">${h(dName(m.weakest))}</div>
          <p class="muted" style="margin:0 0 16px">Your weakest domain · ${WEIGHT[m.weakest]}% of the exam · ${pct(m.examDom[m.weakest] != null ? m.examDom[m.weakest] : m.domAcc[m.weakest])} correct</p>
          <div class="mrow"><button class="btn primary" data-accgo="drill:${m.weakest}">Drill this domain</button><button class="btn" data-accgo="exam">Practice exam</button></div></div>`
      : `<div class="card focus"><div class="overline">Focus next</div>
          <div class="fname">Find your weak spots</div>
          <p class="muted" style="margin:0 0 16px">After about 5 answers per domain (or one practice exam), this card points you at the domain that needs the most work.</p>
          <div class="mrow"><button class="btn primary" data-accgo="mcq">Start practicing</button></div></div>`;
    const missedMC = typeof MC !== "undefined" && MC.missed ? MC.missed() : 0;
    const pbqSt = store.get("pbq-status", {}), failedPBQ = Q.filter(q => pbqSt[q.id] === "fail");
    const goal = window.DAILY ? DAILY.goal() : 20, today = window.DAILY ? DAILY.count() : 0, streak = window.DAILY ? DAILY.streak() : 0;
    const reviewCard = `<div class="card revq"><div class="revq-h"><div><h3 style="margin:0">Review queue</h3><p class="muted" style="margin:2px 0 0">Questions you got wrong the last time you answered them.</p></div>
        <div class="goal-line" title="Daily goal">${today >= goal ? "✓ " : ""}<b>${today}</b> / ${goal} today${streak ? ` · 🔥 ${streak}-day streak` : ""}</div></div>
      <div class="revq-items">
        <div class="revq-i"><span class="revq-n">${missedMC}</span><span>missed multiple choice</span>${missedMC ? `<button class="btn sm primary" data-accgo="review-mc">Start review session</button>` : `<span class="muted">Nothing missed</span>`}</div>
        <div class="revq-i"><span class="revq-n">${failedPBQ.length}</span><span>PBQs to retry</span>${failedPBQ.length ? `<button class="btn sm" data-accgo="review-pbq">Retry first one</button>` : `<span class="muted">None failed</span>`}</div>
      </div></div>`;
    const domRows = [1,2,3,4,5].map(d => `<tr><td data-h="Domain"><div class="dname"><span class="did">${d}.0</span>${h(dName(d))}${d === m.weakest ? ' <span class="chip lvl-hard">Weakest</span>' : ""}</div><div class="dw">${WEIGHT[d]}% of exam</div></td>
      <td data-h="Multiple choice (all time)"><div class="dbar">${bar(m.domAcc[d])}<span class="stat">${m.domAcc[d] == null ? "No answers" : pct(m.domAcc[d])}</span></div></td>
      <td data-h="Last 3 practice exams"><div class="dbar">${bar(m.examDom[d])}<span class="stat">${m.examDom[d] == null ? "No exams" : pct(m.examDom[d])}</span></div></td>
      <td><button class="btn sm ghost" data-accgo="drill:${d}">Drill →</button></td></tr>`).join("");
    const exams = m.last3.length ? `<table class="qlist"><thead><tr><th>Date</th><th>Exam</th><th>Score</th><th>Result</th><th>Time</th><th>Domains</th></tr></thead><tbody>${m.last3.map(x => `<tr>
        <td data-h="Date">${h(when(x.d))}</td><td data-h="Exam">${x.len === "half" ? "Half" : "Full"}${x.lvl === "hard" ? ' <span class="chip lvl-hard">Hard</span>' : ""}</td>
        <td data-h="Score"><b style="font-family:var(--mono)">${h(String(x.score))}</b> <span class="muted">${pct(x.pct)}</span></td>
        <td data-h="Result">${x.score >= PASS ? '<span class="chip vis-public">Pass</span>' : '<span class="chip vis-rejected">Below 750</span>'}</td><td data-h="Time">${fmtTime(x.secs || 0)}</td>
        <td class="mini">${[1,2,3,4,5].map(d => x.dom && x.dom[d] != null ? `<span title="${h(DOMAINS[d])}: ${pct(x.dom[d])}" class="mini-b ${cls(x.dom[d])}" style="height:${Math.max(8, Math.round(x.dom[d] * 34))}px"></span>` : `<span class="mini-b none"></span>`).join("")}</td></tr>`).join("")}</tbody></table>`
      : `<div class="empty"><p class="muted">No practice exams yet. A full exam is the best read on whether you're ready.</p><button class="btn" data-accgo="exam">Take a practice exam</button></div>`;

    // settings vary by mode
    const configured = cloud && cloud.configured();
    const ioRow = `<div class="mrow"><button class="btn" data-accgo="export">Export progress</button><label class="btn">Import progress<input type="file" accept="application/json" id="acc-import" hidden></label></div>`;
    const settings = user ? `
      <div class="card"><h3>Profile</h3>
        <div class="row"><label class="f2">Display name<input type="text" id="acc-name" maxlength="60" value="${h((prof && prof.display_name) || "")}"></label>
        <label class="f2">Exam date<input type="date" id="acc-date" value="${h(date)}"></label><label class="f2">Daily goal<select id="acc-goal">${[10,20,30,50,90].map(n => `<option value="${n}" ${n === goal ? "selected" : ""}>${n} questions a day</option>`).join("")}</select></label></div>
        <div class="mrow"><button class="btn primary" data-accgo="save">Save profile</button></div>
        <p class="muted">${h(user.email)} · role: <b>${h((prof && prof.role) || "user")}</b> · sync: ${h(cloud.statusLabel())}${cloud._status() === "error" && cloud.lastError() ? " — " + h(cloud.lastError()) : ""} <button class="linkbtn" data-accgo="sync">Sync now</button></p></div>
      <div class="card"><h3>Password</h3><div class="row"><label class="f2">New password (12+ characters)<input type="password" id="acc-pw" autocomplete="new-password" minlength="12"></label></div>
        <div class="mrow"><button class="btn" data-accgo="pw">Change password</button></div></div>
      <div class="card"><h3>Your data</h3><p class="muted">Download a backup of your progress, or load one.</p>${ioRow}
        <details><summary class="muted">Danger zone</summary><p class="muted">Deletes all progress, answer history and exam history on every device. Type RESET to confirm.</p>
        <div class="mrow"><input id="acc-reset" placeholder="RESET" style="max-width:140px"><button class="btn danger" data-accgo="reset">Delete my progress</button></div></details></div>
      <div class="mrow"><button class="btn" data-accgo="signout">Sign out</button></div>`
      : `<div class="card"><h3>Exam date &amp; goal</h3><div class="row"><label class="f2">Exam date<input type="date" id="acc-date" value="${h(date)}"></label><label class="f2">Daily goal<select id="acc-goal">${[10,20,30,50,90].map(n => `<option value="${n}" ${n === goal ? "selected" : ""}>${n} questions a day</option>`).join("")}</select></label></div>
        <div class="mrow"><button class="btn primary" data-accgo="save">Save</button></div></div>
      <div class="card"><h3>Your data</h3><p class="muted">${configured ? "You're studying as a guest, so progress is saved in this browser only." : "Progress on this copy is saved in this browser only."} Export a backup to keep it safe or move it to another device.</p>${ioRow}
        ${configured ? `<div class="mrow"><button class="btn primary" data-acct="signup-page">Create an account to sync across devices</button><button class="btn" data-acct="open">Sign in</button></div>` : ""}</div>`;

    $("#main").innerHTML = `
      <div class="acc-head"><div>${user ? '<div class="hello">Welcome back,</div>' : '<div class="hello">Your progress</div>'}<h2>${h(user ? name : (cloud && cloud.isGuest() ? "Guest" : "Progress"))}</h2></div>${datePill}</div>
      <div class="acc-top">${readyCard}${focusCard}</div>
      ${reviewCard}
      <div class="tiles">
        ${tile("Questions answered", m.answered, `${m.seen} of ${m.bankSize} seen`)}
        ${tile("Multiple-choice accuracy", m.acc == null ? '<span class="muted" style="font-size:15px">Not started</span>' : pct(m.acc), m.hardAcc != null ? `Hard questions: ${pct(m.hardAcc)}` : "")}
        ${tile("PBQs passed", `${m.pbqPassed}<span class="muted" style="font-size:15px"> / ${m.pbqTotal}</span>`, `${m.pbqTried} attempted`)}
        ${tile("Acronyms mastered", `${m.acrMastered}<span class="muted" style="font-size:15px"> / ${m.acrTotal}</span>`, "")}
        ${tile("Practice exams", m.hist.length, m.best ? `Best: ${m.best}` : "None yet")}
      </div>
      <div class="card"><h3>Last 3 practice exams</h3>${exams}${m.hist.length > 3 ? `<p class="muted">${m.hist.length} total — full history on the Practice exam tab.</p>` : ""}</div>
      <div class="card"><h3>By domain</h3><p class="muted" style="margin:-6px 0 12px">The tick on each bar marks 80% — a comfortable target for exam day.</p><table class="qlist domtbl"><thead><tr><th>Domain</th><th>Multiple choice (all time)</th><th>Last 3 practice exams</th><th></th></tr></thead><tbody>${domRows}</tbody></table></div>
      <div class="card"><h3>Activity — last 14 days</h3><div id="acc-activity">${user ? '<p class="muted">Loading…</p>' : '<p class="muted">Sign in to track daily activity across devices.</p>'}</div></div>
      <h2 style="margin-top:28px" id="acc-settings">Settings</h2>${settings}<div class="merr" id="acc-msg"></div>`;
    if (user) renderActivity();
  }

  async function renderActivity() {
    const el = $("#acc-activity"); if (!el) return;
    try {
      const rows = actCache && Date.now() - actCache.t < 60000 ? actCache.rows : await C().activity(14);
      actCache = { t: Date.now(), rows };
      const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (13 - i)); return d; });
      const counts = days.map(d => { const n = new Date(d); n.setDate(n.getDate() + 1); const xs = rows.filter(r => { const t = new Date(r.answered_at); return t >= d && t < n; }); return { n: xs.length, c: xs.filter(r => r.correct).length }; });
      const max = Math.max(1, ...counts.map(x => x.n)), streak = (() => { let k = 0; for (let i = counts.length - 1; i >= 0 && counts[i].n > 0; i--) k++; return k; })();
      el.innerHTML = `<div class="act">${counts.map((x, i) => `<div class="act-col" title="${days[i].toLocaleDateString([], { month: "short", day: "numeric" })}: ${x.n} answered, ${x.n ? Math.round(x.c / x.n * 100) : 0}% correct">
          <div class="act-bar" style="height:${Math.round(x.n / max * 70)}px"></div><div class="act-d">${days[i].toLocaleDateString([], { weekday: "narrow" })}</div></div>`).join("")}</div>
        <p class="muted">${rows.length} answers in the last 14 days · current streak: <b>${streak} day${streak === 1 ? "" : "s"}</b></p>`;
    } catch (err) { el.innerHTML = `<p class="muted">Couldn't load activity: ${h(err.message)}</p>`; }
  }

  const msg = (t, ok) => { const e = $("#acc-msg"); if (e) { e.textContent = t; e.className = "merr" + (ok ? " ok" : ""); e.scrollIntoView({ block: "nearest" }); } };
  document.addEventListener("click", async e => {
    if (TAB !== "account") return;
    const b = e.target.closest("[data-accgo]"); if (!b) return;
    const [a, arg] = b.dataset.accgo.split(":"), cloud = C(), v = id => ($("#" + id) || {}).value || "";
    try {
      if (a === "drill") { MC.preset({ doms: [+arg], levels: ["easy","medium","hard"], pool: "all", mode: "study" }); return setTab("mcq"); }
      if (a === "exam") return setTab("exam");
      if (a === "mcq") return setTab("mcq");
      if (a === "review-mc") { setTab("mcq"); if (!MC.review()) msg("Nothing to review."); return; }
      if (a === "review-pbq") { const i = Q.findIndex(q => store.get("pbq-status", {})[q.id] === "fail"); if (i >= 0) { setTab("pbq"); go(i); } return; }
      if (a === "date") { const d = $("#acc-date"); if (d) { d.scrollIntoView({ behavior: "smooth", block: "center" }); d.focus({ preventScroll: true }); try { d.showPicker && d.showPicker(); } catch (x) {} } return; }
      if (a === "save") { await cloud.saveProfile(v("acc-name").trim() || null, v("acc-date")); await home(); return msg("Saved.", true); }
      if (a === "sync") { await cloud.syncNow(); await home(); return msg("Up to date.", true); }
      if (a === "pw") { if (v("acc-pw").length < 12) return msg("Use at least 12 characters."); await cloud.changePassword(v("acc-pw")); $("#acc-pw").value = ""; return msg("Password changed.", true); }
      if (a === "export") return cloud.exportData();
      if (a === "signout") return cloud.signOut();
      if (a === "reset") { if (v("acc-reset") !== "RESET") return msg("Type RESET to confirm."); return cloud.resetAll(); }
    } catch (err) { msg(err.message || String(err)); }
  });
  document.addEventListener("change", async e => {
    if (TAB === "account" && e.target.id === "acc-goal") { store.set("daily-goal", +e.target.value); if (C()) C().renderAcct(); return home(); }
    if (TAB !== "account" || e.target.id !== "acc-import" || !e.target.files[0]) return;
    try { await C().importData(e.target.files[0]); } catch (err) { msg(err.message); }
  });
  // Refresh when sign-in completes or sync status changes while the page is open
  document.addEventListener("cloud:login", () => { if (TAB === "account") home(); });

  window.ACCOUNT = { home };
  if (window.__pendingTab === "account") { window.__pendingTab = null; setTab("account"); }
})();
