// Learn: one page per SY0-701 objective (content in /learn/*.js), plus "Read about this" links used across the app.
window.LEARN = (() => {
  const $ = s => document.querySelector(s);
  const e = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const OB = () => window.OBJECTIVES || {};
  const L = () => PBQ.learn || {};
  const pct = x => x == null ? "—" : Math.round(x * 100) + "%";
  const done = () => store.get("learn-done", {});
  const codes = () => Object.keys(OB());

  function stats(k) {
    const mc = store.get("mcq-stats", {}), ps = store.get("pbq-status", {});
    const qs = PBQ.mc.filter(q => q.obj === k), pq = (typeof Q !== "undefined" ? Q : []).filter(q => q.obj === k);
    let s = 0, c = 0; qs.forEach(q => { const t = mc[q.id]; if (t) { s += t.s; c += t.c; } });
    return { n: qs.length, p: pq.length, s, acc: s ? c / s : null, pbqPassed: pq.filter(q => ps[q.id] === "pass").length };
  }
  const weak = st => st.s >= 3 && st.acc < 0.7;

  function link(k, text) {
    if (!k || !L()[k]) return "";
    return `<button type="button" class="linkbtn learn-link" data-learn="${e(k)}">📖 ${e(text || `Read: ${k} ${OB()[k] || ""}`)} →</button>`;
  }

  function home() {
    const d = done(), all = codes();
    $("#score").textContent = `${all.filter(k => d[k]).length} / ${all.length} objectives reviewed`;
    try { history.replaceState(null, "", "#learn"); } catch (x) {}
    const ranked = all.map(k => ({ k, st: stats(k) })).filter(x => x.st.s >= 3).sort((a, b) => a.st.acc - b.st.acc).slice(0, 3);
    const card = k => { const st = stats(k), w = weak(st);
      return `<button type="button" class="lcard${d[k] ? " done" : ""}${w ? " weak" : ""}" data-learn="${e(k)}">
        <span class="lcode">${e(k)}</span><span class="lname">${e(OB()[k])}</span>
        <span class="lmeta">${st.n} questions${st.p ? ` · ${st.p} PBQ${st.p > 1 ? "s" : ""}` : ""} · ${st.s ? pct(st.acc) + " correct" : "not practiced"}</span>
        <span class="lflags">${w ? '<span class="chip lvl-hard">Needs work</span>' : ""}${d[k] ? '<span class="chip vis-public">✓ Reviewed</span>' : ""}</span></button>`; };
    $("#main").innerHTML = `
      <h2>Learn</h2>
      <p class="muted" style="margin-top:-8px">One page for each SY0-701 exam objective: what it covers, the key terms, the look-alike answers that trip people up, and exam tips. Read a page, then drill its questions.</p>
      ${ranked.length ? `<div class="card focus"><div class="overline">Start with your weakest</div><div class="lweak">${ranked.map(x => `<button type="button" class="btn" data-learn="${e(x.k)}"><b>${e(x.k)}</b> ${e(OB()[x.k])} <span class="muted">${pct(x.st.acc)}</span></button>`).join("")}</div></div>` : ""}
      ${[1, 2, 3, 4, 5].map(dm => `<h3 class="ldom">${e(DOMAINS[dm])}</h3><div class="lgrid">${all.filter(k => +k[0] === dm).map(card).join("")}</div>`).join("")}`;
    window.scrollTo(0, 0);
  }

  function page(k) {
    const x = L()[k]; if (!x) return home();
    const st = stats(k), d = done(), all = codes(), i = all.indexOf(k);
    const prev = all[i - 1], next = all[i + 1];
    const pbqs = (typeof Q !== "undefined" ? Q : []).map((q, idx) => ({ q, idx })).filter(o => o.q.obj === k);
    try { history.replaceState(null, "", "#learn-" + k); } catch (err) {}
    $("#score").textContent = `Learn · ${k}`;
    $("#main").innerHTML = `
      <div class="meta"><button type="button" class="chip lback" data-learn-home>← All objectives</button><span class="chip dom">${e(DOMAINS[+k[0]])}</span>${weak(st) ? '<span class="chip lvl-hard">Needs work</span>' : ""}</div>
      <h2><span class="lcode big">${e(k)}</span> ${e(OB()[k])}</h2>
      <p class="lsum">${e(x.summary)}</p>
      <div class="lbar card">
        <div><div class="overline">Your practice</div><div class="lstat">${st.s ? `<b>${pct(st.acc)}</b> correct on ${st.s} answer${st.s > 1 ? "s" : ""}` : "Not practiced yet"} · ${st.n} questions${st.p ? ` · ${st.pbqPassed}/${st.p} PBQs passed` : ""}</div></div>
        <div class="mrow" style="margin:0"><button class="btn primary" data-learn-drill="${e(k)}" ${st.n ? "" : "disabled"}>Practice these ${st.n} questions</button>
          <label class="ldone"><input type="checkbox" data-learn-done="${e(k)}" ${d[k] ? "checked" : ""}> I've reviewed this</label></div>
      </div>
      <div class="card"><h3>Key concepts</h3><dl class="ldl">${x.concepts.map(([t, m]) => `<div><dt>${e(t)}</dt><dd>${e(m)}</dd></div>`).join("")}</dl></div>
      <div class="card ltraps"><h3>Look-alikes and traps</h3><ul>${x.traps.map(t => `<li>${e(t)}</li>`).join("")}</ul></div>
      <div class="card ltips"><h3>Exam tips</h3><ul>${x.tips.map(t => `<li>${e(t)}</li>`).join("")}</ul></div>
      ${pbqs.length ? `<div class="card"><h3>Performance-based practice</h3><div class="lpbqs">${pbqs.map(o => `<button type="button" class="btn" data-learn-pbq="${o.idx}">${e(o.q.title)}</button>`).join("")}</div></div>` : ""}
      <p class="muted">More on this domain: <button type="button" class="linkbtn" data-ccreview="${+k[0]}">${e(DOMAINS[+k[0]])} in the Crash course →</button></p>
      <div class="actions"><button class="btn" data-learn="${e(prev || "")}" ${prev ? "" : "disabled"}>← ${prev ? e(prev) : ""}</button>
        <button class="btn primary" data-learn="${e(next || "")}" ${next ? "" : "disabled"} style="margin-left:auto">${next ? `${e(next)} ${e(OB()[next])}` : "Done"} →</button></div>`;
    window.scrollTo(0, 0);
  }

  function open(k) { if (window.TAB_NOW !== "learn") setTab("learn"); if (k) page(k); }

  document.addEventListener("click", ev => {
    const a = ev.target.closest("[data-learn]"); if (a && a.dataset.learn) { ev.preventDefault(); return open(a.dataset.learn); }
    if (ev.target.closest("[data-learn-home]")) return home();
    const dr = ev.target.closest("[data-learn-drill]"); if (dr) { const k = dr.dataset.learnDrill; MC.preset({ doms: [+k[0]], levels: ["easy", "medium", "hard"], pool: "all", mode: "study", obj: k }); return setTab("mcq"); }
    const pb = ev.target.closest("[data-learn-pbq]"); if (pb) { setTab("pbq"); go(+pb.dataset.learnPbq); }
  });
  document.addEventListener("change", ev => {
    const c = ev.target.closest && ev.target.closest("[data-learn-done]"); if (!c) return;
    const d = done(), k = c.dataset.learnDone; if (c.checked) d[k] = 1; else delete d[k]; store.set("learn-done", d);
  });

  return { home, open, link, stats };
})();
