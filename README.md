# Security+ PBQ Practice Lab

Interactive practice for the **performance-based questions (PBQs)** on CompTIA Security+ (SY0-701). It's a single static page: no build step, no server, and no dependencies.

## Run it

- **Hosted with accounts (recommended):** Netlify + Supabase, with user/admin roles and user-created questions. See **DEPLOY.md**.
- **Local / static only:** serve the `web/` folder with any static host, or `python3 -m http.server --directory web`. Without Supabase settings, progress is saved in the browser, and Export/Import moves it between devices.

## Project layout

```
web/index.html                     Page engine (UI, grading, timer, progress)
web/app/cloud.js                   Accounts, roles, sync, answer logging (Supabase)
web/app/questions-ui.js            My questions (builder) + Admin (review queue, users & roles)
web/app/account-ui.js              Account page: countdown, readiness, metrics, last 3 exams, activity, settings
tests/db/                          Database security tests (PGlite)
supabase/migrations/               Database schema + RLS
netlify.toml                       Hosting config + security headers
web/questions/
  d1-general-concepts.js           Domain 1.0 — General Security Concepts
  d2-threats.js                    Domain 2.0 — Threats, Vulnerabilities & Mitigations
  d3-architecture.js               Domain 3.0 — Security Architecture
  d4-operations.js                 Domain 4.0 — Security Operations
  d5-program-management.js         Domain 5.0 — Security Program Management & Oversight
  set2.js                          Second PBQ set (mixed domains)
mcq/
  d1-…d5-….js                      Multiple-choice questions, one file per domain
tools/validate.js                  Checks every PBQ and MC question for mistakes
```

The engine sorts questions by domain automatically. To add a question, you only touch a file in `questions/`.

## Add a question

1. Open the file for the question's domain and add an object to the `PBQ.add([...])` list.
2. Run `node tools/validate.js` and fix anything it reports.
3. Open `index.html` and work through the question yourself, including **Show answers**.

To add a new file (for example, `questions/d4-forensics.js`), also add a `<script src="questions/d4-forensics.js"></script>` line in the `<head>` of `index.html`. The validator flags any file you forget.

### Common fields

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Unique and URL-safe (`lowercase-with-hyphens`). It's used for progress tracking and `#links`, so don't rename it later. |
| `domain` | yes | `1`–`5` (SY0-701 domain). |
| `title` | yes | Short name shown in the sidebar. |
| `type` | no | `"grid"` (default), `"order"`, or `"multi"`. |
| `time` | no | Target minutes. The timer turns red after this. |
| `scenario` | yes | HTML string. Use `<p>`, `<ul>`, `<ol>`, and `<b>`. |
| `log` | no | Plain text shown in a terminal-style block (logs, code, configs). |
| `task` | yes | The instruction line above the answer area. |
| `explain` | yes | The single key takeaway, shown after answering. |

### Type: `grid` (dropdown and fill-in tables)

Used for firewall rules, matching, classification, and calculations.

```js
{
  id: "example-grid", domain: 3, time: 3, type: "grid",
  title: "Example",
  scenario: `<p>Scenario text.</p>`,
  task: "Choose an answer for each item.",
  cols: ["Category", "Type"],                    // one heading per answer column
  opts: [["A","B","C"], ["X","Y","Z"]],          // options per column; null = free-entry number
  rowOpts: { 2: ["Yes","No"] },                  // optional: override options for one row
  rows: [
    { l: "Row label", a: ["A","Y"], w: "Why this answer is right." }
  ],
  explain: "Key takeaway."
}
```

- Each `a` value must exactly match one of the options for that cell.
- Numeric free-entry cells (`opts` column = `null`) take a number answer. Grading ignores `$`, `,`, `%`, and spaces.

### Command-line PBQs (simulated terminal)

Any grid PBQ can include an interactive terminal that appears above the answer table:

```js
term: {
  prompt: "root@web01:~#",
  intro: "Type 'help' to list available commands.",
  cmds: {
    "ss -tunap|netstat -tunap": "…output…",   // aliases separated by |
    "ps aux": "…output…"
  }
}
```

