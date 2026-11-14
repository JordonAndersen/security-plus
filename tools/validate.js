#!/usr/bin/env node
// Validates every question file in ../questions. Run: node tools/validate.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = path.join(__dirname, "..", "web", "questions");
const index = fs.readFileSync(path.join(__dirname, "..", "web", "index.html"), "utf8");
const bank = [];
const errors = [];
const err = (q, msg) => errors.push(`[${q && q.id || "?"}] ${msg}`);

const files = fs.readdirSync(dir).filter(f => f.endsWith(".js")).sort();
for (const f of files) {
  if (!index.includes(`questions/${f}`)) errors.push(`[${f}] not referenced by a <script src> tag in index.html`);
  const ctx = { PBQ: { add(list) { for (const q of list) { q.__file = f; bank.push(q); } } } };
  try { vm.runInNewContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx, { filename: f }); }
  catch (e) { errors.push(`[${f}] failed to load: ${e.message}`); }
}

const ids = new Set();
for (const q of bank) {
  for (const k of ["id", "domain", "title", "scenario", "task", "explain"]) if (q[k] === undefined || q[k] === "") err(q, `missing "${k}"`);
  if (ids.has(q.id)) err(q, "duplicate id"); ids.add(q.id);
  if (!/^[a-z0-9-]+$/.test(q.id || "")) err(q, "id must be lowercase letters, digits and hyphens");
  if (![1, 2, 3, 4, 5].includes(q.domain)) err(q, "domain must be 1-5");
  if (q.level !== undefined && !["easy","medium","hard"].includes(q.level)) err(q, 'level must be "easy", "medium" or "hard"');
  if (q.term !== undefined) {
    if (!q.term || typeof q.term.cmds !== "object" || !Object.keys(q.term.cmds).length) err(q, "term needs a non-empty cmds object");
    else for (const [k, v] of Object.entries(q.term.cmds)) if (typeof v !== "string") err(q, `term command "${k}" output must be a string`);
  }
  const type = q.type || "grid";
  if (type === "grid") {
    if (!Array.isArray(q.cols) || !Array.isArray(q.opts) || q.cols.length !== q.opts.length) { err(q, "cols and opts must be arrays of equal length"); continue; }
    (q.rows || []).forEach((r, ri) => {
      if (!r.l) err(q, `row ${ri} missing label "l"`);
      if (!r.w) err(q, `row ${ri} missing explanation "w"`);
      if (!Array.isArray(r.a) || r.a.length !== q.cols.length) return err(q, `row ${ri} must have ${q.cols.length} answer(s)`);
      r.a.forEach((a, ci) => {
        const opts = (q.rowOpts && q.rowOpts[ri]) || q.opts[ci];
        if (!opts) { if (typeof a !== "number") err(q, `row ${ri} col ${ci}: free-entry cells need a numeric answer`); }
        else if (!opts.includes(a)) err(q, `row ${ri} col ${ci}: answer "${a}" is not one of the options`);
      });
    });
    if (!q.rows || q.rows.length < 2) err(q, "grid needs at least 2 rows");
  } else if (type === "order") {
    if (!Array.isArray(q.items) || q.items.length < 3) err(q, "order needs at least 3 items (listed in the CORRECT order)");
    if (q.labels && q.labels.length !== q.items.length) err(q, "labels must match items length");
  } else if (type === "multi") {
    if (!Array.isArray(q.choices) || q.choices.length < 4) err(q, "multi needs at least 4 choices");
    else {
      const n = q.choices.filter(c => c.c).length;
      if (!n) err(q, "multi needs at least one correct choice");
      q.choices.forEach((c, i) => { if (!c.t || !c.w) err(q, `choice ${i} needs "t" and "w"`); });
      const m = /select the (\w+)/i.exec(q.task || "");
      const words = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7 };
      if (m && words[m[1].toLowerCase()] && words[m[1].toLowerCase()] !== n) err(q, `task says ${m[1]} but ${n} choices are correct`);
    }
  } else err(q, `unknown type "${type}"`);
}

const byDomain = [1, 2, 3, 4, 5].map(d => `D${d}: ${bank.filter(q => q.domain === d).length}`).join("  ");
console.log(`PBQ: ${bank.length} questions from ${files.length} files.  ${byDomain}`);

