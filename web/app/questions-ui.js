// "My questions" (question builder for every signed-in user) and "Admin" (review queue, published questions, users & roles).
// All user-supplied text is escaped with h() before it reaches the DOM.
(() => {
  const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const $ = s => document.querySelector(s);
  const main = () => $("#main");
  const DOM = {1:"1.0 General Security Concepts",2:"2.0 Threats, Vulnerabilities & Mitigations",3:"3.0 Security Architecture",4:"4.0 Security Operations",5:"5.0 Program Management & Oversight"};
  const KIND = { "mc": "Multiple choice", "pbq-match": "PBQ — matching", "pbq-order": "PBQ — ordering" };
  const VIS = { private: ["Private", ""], pending: ["Pending review", "mid"], public: ["Public", "ok"], rejected: ["Changes requested", "bad"] };
  const visChip = v => `<span class="chip vis-${h(v)}">${h((VIS[v] || [v])[0])}</span>`;
  const when = t => t ? new Date(t).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "—";
  const title = q => q.kind === "mc" ? (q.data.q || "") : (q.data.title || "");
  const C = () => window.CLOUD;

  // ---------- shared read-only preview ----------
  function preview(kind, d) {
    const paras = t => String(t || "").split(/\n+/).filter(x => x.trim()).map(x => `<p>${h(x)}</p>`).join("");
    if (kind === "mc") {
      const cs = Array.isArray(d.a) ? d.a : [d.a];
      return `<p class="qtext">${h(d.q)}</p><ul class="opts">${(d.o || []).map((o, i) => `<li><div class="opt ${cs.includes(i) ? "ok" : ""}">${cs.includes(i) ? "✓" : "&nbsp;&nbsp;"} ${h(o)}</div></li>`).join("")}</ul>
        <div class="feedback"><b>Explanation:</b> ${h(d.e)}</div>`;
    }
    const top = `<h3 style="margin:0 0 8px">${h(d.title)}</h3><div class="scenario">${paras(d.scenario)}${d.log ? `<pre class="log">${h(d.log)}</pre>` : ""}</div><p class="task">${h(d.task)}</p>`;
    if (kind === "pbq-match") return top + `<table><thead><tr><th>Item</th><th>${h(d.col || "Answer")}</th></tr></thead><tbody>${(d.rows || []).map(r => `<tr><td>${h(r.l)}${r.w ? `<div class="muted">${h(r.w)}</div>` : ""}</td><td><b>${h(r.a)}</b></td></tr>`).join("")}</tbody></table>
      <p class="muted">Answer options: ${(d.options || []).map(h).join(" · ")}</p><div class="feedback"><b>Key takeaway:</b> ${h(d.explain)}</div>`;
    return top + `<ol>${(d.items || []).map(x => `<li>${h(x)}</li>`).join("")}</ol><div class="feedback"><b>Key takeaway:</b> ${h(d.explain)}</div>`;
  }

  // ---------- client-side validation (server re-validates) ----------
  function validate(kind, d) {
    const e = [], len = (s, a, b, name) => { const n = String(s || "").trim().length; if (n < a || n > b) e.push(`${name} must be ${a}–${b} characters.`); };
    if (kind === "mc") {
      len(d.q, 5, 1500, "Question"); len(d.e, 1, 2000, "Explanation");
      if (!Array.isArray(d.o) || d.o.length < 2 || d.o.length > 8) e.push("Provide 2–8 options.");
      if ((d.o || []).some(o => !o.trim())) e.push("Options can't be blank.");
      if (new Set((d.o || []).map(o => o.trim().toLowerCase())).size !== (d.o || []).length) e.push("Options must be different from each other.");
      const cs = Array.isArray(d.a) ? d.a : (d.a == null ? [] : [d.a]);
      if (!cs.length) e.push("Mark the correct answer.");
      if (cs.length > 1 && cs.length >= (d.o || []).length) e.push("Leave at least one wrong option.");
      if (cs.length > 1 && !/choose/i.test(d.q || "")) e.push(`Multi-answer questions should say "(Choose ${cs.length === 2 ? "two" : cs.length === 3 ? "three" : cs.length}.)" in the question.`);
    } else {
      len(d.title, 3, 120, "Title"); len(d.scenario, 1, 4000, "Scenario"); len(d.task, 1, 300, "Task"); len(d.explain, 1, 1000, "Key takeaway");
      if ((d.log || "").length > 6000) e.push("Exhibit is limited to 6000 characters.");
      if (kind === "pbq-match") {
        if (!d.options || d.options.length < 2 || d.options.length > 20) e.push("Provide 2–20 answer options (one per line).");
        if (!d.rows || d.rows.length < 2 || d.rows.length > 15) e.push("Provide 2–15 items.");
        (d.rows || []).forEach((r, i) => { if (!r.l.trim()) e.push(`Item ${i + 1} needs a label.`); if (!(d.options || []).includes(r.a)) e.push(`Pick an answer for item ${i + 1}.`); });
      } else {
        if (!d.items || d.items.length < 3 || d.items.length > 10) e.push("Provide 3–10 steps.");
        if ((d.items || []).some(x => !x.trim())) e.push("Steps can't be blank.");
      }
    }
    return e;
  }

  // ---------- My questions ----------
  let ED = null, LIST = null, busy = false;
  const blank = kind => ({ id: null, kind, domain: 4, level: "medium", visibility: "private",
    data: kind === "mc" ? { q: "", o: ["", "", "", ""], a: null, e: "" }
        : kind === "pbq-match" ? { title: "", scenario: "", log: "", task: "Match each item to the correct answer.", col: "Answer", options: [], rows: [{ l: "", a: "", w: "" }, { l: "", a: "", w: "" }], explain: "" }
        : { title: "", scenario: "", log: "", task: "Put the steps in the correct order (first at the top).", items: ["", "", ""], explain: "" } });

  function gate() {
    if (!C() || !C().configured()) { main().innerHTML = `<h2>My questions</h2><div class="card"><p>Writing your own questions needs cloud sync (Supabase), so your questions are saved to your account and can be shared after review.</p><p class="muted">This copy of the app is running in local-only mode. See DEPLOY.md to connect Supabase.</p></div>`; return false; }
    if (!C().user()) { main().innerHTML = `<h2>My questions</h2><div class="card"><p>Sign in to write your own multiple-choice and performance-based questions. They're private to you until you submit them for an admin to review and share with everyone.</p><div class="actions"><button class="btn primary" data-acct="open">Sign in</button></div></div>`; return false; }
    return true;
  }
  async function home() {
    $("#score").textContent = "My questions";
    if (!gate()) return;
    if (ED) return editor();
    main().innerHTML = `<h2>My questions</h2><p class="muted">Loading…</p>`;
    try { LIST = (await C().questions.mine()).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")); }
    catch (err) { main().innerHTML = `<h2>My questions</h2><div class="err">${h(err.message)}</div>`; return; }
    const counts = Object.fromEntries(Object.keys(VIS).map(v => [v, LIST.filter(q => q.visibility === v).length]));
    main().innerHTML = `<h2>My questions</h2>
      <p class="muted">Your questions show up in the Performance-based, Multiple choice and Practice exam tabs with a <span class="chip chip-custom">Custom</span> tag. Private questions are yours only. Submit one for review to share it with everyone after an admin approves it.</p>
      <div class="actions"><button class="btn primary" data-mine="new:mc">+ Multiple choice</button><button class="btn" data-mine="new:pbq-match">+ PBQ (matching)</button><button class="btn" data-mine="new:pbq-order">+ PBQ (ordering)</button>
        <span class="muted" style="margin-left:auto">${LIST.length} total · ${counts.public} public · ${counts.pending} pending</span></div>
      ${LIST.length ? `<table class="qlist"><thead><tr><th>Question</th><th>Type</th><th>Domain</th><th>Status</th><th></th></tr></thead><tbody>${LIST.map(q => `<tr>
        <td data-h="Question"><b>${h(title(q).slice(0, 110))}${title(q).length > 110 ? "…" : ""}</b><div class="muted">${h(q.level)} · updated ${when(q.updated_at)}</div>
          ${q.review_note && q.visibility !== "public" ? `<div class="muted" style="color:var(--bad)">Reviewer: ${h(q.review_note)}</div>` : ""}</td>
        <td data-h="Type">${h(KIND[q.kind])}</td><td data-h="Domain">${h(String(q.domain))}.0</td><td data-h="Status">${visChip(q.visibility)}</td>
        <td data-h="Actions" class="qact"><button class="btn sm" data-mine="edit:${h(q.id)}">Edit</button>
          ${q.visibility === "private" || q.visibility === "rejected" ? `<button class="btn sm" data-mine="submit:${h(q.id)}">Submit for sharing</button>` : ""}
          ${q.visibility === "pending" ? `<button class="btn sm" data-mine="private:${h(q.id)}">Withdraw</button>` : ""}
          <button class="btn sm" data-mine="del:${h(q.id)}">Delete</button></td></tr>`).join("")}</tbody></table>`
      : `<div class="card"><p>No questions yet. Ideas worth writing up:</p><ul><li>Something from work, like an Intune policy decision or a vulnerability scan finding, turned into a scenario</li><li>A topic you keep missing in practice</li><li>A command-line or log exhibit you've seen (sanitize real IPs and names)</li></ul></div>`}
      <div class="merr" id="mine-msg"></div>`;
  }

  function opt(v, cur, label) { return `<option value="${h(v)}" ${String(v) === String(cur) ? "selected" : ""}>${h(label ?? v)}</option>`; }
  function editor(errors) {
    const q = ED, d = q.data;
    const head = `<div class="row"><label class="f2">Domain<select data-ed="domain">${[1,2,3,4,5].map(n => opt(n, q.domain, DOM[n])).join("")}</select></label>
      <label class="f2">Difficulty<select data-ed="level">${["easy","medium","hard"].map(l => opt(l, q.level, l[0].toUpperCase() + l.slice(1))).join("")}</select></label></div>`;
    let body = "";
    if (q.kind === "mc") {
      const cs = Array.isArray(d.a) ? d.a : (d.a == null ? [] : [d.a]);
      body = `<label class="f">Question<textarea data-ed="q" rows="3" maxlength="1500" placeholder="Which control BEST…">${h(d.q)}</textarea></label>
        <div class="f"><span>Options — tick every correct answer (tick 2+ for a "Choose two" question)</span>
        ${d.o.map((o, i) => `<div class="edrow"><input type="checkbox" data-ed-correct="${i}" ${cs.includes(i) ? "checked" : ""} title="Correct answer"><input type="text" data-ed-opt="${i}" value="${h(o)}" maxlength="300" placeholder="Option ${i + 1}"><button class="btn sm" data-mine="delopt:${i}" ${d.o.length <= 2 ? "disabled" : ""} aria-label="Remove option">×</button></div>`).join("")}
        ${d.o.length < 8 ? `<button class="btn sm" data-mine="addopt">+ Add option</button>` : ""}</div>
        <label class="f">Explanation (why the answer is right, and why the tempting wrong ones are wrong)<textarea data-ed="e" rows="4" maxlength="2000">${h(d.e)}</textarea></label>`;
    } else {
      body = `<label class="f">Title<input type="text" data-ed="title" value="${h(d.title)}" maxlength="120" placeholder="e.g. Investigate a suspicious login"></label>
        <label class="f">Scenario (plain text; blank lines start a new paragraph)<textarea data-ed="scenario" rows="4" maxlength="4000">${h(d.scenario)}</textarea></label>
        <label class="f">Exhibit — optional log, config, or command output (shown in a monospace box)<textarea data-ed="log" rows="5" maxlength="6000" class="mono">${h(d.log)}</textarea></label>
        <label class="f">Task (instruction line)<input type="text" data-ed="task" value="${h(d.task)}" maxlength="300"></label>`;
      if (q.kind === "pbq-match") {
        body += `<div class="row"><label class="f2">Answer column heading<input type="text" data-ed="col" value="${h(d.col)}" maxlength="40"></label></div>
          <label class="f">Answer options — one per line (these fill every dropdown)<textarea data-ed="options" rows="5">${h((d.options || []).join("\n"))}</textarea></label>
          <div class="f"><span>Items — each one gets a dropdown; pick its correct answer</span>
          ${d.rows.map((r, i) => `<div class="edrow"><input type="text" data-ed-rl="${i}" value="${h(r.l)}" maxlength="300" placeholder="Item ${i + 1} (e.g. Port 636)"><select data-ed-ra="${i}"><option value="">— correct answer —</option>${(d.options || []).map(o => opt(o, r.a)).join("")}</select>
            <input type="text" data-ed-rw="${i}" value="${h(r.w)}" maxlength="600" placeholder="Why (optional)"><button class="btn sm" data-mine="delrow:${i}" ${d.rows.length <= 2 ? "disabled" : ""} aria-label="Remove item">×</button></div>`).join("")}
          ${d.rows.length < 15 ? `<button class="btn sm" data-mine="addrow">+ Add item</button>` : ""}</div>`;
      } else {
        body += `<div class="f"><span>Steps — enter them in the CORRECT order (the app shuffles them)</span>
          ${d.items.map((x, i) => `<div class="edrow"><span class="pos">${i + 1}</span><input type="text" data-ed-item="${i}" value="${h(x)}" maxlength="300">
            <button class="btn sm" data-mine="up:${i}" ${i === 0 ? "disabled" : ""} aria-label="Move up">↑</button><button class="btn sm" data-mine="down:${i}" ${i === d.items.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
            <button class="btn sm" data-mine="delitem:${i}" ${d.items.length <= 3 ? "disabled" : ""} aria-label="Remove step">×</button></div>`).join("")}
          ${d.items.length < 10 ? `<button class="btn sm" data-mine="additem">+ Add step</button>` : ""}</div>`;
      }
      body += `<label class="f">Key takeaway (shown after answering)<textarea data-ed="explain" rows="3" maxlength="1000">${h(d.explain)}</textarea></label>`;
    }
    main().innerHTML = `<div class="meta"><span class="chip">${h(KIND[q.kind])}</span>${q.id ? visChip(q.visibility) : '<span class="chip">New</span>'}</div>
      <h2>${q.id ? "Edit question" : "New question"}</h2>
      ${q.visibility === "public" ? `<div class="card muted">This question is public. Saving changes sends it back to an admin for review.</div>` : ""}
      <div class="card editor">${head}${body}</div>
      ${errors && errors.length ? `<div class="err"><b>Fix before saving:</b><ul>${errors.map(x => `<li>${h(x)}</li>`).join("")}</ul></div>` : ""}
      <div class="actions"><button class="btn primary" data-mine="save:private">Save (private)</button><button class="btn" data-mine="save:pending">Save &amp; submit for sharing</button>
        <button class="btn" data-mine="preview">Preview</button><button class="btn" data-mine="cancel" style="margin-left:auto">Cancel</button></div>
      <div class="merr" id="mine-msg"></div><div id="mine-preview"></div>`;
  }
  // Pull every field from the form into ED
  function read() {
    if (!ED) return; const d = ED.data, v = s => { const el = $(`[data-ed="${s}"]`); return el ? el.value : undefined; };
    if (v("domain")) ED.domain = +v("domain"); if (v("level")) ED.level = v("level");
    if (ED.kind === "mc") {
      d.q = v("q") ?? d.q; d.e = v("e") ?? d.e;
      d.o = d.o.map((o, i) => { const el = $(`[data-ed-opt="${i}"]`); return el ? el.value : o; });
      const cs = d.o.map((_, i) => i).filter(i => { const el = $(`[data-ed-correct="${i}"]`); return el && el.checked; });
      d.a = cs.length === 0 ? null : cs.length === 1 ? cs[0] : cs;
    } else {
      ["title","scenario","log","task","explain","col"].forEach(k => { const x = v(k); if (x !== undefined) d[k] = x; });
      if (ED.kind === "pbq-match") {
        const o = v("options"); if (o !== undefined) d.options = [...new Set(o.split("\n").map(x => x.trim()).filter(Boolean))];
        d.rows = d.rows.map((r, i) => ({ l: ($(`[data-ed-rl="${i}"]`) || {}).value ?? r.l, a: ($(`[data-ed-ra="${i}"]`) || {}).value ?? r.a, w: ($(`[data-ed-rw="${i}"]`) || {}).value ?? r.w }));
      } else d.items = d.items.map((x, i) => ($(`[data-ed-item="${i}"]`) || {}).value ?? x);
    }
  }
  function clean(kind, d) {   // trim + drop empty optional fields before saving
    const t = s => String(s || "").trim();
    if (kind === "mc") return { q: t(d.q), o: d.o.map(t), a: d.a, e: t(d.e) };
    const base = { title: t(d.title), scenario: t(d.scenario), task: t(d.task), explain: t(d.explain) };
    if (t(d.log)) base.log = String(d.log).replace(/\s+$/, "");
    if (kind === "pbq-match") return Object.assign(base, { col: t(d.col) || "Answer", options: d.options, rows: d.rows.map(r => ({ l: t(r.l), a: r.a, w: t(r.w) })) });
    return Object.assign(base, { items: d.items.map(t) });
  }
  const msg = (t, ok) => { const e = $("#mine-msg") || $("#adm-msg"); if (e) { e.textContent = t; e.className = "merr" + (ok ? " ok" : ""); } };

  document.addEventListener("click", async e => {
    if (TAB !== "mine") return;
    const b = e.target.closest("[data-mine]"); if (!b || busy) return;
    const [act, arg] = b.dataset.mine.split(":");
    const ops = {
      new: () => { ED = blank(arg); editor(); },
      edit: () => { const q = LIST.find(x => x.id === arg); ED = JSON.parse(JSON.stringify({ id: q.id, kind: q.kind, domain: q.domain, level: q.level, visibility: q.visibility, data: q.data }));
        if (ED.kind !== "mc") ED.data.log = ED.data.log || ""; if (ED.kind === "pbq-match") ED.data.rows = ED.data.rows.map(r => Object.assign({ w: "" }, r)); editor(); },
      cancel: () => { ED = null; home(); },
      addopt: () => { read(); ED.data.o.push(""); editor(); },
      delopt: () => { read(); const i = +arg; ED.data.o.splice(i, 1); const cs = (Array.isArray(ED.data.a) ? ED.data.a : ED.data.a == null ? [] : [ED.data.a]).filter(x => x !== i).map(x => x > i ? x - 1 : x); ED.data.a = cs.length ? (cs.length === 1 ? cs[0] : cs) : null; editor(); },
      addrow: () => { read(); ED.data.rows.push({ l: "", a: "", w: "" }); editor(); },
      delrow: () => { read(); ED.data.rows.splice(+arg, 1); editor(); },
      additem: () => { read(); ED.data.items.push(""); editor(); },
      delitem: () => { read(); ED.data.items.splice(+arg, 1); editor(); },
      up: () => { read(); const i = +arg, a = ED.data.items; [a[i - 1], a[i]] = [a[i], a[i - 1]]; editor(); },
      down: () => { read(); const i = +arg, a = ED.data.items; [a[i + 1], a[i]] = [a[i], a[i + 1]]; editor(); },
      preview: () => { read(); $("#mine-preview").innerHTML = `<div class="card"><h3>Preview (with answers)</h3>${preview(ED.kind, clean(ED.kind, ED.data))}</div>`; },
      save: async () => {
        read(); const data = clean(ED.kind, ED.data), errs = validate(ED.kind, data);
        if (errs.length) return editor(errs);
        busy = true; b.disabled = true;
        try {
          const vis = arg === "pending" ? "pending" : (ED.visibility === "public" ? "public" : "private");
          await C().questions.save({ id: ED.id, kind: ED.kind, domain: ED.domain, level: ED.level, data, visibility: vis });
          ED = null; await home(); msg(vis === "pending" ? "Saved and submitted for review." : "Saved.", true);
        } catch (err) { msg(err.message); b.disabled = false; } finally { busy = false; }
      },
      submit: async () => { await C().questions.setVis(arg, "pending"); await home(); msg("Submitted for review.", true); },
      private: async () => { await C().questions.setVis(arg, "private"); await home(); msg("Withdrawn — now private.", true); },
      del: async () => {
        if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirm delete"; b.classList.add("danger"); return; }
        await C().questions.remove(arg); await home(); msg("Deleted.", true);
      }
    };
    try { busy = act !== "save"; await (ops[act] || (() => {}))(); } catch (err) { msg(err.message); } finally { if (act !== "save") busy = false; }
  });
  document.addEventListener("change", e => {   // options textarea drives the answer dropdowns
    if (TAB === "mine" && ED && ED.kind === "pbq-match" && e.target.dataset && e.target.dataset.ed === "options") { read(); editor(); }
  });

  // ---------- Admin ----------
  let AV = "queue";
  async function adminHome() {
    $("#score").textContent = "Admin";
    if (!C() || !C().isAdmin()) { main().innerHTML = `<h2>Admin</h2><div class="card">Admins only.</div>`; return; }
    const sub = (v, l) => `<button class="tab ${AV === v ? "on" : ""}" data-adm-view="${v}">${l}</button>`;
    main().innerHTML = `<h2>Admin</h2><div class="tabs" style="display:inline-flex;margin-bottom:14px">${sub("queue","Review queue")}${sub("public","Published")}${sub("users","Users & roles")}</div><div id="adm-body"><p class="muted">Loading…</p></div><div class="merr" id="adm-msg"></div>`;
    try {
      if (AV === "users") return users();
      const [qs, profs] = await Promise.all([C().questions.byVis(AV === "queue" ? "pending" : "public"), C().questions.profiles()]);
      const who = Object.fromEntries(profs.map(p => [p.id, p]));
      $("#adm-body").innerHTML = qs.length ? qs.sort((a, b) => (a.updated_at || "").localeCompare(b.updated_at || "")).map(q => {
        const p = who[q.owner_id] || {};
        return `<div class="card"><div class="meta"><span class="chip">${h(KIND[q.kind])}</span><span class="chip">${h(DOM[q.domain])}</span><span class="chip">${h(q.level)}</span>${visChip(q.visibility)}
          <span class="muted">by ${h(p.display_name || "?")} (${h(p.email || "")}) · updated ${when(q.updated_at)}</span></div>
          ${preview(q.kind, q.data)}
          <div class="mrow" style="margin-top:12px"><input type="text" data-adm-note="${h(q.id)}" maxlength="500" placeholder="Note to the author (required to request changes)" style="flex:1;min-width:220px" value="${h(q.review_note || "")}">
          ${AV === "queue" ? `<button class="btn primary" data-adm="approve:${h(q.id)}">Approve &amp; publish</button><button class="btn" data-adm="reject:${h(q.id)}">Request changes</button>`
                           : `<button class="btn" data-adm="unpublish:${h(q.id)}">Unpublish</button>`}</div></div>`;
      }).join("") : `<div class="card muted">${AV === "queue" ? "Nothing waiting for review." : "No published custom questions yet."}</div>`;
    } catch (err) { $("#adm-body").innerHTML = `<div class="err">${h(err.message)}</div>`; }
  }
  async function users() {
    const us = await C().questions.users(), me = C().user().id;
    $("#adm-body").innerHTML = `<table class="qlist"><thead><tr><th>User</th><th>Role</th><th>Answers</th><th>Accuracy</th><th>Exams (best)</th><th>Last active</th></tr></thead><tbody>${us.map(u => `<tr>
      <td data-h="User"><b>${h(u.display_name || "—")}</b>${u.id === me ? ' <span class="chip">you</span>' : ""}<div class="muted">${h(u.email || "")} · joined ${when(u.created_at)}</div></td>
      <td data-h="Role"><select data-adm-role="${h(u.id)}">${["user","admin"].map(r => `<option ${u.role === r ? "selected" : ""}>${r}</option>`).join("")}</select></td>
      <td data-h="Answers">${h(String(u.answers))}</td><td data-h="Accuracy">${u.accuracy == null ? "—" : Math.round(u.accuracy * 100) + "%"}</td>
      <td data-h="Exams">${h(String(u.exams))}${u.best_score ? ` (${h(String(u.best_score))})` : ""}</td><td data-h="Last active">${when(u.last_active)}</td></tr>`).join("")}</tbody></table>
      <p class="muted">Admins can review and publish shared questions and see this page. The last remaining admin can't be demoted.</p>`;
  }
  document.addEventListener("click", async e => {
    if (TAB !== "admin") return;
    const v = e.target.closest("[data-adm-view]"); if (v) { AV = v.dataset.admView; return adminHome(); }
    const b = e.target.closest("[data-adm]"); if (!b) return;
    const [act, id] = b.dataset.adm.split(":"), note = (($(`[data-adm-note="${id}"]`) || {}).value || "").trim();
    try {
      if (act === "reject" && !note) return msg("Add a note so the author knows what to change.");
      b.disabled = true;
      await C().questions.review(id, act === "approve" ? "public" : act === "reject" ? "rejected" : "private", act === "unpublish" ? (note || "Unpublished by an admin") : note);
      await adminHome(); msg(act === "approve" ? "Published." : act === "reject" ? "Sent back to the author." : "Unpublished.", true);
    } catch (err) { msg(err.message); b.disabled = false; }
  });
  document.addEventListener("change", async e => {
    if (TAB !== "admin" || !e.target.dataset || !e.target.dataset.admRole) return;
    try { await C().questions.setRole(e.target.dataset.admRole, e.target.value); msg("Role updated.", true); }
    catch (err) { msg(err.message); await users(); }
  });
  // Refresh these tabs when sign-in completes while they're open
  document.addEventListener("cloud:login", () => { if (TAB === "mine") home(); if (TAB === "admin") adminHome(); });

  window.MINE = { home };
  window.ADMIN = { home: adminHome };
  if (window.__pendingTab === "mine" || window.__pendingTab === "admin") { const t = window.__pendingTab; window.__pendingTab = null; setTab(t); }
})();