Matching ignores case and extra spaces. `help` lists the commands (first alias of each), `clear`/`cls` clears the screen, and ↑/↓ recall history. Unknown commands print a hint. Use RFC 5737 documentation IPs (192.0.2.x, 198.51.100.x, 203.0.113.x) and fictional hostnames.

### Type: `order` (put steps in sequence)

List `items` in the **correct** order. The page shuffles them.

```js
{ id: "example-order", domain: 4, type: "order", title: "...", scenario: "...", task: "...",
  items: ["First", "Second", "Third"],
  labels: ["(Phase 1)", "(Phase 2)", "(Phase 3)"],   // optional: shown after checking
  explain: "..." }
```

### Type: `multi` (select all that apply)

```js
{ id: "example-multi", domain: 4, type: "multi", title: "...", scenario: "...",
  task: "Select the THREE best actions.",          // validator checks the count matches
  choices: [
    { t: "Choice text", c: true,  w: "Why it's right" },
    { t: "Distractor",  c: false, w: "Why it's wrong" }
  ],
  explain: "..." }
```

## Multiple-choice questions

Multiple-choice questions live in `mcq/`, one file per domain. Each file calls `PBQ.addMC(domain, [...])`:

```js
PBQ.addMC(4, [
  { id: "d4-045",
    q: "Which tool aggregates and correlates logs from many sources?",
    o: ["SIEM", "SOAR", "FIM", "DLP"],    // options (shuffled when shown)
    a: 0,                                 // index of the correct option
    e: "A SIEM collects, correlates and alerts. SOAR automates the response." },
  { id: "d4-046",
    q: "Which TWO are possession factors? (Choose two.)",
    o: ["Security key", "TOTP app", "PIN", "Fingerprint"],
    a: [0, 1],                            // array = choose-N; the text must say "(Choose two.)"
    e: "..." }
]);
```

- IDs must be unique across the whole bank. Use the `d<domain>-<number>` pattern.
- Options are shuffled every time a question is shown, so don't use "all of the above" or "none of the above." The validator rejects them.
- Write `e` so it explains the right answer **and** why the tempting wrong answers are wrong.

The page offers two modes: **Study** (feedback after each question) and **Exam sim** (1 min per question, results at the end with a full review). It can draw from four pools: all, not seen yet, missed last time, and below 70% accuracy. Stats are kept per question in the browser.

## Difficulty levels

Any PBQ or multiple-choice question can carry `level: "easy" | "medium" | "hard"`. Untagged questions count as medium.

- **Performance-based tab:** a difficulty dropdown at the top of the sidebar. Hard questions also show a HARD tag in the list.
- **Multiple-choice tab:** difficulty checkboxes with your accuracy per level, plus a one-click **Hard only — cram mode** button.
- **Practice exam tab:** a **Hard-weighted** option draws every available hard question in each domain first, then tops up from the rest.

Hard files: `questions/hard-set.js`, `mcq/hard-d1-d2.js`, and `mcq/hard-d3-d5.js`. Those multiple-choice files wrap their lists in a small `H()` helper that sets `level: "hard"` on every question.

What makes a question "hard" here:
- **Look-alike concepts**, where one detail decides the answer (BEC vs. whaling, CSRF vs. SSRF, pharming vs. DNS poisoning, MOU vs. MOA).
- **BEST, FIRST, or MOST questions** where several options are true but only one fits the scenario.
- **Distractors that sound like security but aren't current best practice**, such as 30-day password rotation, SSID hiding, or lowering the lockout threshold to stop spraying.
- **Multi-step reasoning**, such as tracing firewall rules, ALE with control cost, DMARC alignment, or reading CVSS vectors.

## Acronyms & ports tab

Reference data lives in `ref/`:

