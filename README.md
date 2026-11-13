# Security+ PBQ Practice Lab

Interactive practice for the **performance-based questions (PBQs)** on CompTIA Security+ (SY0-701). It's a single static page: no build step, no server, and no dependencies.

## Run it

Open `index.html` in a browser, or host the folder anywhere that serves static files (GitHub Pages, S3, an intranet share). Progress is saved in the viewer's browser.

## Project layout

```
index.html                         Page engine (UI, grading, timer, progress)
questions/
  d1-general-concepts.js           Domain 1.0 — General Security Concepts
  d2-threats.js                    Domain 2.0 — Threats, Vulnerabilities & Mitigations
  d3-architecture.js               Domain 3.0 — Security Architecture
  d4-operations.js                 Domain 4.0 — Security Operations
  d5-program-management.js         Domain 5.0 — Security Program Management & Oversight
tools/validate.js                  Checks every question for mistakes
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

## Writing good PBQs

- Base them on the official SY0-701 exam objectives and tag the right domain.
- Put the deciding detail in the scenario (a port, "certificates already deployed," "lowest cost"). Each item should have exactly one defensible answer.
- Use realistic distractors (TLS 1.0, disabling SSID broadcast, Telnet as a fallback).
- Write the `w` explanation so it teaches the concept, not just restates the answer.
- Use documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) and fictional names and domains (example.com/.org/.net).
- Don't copy questions from real exams or commercial practice tests.

## Disclaimer

This is an independent study aid. It isn't affiliated with or endorsed by CompTIA, and the questions are original practice material, not real exam content.
