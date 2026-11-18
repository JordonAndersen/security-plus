// Interactive diagram PBQs.
//   type "build": place appliances from a toolbox into numbered slots on a network diagram (drag, tap-tap, or the slot's dropdown).
//   type "topo":  click devices on a network diagram to inspect them (processes, connections, logs…) and classify each one.
// Both can add grid-style follow-up questions underneath (rows/cols/opts, same format as type "grid").
// Answers live in a plain object ("vals") owned by the caller: keys "s:<slot>" and "n:<node>".
window.DIAG = (() => {
  const S = {};   // per-question UI state: { q, vals, sel, tab, arm, reveal, marks }
  const e = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ICON = {
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9.5 4.25 4.25 0 0 0 7 18z"/>',
    firewall: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
    router: '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 16.5h.01M11 16.5h.01M8 9.5a5 5 0 0 1 8 0M5.5 7a8.5 8.5 0 0 1 13 0"/>',
    switch: '<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01"/>',
    server: '<rect x="4" y="3" width="16" height="8" rx="1.5"/><rect x="4" y="13" width="16" height="8" rx="1.5"/><path d="M8 7h.01M8 17h.01"/>',
    pc: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
    laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2 19h20"/>',
    db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M2 9a14.5 14.5 0 0 1 20 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    camera: '<path d="M3 7h12v10H3zM15 10.5l6-3.5v10l-6-3.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ICON.server}</svg>`;
  const slug = v => "c-" + String(v || "").toLowerCase().split(/[^a-z]/)[0];
  const keys = q => [...(q.slots || []).map(s => "s:" + s.id), ...(q.nodes || []).filter(n => n.a !== undefined).map(n => "n:" + n.id)];

  function html(q, vals, opts = {}) {
    const st = S[q.id] = Object.assign(S[q.id] || {}, { q, vals, reveal: !!opts.reveal, marks: opts.marks || null });
    const nodes = q.nodes || [], slots = q.slots || [], all = [...nodes, ...slots];
    if (st.sel && !nodes.some(n => n.id === st.sel)) st.sel = null;
    const at = id => all.find(n => n.id === id);
    const lines = (q.links || []).map(([a, b, style]) => { const A = at(a), B = at(b);
      return A && B ? `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" vector-effect="non-scaling-stroke" class="${style === "dashed" ? "dash" : ""}"/>` : ""; }).join("");
    const zones = (q.zones || []).map(z => `<div class="dzone" style="left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%"><span>${e(z.label)}</span></div>`).join("");
    const mk = k => st.marks && k in st.marks ? (st.marks[k] ? " ok" : " bad") : "";
    const nodeH = n => {
      const k = "n:" + n.id, v = vals[k] || "", cls = n.a !== undefined, insp = cls || n.views;
      return `<button type="button" class="dnode${insp ? " insp" : ""}${st.sel === n.id ? " sel" : ""}${mk(k)}" style="left:${n.x}%;top:${n.y}%" ${insp ? `data-dnode="${e(n.id)}" data-dq="${e(q.id)}"` : 'tabindex="-1" disabled'}
        aria-label="${e(n.label)}${n.ip ? " " + e(n.ip) : ""}${cls ? ": " + e(v || "not classified") : ""}">
        <span class="dicon">${icon(n.icon)}</span><span class="dlabel">${e(n.label)}</span>${n.ip ? `<span class="dip">${e(n.ip)}</span>` : ""}
        ${cls ? `<span class="dbadge${v ? " " + slug(v) : ""}">${e(v || "?")}</span>` : ""}</button>`;
    };
    const slotH = s => {
      const k = "s:" + s.id, v = vals[k] || "";
      return `<div class="dslot${v ? " filled" : ""}${mk(k)}${st.arm ? " armed" : ""}" style="left:${s.x}%;top:${s.y}%" data-dslot="${e(s.id)}" data-dq="${e(q.id)}">
        <span class="dnum">${e(s.n || s.id)}</span>
        <select data-dkey="${k}" data-dq="${e(q.id)}" aria-label="Position ${e(s.n || s.id)}: ${e(s.hint || "")}"><option value="" ${v ? "" : "selected"}>Choose…</option>${(q.devices || []).map(d => `<option ${d === v ? "selected" : ""}>${e(d)}</option>`).join("")}</select></div>`;
    };
    let below = "";
    if (q.type === "build") {
      below = `<ol class="dpos">${slots.map(s => { const k = "s:" + s.id, v = vals[k];
        return `<li class="${mk(k).trim()}"><span class="dnum">${e(s.n || s.id)}</span><div><span>${e(s.hint || "")}</span>${v ? ` <span class="muted">— ${e(v)}</span>` : ""}
          ${st.reveal ? `<div class="dwhy"><b>${e(s.a)}</b> — ${e(s.w || "")}</div>` : ""}</div></li>`; }).join("")}</ol>`;
    } else {
      const n = st.sel && nodes.find(x => x.id === st.sel), cl = nodes.filter(x => x.a !== undefined), done = cl.filter(x => vals["n:" + x.id]).length;
      if (!n) below = `<div class="dpanel empty"><p>Select a device in the diagram to inspect it.</p><p class="muted">${done} of ${cl.length} devices classified.</p></div>`;
      else {
        const tabs = Object.keys(n.views || {}); if (!tabs.includes(st.tab)) st.tab = tabs[0];
        const k = "n:" + n.id, v = vals[k] || "";
        below = `<div class="dpanel"><div class="dp-h"><span class="dicon">${icon(n.icon)}</span><div class="dp-t"><b>${e(n.label)}</b>${n.ip ? ` <span class="dip">${e(n.ip)}</span>` : ""}${n.role ? `<div class="muted">${e(n.role)}</div>` : ""}</div>
          ${n.a !== undefined ? `<label class="dp-status${mk(k)}">Status<select data-dkey="${k}" data-dq="${e(q.id)}"><option value="" ${v ? "" : "selected"} disabled>Classify…</option>${(q.choices || []).map(c => `<option ${c === v ? "selected" : ""}>${e(c)}</option>`).join("")}</select></label>` : ""}</div>
          ${tabs.length ? `<div class="tabs dp-tabs" role="tablist">${tabs.map(t => `<button type="button" role="tab" class="tab ${t === st.tab ? "on" : ""}" data-dtab="${e(t)}" data-dq="${e(q.id)}">${e(t)}</button>`).join("")}</div>
          <pre class="log dp-view">${e(n.views[st.tab])}</pre>` : ""}
          ${st.reveal && n.a !== undefined ? `<div class="dwhy"><b>${e(n.a)}</b> — ${e(n.w || "")}</div>` : ""}
          <p class="muted dp-foot">${done} of ${cl.length} devices classified.</p></div>`;
      }
    }
    const palette = q.type === "build" ? `<div class="dpalette"><span class="overline">Toolbox</span><span class="muted">Drag a device onto a numbered slot, or tap a device and then tap a slot. Devices can be used more than once, and some aren't needed.</span>
      <div class="ddevs">${(q.devices || []).map(d => `<button type="button" class="ddev${st.arm === d ? " armed" : ""}" draggable="true" data-ddev="${e(d)}" data-dq="${e(q.id)}">${e(d)}</button>`).join("")}</div></div>` : "";
    return `<div class="diagwrap t-${q.type}" data-dwrap="${e(q.id)}">${palette}<p class="muted dscroll-hint">Swipe sideways to see the whole diagram.</p><div class="diag-scroll"><div class="diag" style="--dh:${+q.h || 380}px">
      <svg class="dlinks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${zones}${nodes.map(nodeH).join("")}${slots.map(slotH).join("")}</div></div>${below}</div>`;
  }

  function rerender(qid, focusKey) {
    const st = S[qid], el = document.querySelector(`[data-dwrap="${CSS.escape(qid)}"]`); if (!st || !el) return;
    const sc = el.querySelector(".diag-scroll"), left = sc ? sc.scrollLeft : 0;
    el.outerHTML = html(st.q, st.vals, { reveal: st.reveal, marks: st.marks });
    const nw = document.querySelector(`[data-dwrap="${CSS.escape(qid)}"]`); if (!nw) return;
    const ns = nw.querySelector(".diag-scroll"); if (ns) ns.scrollLeft = left;
    if (focusKey) { const f = nw.querySelector(focusKey); if (f) f.focus({ preventScroll: true }); }
  }
  const changed = qid => document.dispatchEvent(new CustomEvent("diag:change", { detail: { qid } }));
  const setVal = (qid, k, v) => { const st = S[qid]; if (!st) return; st.vals[k] = v; if (st.marks) delete st.marks[k]; changed(qid); };

  document.addEventListener("click", ev => {
    const t = ev.target;
    const dn = t.closest("[data-dnode]"); if (dn) { const st = S[dn.dataset.dq]; if (st) { st.sel = dn.dataset.dnode; rerender(dn.dataset.dq); const p = document.querySelector(`[data-dwrap="${CSS.escape(dn.dataset.dq)}"] .dpanel`); if (p && p.getBoundingClientRect().top > innerHeight - 120) p.scrollIntoView({ behavior: "smooth", block: "nearest" }); } return; }
    const dt = t.closest("[data-dtab]"); if (dt) { const st = S[dt.dataset.dq]; if (st) { st.tab = dt.dataset.dtab; rerender(dt.dataset.dq, `[data-dtab="${CSS.escape(st.tab)}"]`); } return; }
    const dd = t.closest("[data-ddev]"); if (dd) { const st = S[dd.dataset.dq]; if (st) { st.arm = st.arm === dd.dataset.ddev ? null : dd.dataset.ddev; rerender(dd.dataset.dq); } return; }
    const sl = t.closest("[data-dslot]"); if (sl && !t.closest("select")) { const st = S[sl.dataset.dq]; if (st && st.arm) { setVal(sl.dataset.dq, "s:" + sl.dataset.dslot, st.arm); st.arm = null; rerender(sl.dataset.dq); } }
  });
  document.addEventListener("change", ev => {
    const s = ev.target.closest && ev.target.closest("[data-dkey]"); if (!s) return;
    setVal(s.dataset.dq, s.dataset.dkey, s.value); rerender(s.dataset.dq, `[data-dkey="${CSS.escape(s.dataset.dkey)}"]`);
  });
  document.addEventListener("dragstart", ev => { const d = ev.target.closest && ev.target.closest("[data-ddev]"); if (d) { ev.dataTransfer.setData("text/plain", d.dataset.ddev); ev.dataTransfer.effectAllowed = "copy"; } });
  document.addEventListener("dragover", ev => { const sl = ev.target.closest && ev.target.closest("[data-dslot]"); if (sl) { ev.preventDefault(); sl.classList.add("over"); } });
  document.addEventListener("dragleave", ev => { const sl = ev.target.closest && ev.target.closest("[data-dslot]"); if (sl) sl.classList.remove("over"); });
  document.addEventListener("drop", ev => {
    const sl = ev.target.closest && ev.target.closest("[data-dslot]"); if (!sl) return; ev.preventDefault();
    const d = ev.dataTransfer.getData("text/plain"), st = S[sl.dataset.dq];
    if (st && (st.q.devices || []).includes(d)) { setVal(sl.dataset.dq, "s:" + sl.dataset.dslot, d); st.arm = null; rerender(sl.dataset.dq); }
  });

  function score(q, vals) {
    const marks = {}; let right = 0, total = 0;
    (q.slots || []).forEach(s => { const k = "s:" + s.id, ok = vals[k] === s.a; marks[k] = ok; total++; if (ok) right++; });
    (q.nodes || []).filter(n => n.a !== undefined).forEach(n => { const k = "n:" + n.id, ok = vals[k] === n.a; marks[k] = ok; total++; if (ok) right++; });
    return { right, total, marks };
  }
  function mark(qid, marks, reveal) { const st = S[qid]; if (!st) return; st.marks = Object.assign({}, marks); if (reveal) st.reveal = true; rerender(qid); }
  const count = (q, vals) => { const k = keys(q); return { done: k.filter(x => vals[x]).length, total: k.length }; };
  const items = q => [...(q.slots || []).map(s => ({ k: "s:" + s.id, label: `[${s.n || s.id}] ${s.hint || ""}`, a: s.a, w: s.w })),
                      ...(q.nodes || []).filter(n => n.a !== undefined).map(n => ({ k: "n:" + n.id, label: n.label + (n.ip ? ` (${n.ip})` : ""), a: n.a, w: n.w }))];
  const reset = qid => { delete S[qid]; };
  return { html, score, mark, count, items, reset, isDiag: q => q && (q.type === "build" || q.type === "topo") };
})();