- `ref/acronyms-a-l.js` and `ref/acronyms-m-z.js` — `PBQ.addAcronyms([{ a, f, c, d, t?, k? }])`
  - `a` acronym. When one acronym has several meanings, make it unique, e.g. `MAC (access)`, `MAC (address)`.
  - `f` full name, `c` category (Crypto, Identity, Network, Wireless, Threats, Ops, Cloud, Hardware, Resilience, GRC, Dev)
  - `d` what it is / what it does, `t` optional exam tip, `k: 1` marks it high-yield.
- `ref/ports.js` — `PBQ.addPorts([{ p, pr, s, d, sec, bad?, k? }])`
  - `p` port(s), `pr` TCP/UDP, `s` service, `d` what it does, `sec` secure alternative or note, `bad: 1` for cleartext/insecure.

The tab has four views. **Acronym quiz** auto-generates multiple choice from the reference data (acronym → name, name → acronym, or description → acronym), with distractors drawn from the same category.

The other three: **Acronyms** has live search, a category filter, and a high-yield toggle. **Ports** is a searchable table with an insecure-only filter. **Flashcards** offers high-yield, all, or per-category acronym decks, plus port→service and service→port decks, with mastered/missed tracking (keyboard: Space, 1, 2). The validator checks for duplicate acronyms and ports and for unknown categories.

## Crash course tab

`crash/content.js` holds the study guide as `PBQ.addCrash([{ id, group, title, html }])`. Sections are grouped in the sidebar by `group`. Readers can tick each section as reviewed, and progress is saved in their browser. Deep links work as `#crash-<id>` (e.g., `#crash-pairs`).

Buttons inside a section can jump straight into a drill with `<button class="btn" data-cc="ACTION">`, where ACTION is one of: `mcq-hard`, `mcq-missed`, `mcq-d1`…`mcq-d5`, `pbq-hard`, `exam`, `exam-hard`, `ref-acr-cards`, `ref-port-cards`, `ref-ports`. The validator flags unknown actions.

## Practice exam tab

This builds a random exam from both banks each time:

| Length | PBQs | Multiple choice | Time |
|---|---|---|---|
| Full | 4 (first, as on the real exam) | 86 | 90 min |
| Half | 2 | 43 | 45 min |

- Multiple-choice questions are drawn per domain using the official weights (largest-remainder rounding). PBQs are chosen from different domains where possible.
- Scoring: multiple choice = 1 point. A PBQ = 3 points with partial credit (fraction of fields correct; order questions by correct positions; select-all = hits minus wrong picks). The percentage is mapped linearly to an **estimated** 100–900 scale with 750 to pass. CompTIA doesn't publish its formula, so this is a guide only.
- Results show the score by domain, a full review with explanations, and an attempt history (last 50) with domain averages over the last 5 exams. Multiple-choice results also count toward the per-question stats used by the "missed" and "weak" pools.

To change the mix, edit `W`, `LEN`, or `PBQ_POINTS` at the top of the practice exam script in `index.html`.

## About question sources

All questions are original and written against the public SY0-701 exam objectives. Never add real exam questions or "brain dump" content: CompTIA's candidate agreement prohibits it, and using it can get certifications revoked. When SY0-801 arrives, add new questions mapped to its objectives in new files (e.g., `mcq/v8-d1.js`).

### Suggested weighting

Match the SY0-701 domain weights when you add questions: D1 12%, D2 22%, D3 18%, D4 28%, D5 20%.

## Writing good PBQs

- Base them on the official SY0-701 exam objectives and tag the right domain.
- Put the deciding detail in the scenario (a port, "certificates already deployed," "lowest cost"). Each item should have exactly one defensible answer.
- Use realistic distractors (TLS 1.0, disabling SSID broadcast, Telnet as a fallback).
- Write the `w` explanation so it teaches the concept, not just restates the answer.
- Use documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) and fictional names and domains (example.com/.org/.net).
- Don't copy questions from real exams or commercial practice tests.

## Disclaimer

This is an independent study aid. It isn't affiliated with or endorsed by CompTIA, and the questions are original practice material, not real exam content.