// ---- Multiple choice ----
const mdir = path.join(__dirname, "..", "web", "mcq");
const mc = [];
const mfiles = fs.existsSync(mdir) ? fs.readdirSync(mdir).filter(f => f.endsWith(".js")).sort() : [];
for (const f of mfiles) {
  if (!index.includes(`mcq/${f}`)) errors.push(`[${f}] not referenced by a <script src> tag in index.html`);
  const ctx = { PBQ: { addMC(domain, list) { for (const q of list) mc.push(Object.assign({ domain, __file: f }, q)); } } };
  try { vm.runInNewContext(fs.readFileSync(path.join(mdir, f), "utf8"), ctx, { filename: f }); }
  catch (e) { errors.push(`[${f}] failed to load: ${e.message}`); }
}
const mids = new Set(), texts = new Set();
for (const q of mc) {
  if (!q.id || !/^[a-z0-9-]+$/.test(q.id)) err(q, "MC id must be lowercase letters, digits and hyphens");
  if (mids.has(q.id) || ids.has(q.id)) err(q, "duplicate id"); mids.add(q.id);
  if (![1, 2, 3, 4, 5].includes(q.domain)) err(q, "domain must be 1-5");
  if (!q.q || !q.e) err(q, 'needs question "q" and explanation "e"');
  if (q.level !== undefined && !["easy","medium","hard"].includes(q.level)) err(q, 'level must be "easy", "medium" or "hard"');
  if (texts.has(q.q)) err(q, "duplicate question text"); texts.add(q.q);
  if (!Array.isArray(q.o) || q.o.length < 3) { err(q, "needs at least 3 options in o"); continue; }
  if (new Set(q.o).size !== q.o.length) err(q, "duplicate options");
  const ans = Array.isArray(q.a) ? q.a : [q.a];
  if (!ans.length || ans.some(i => !Number.isInteger(i) || i < 0 || i >= q.o.length)) err(q, "answer index out of range");
  if (Array.isArray(q.a)) {
    const m = /choose (\w+)/i.exec(q.q); const words = { two:2, three:3, four:4 };
    if (!m || words[m[1].toLowerCase()] !== q.a.length) err(q, `multi-answer question must say "(Choose ${q.a.length === 2 ? "two" : q.a.length}.)" in its text`);
  }
  if (q.o.some(o => /all of the above|none of the above/i.test(o))) err(q, "avoid 'all/none of the above' — options are shuffled");
}
const mcDom = [1, 2, 3, 4, 5].map(d => `D${d}: ${mc.filter(q => q.domain === d).length}`).join("  ");
const lv = list => ["easy","medium","hard"].map(l => `${l}: ${list.filter(q => (q.level||"medium") === l).length}`).join(", ");
console.log(`Levels — PBQ ${lv(bank)} | MC ${lv(mc)}`);
console.log(`MC:  ${mc.length} questions from ${mfiles.length} files.  ${mcDom}`);
// ---- Reference data (acronyms + ports) ----
const rdir = path.join(__dirname, "..", "web", "ref");
const acr = [], ports = [];
const rfiles = fs.existsSync(rdir) ? fs.readdirSync(rdir).filter(f => f.endsWith(".js")).sort() : [];
for (const f of rfiles) {
  if (!index.includes(`ref/${f}`)) errors.push(`[${f}] not referenced by a <script src> tag in index.html`);
  const ctx = { PBQ: { addAcronyms(l) { acr.push(...l); }, addPorts(l) { ports.push(...l); } } };
  try { vm.runInNewContext(fs.readFileSync(path.join(rdir, f), "utf8"), ctx, { filename: f }); }
  catch (e) { errors.push(`[${f}] failed to load: ${e.message}`); }
}
const CATS = ["Crypto","Identity","Network","Wireless","Threats","Ops","Cloud","Hardware","Resilience","GRC","Dev"];
const seenA = new Set();
for (const x of acr) {
  if (!x.a || !x.f || !x.d || !x.c) errors.push(`[acronym ${x.a || "?"}] needs a, f, c and d`);
  if (seenA.has(x.a)) errors.push(`[acronym ${x.a}] duplicate — disambiguate like "MAC (access)"`); seenA.add(x.a);
  if (x.c && !CATS.includes(x.c)) errors.push(`[acronym ${x.a}] unknown category "${x.c}" (use one of ${CATS.join(", ")})`);
}
const seenP = new Set();
for (const x of ports) {
  if (!x.p || !x.pr || !x.s || !x.d || !x.sec) errors.push(`[port ${x.p || "?"}] needs p, pr, s, d and sec`);
  if (seenP.has(x.p)) errors.push(`[port ${x.p}] duplicate`); seenP.add(x.p);
}
// ---- Crash course ----
const cdir = path.join(__dirname, "..", "web", "crash");
const crash = [];
const cfiles = fs.existsSync(cdir) ? fs.readdirSync(cdir).filter(f => f.endsWith(".js")).sort() : [];
for (const f of cfiles) {
  if (!index.includes(`crash/${f}`)) errors.push(`[${f}] not referenced by a <script src> tag in index.html`);
  const ctx = { PBQ: { addCrash(l) { crash.push(...l); } } };
  try { vm.runInNewContext(fs.readFileSync(path.join(cdir, f), "utf8"), ctx, { filename: f }); }
  catch (e) { errors.push(`[${f}] failed to load: ${e.message}`); }
}
const JUMPS = ["mcq-hard","mcq-missed","mcq-d1","mcq-d2","mcq-d3","mcq-d4","mcq-d5","pbq-hard","exam","exam-hard","ref-acr-cards","ref-port-cards","ref-ports","ref-acr-quiz"];
const cids = new Set();
for (const s of crash) {
  if (!s.id || !s.title || !s.group || !s.html) errors.push(`[crash ${s.id || "?"}] needs id, group, title, html`);
  if (cids.has(s.id)) errors.push(`[crash ${s.id}] duplicate id`); cids.add(s.id);
  for (const m of (s.html || "").matchAll(/data-cc="([^"]+)"/g)) if (!JUMPS.includes(m[1])) errors.push(`[crash ${s.id}] unknown jump "${m[1]}"`);
}
console.log(`Crash course: ${crash.length} sections`);
console.log(`Ref: ${acr.length} acronyms (${acr.filter(x => x.k).length} high-yield), ${ports.length} ports`);

if (errors.length) { console.error(`\n${errors.length} problem(s):\n` + errors.map(e => "  - " + e).join("\n")); process.exit(1); }
console.log("All questions valid.");
