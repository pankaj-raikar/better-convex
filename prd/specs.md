# SPEC-001-LearnFlow AI (MVP)

## Background

LearnFlow AI targets STEM learners who struggle with dense, English‑first materials and need fast, personalized, and accessible study assets. The product converts long documents into **streamed, editable, persona‑aware notes**, diagrams, quizzes, polyglot code examples, bilingual content (EN↔HI), and accessible views (dyslexia CSS + TTS).

**Why now:** Agentic LLMs with serverless orchestration enable low‑ops, parallel generation and **reactive, section‑scoped** updates. India’s high smartphone usage and bilingual needs make **Hindi MVP** and accessibility‑first design a strong fit.

**Primary users:**

- **Aditya** (STEM undergrad): structured notes, code with complexity/edge cases, interview‑oriented practice.
- **Priya** (dyslexia/ADHD): simplified text, dyslexia‑friendly layout, synced TTS.
- **Ravi** (vernacular background): accurate **Hindi explanations** plus a bilingual bridge.

**Guardrails & targets (Beta):** E2E ≤ **60s p95** for 50‑page docs; **first token ≤ 1.5s**; **cost/doc p75 ≤ $2** and median ≤ $2; translation/factual error ≤ 5%; processing success ≥ 99%; ≥ 40% of actives use accessibility features.

---

## Requirements (MoSCoW)

### Must

- **R1 Ingest & OCR:** Extract text from scanned PDFs/images with per‑page confidence; low‑confidence pages flagged.
- **R2 Streaming & Reactivity:** First token ≤ **1.5s**; ≥ **5 updates/sec**; section‑scoped regen with first new token ≤ **1s**.
- **R3 Agent Orchestration:** ≥ **3/4** agents run in parallel; merged output preserves section order; no duplicates.
- **R4 Reactive updates:** Section‑only regen with first new token ≤ **1s**.
- **R5 Notes & Structure:** H1–H3 hierarchy; per‑section summary; key takeaways.
- **R6 Diagrams:** Valid **Mermaid** definitions; exported PDF includes diagrams without clipping.
- **R7 Accessibility — Dyslexia:** OpenDyslexic, 1.8× line spacing, 0.15em letter spacing, left‑aligned, cream BG in preview + PDF.
- **R8 Accessibility — TTS:** Start ≤ **2s**; speeds 0.75×/1.0×/1.25×/1.5×; sentence‑level highlighting. **Voice is chosen by the user first** via picker.
- **R9/R20/R21/R22 Bilingual (EN↔HI):** Toggle ≤ **500 ms** without reload (preserve scroll); glossary ≥ **20** terms with EN def + HI explanation; ≥ **90%** term fidelity; bilingual quiz/Anki parity.
- **R10 Quiz:** **10 MCQs + 5 SA** with rationales; Bloom tags (≥ 3 levels).
- **R11 Export fidelity:** PDF/MD/Anki preserve headings/diagrams/themes; dyslexia & bilingual formatting retained.
- **R12 Versioning:** Snapshot per edit/preset switch; restore any of last **50** versions; diff view highlights changes.
- **R13 Privacy controls:** “Delete my data” purges sources + outputs ≤ **15 minutes**; audit log updated.
- **R14 Cost guardrail:** Across 30 Pro docs, **p75 ≤ $2.00** (alert) and **median ≤ $2** (health).
- **R15 Observability:** Run trace shows plan JSON, per‑agent timings, retries, model choice, tokens, and costs.
- **R16 Persona presets:** Plan includes preset weights; header shows active preset; switching regenerates only impacted sections and snapshots a version.
- **R17 Code Agent (polyglot, generation‑only):** If a user requests a specific language, generate in that language; include **Big‑O** + **≥2 edge cases** per snippet. **KPI:** ≥ **90%** snippets are syntactically valid (by parser/linter) and include complexity + edge cases.
- **R23 Failure modes:** On agent/provider failure, fall back to **Notes‑only** and surface a non‑blocking banner.
- **R24 Themes & Templates:** ≥5 visual themes (System, Dyslexia, High‑Contrast, Night, Minimal) + a **Custom** builder; templates: **Outline, Cornell, Cheat‑Sheet, Flashcards‑first**; switch ≤500ms, preserve scroll; exports match.
- **R25 Chat‑first UI + Suggestions:** All actions drivable from chat UI; **3–5 context‑aware** “What’s next?” suggestions near composer, update ≤500ms.

### Should

- “Save preset as default” per user; bilingual flashcards preview; alert/funnel dashboards.

### Won’t (v0.1)

- Additional Indic languages; enterprise SSO/SLA; handwriting OCR; native mobile apps.

---

## Method

### System overview

```
@startuml
skinparam componentStyle rectangle

package "Frontend (Next.js 16 App Router)" {
  [Chat UI]
  [Notes Viewer + Theme Engine]
  [Suggestion Rail]
  [SSE Client]
  [Audio Player]
}

package "Backend (Edge + Serverless)" {
  [API Router /api/*]
  [SSE Gateway]
  [Orchestrator (Inngest)]
  [Architect Agent]
  [Notes Agent]
  [Diagram Agent]
  [Quiz Agent]
  [Code Agent (gen-only)]
  [Accessibility Agent]
  [Translate Agent (EN↔HI)]
  [Export Service (Puppeteer + mermaid-cli)]
  [OCR Service (pdf.js-extract + Tesseract + Vision)]
  [Telemetry & Cost Aggregator]
}

database "Convex (DB + Functions)" as DB
cloud "Cloudflare R2 + CDN" as R2
cloud "LLM Providers" as LLM
cloud "Google Cloud TTS" as TTS

[Chat UI] -down-> [SSE Client]
[SSE Client] --> [SSE Gateway]
[Chat UI] --> [API Router /api/*]
[Suggestion Rail] -down-> [SSE Client]

[SSE Gateway] --> [Orchestrator (Inngest)]
[API Router /api/*] --> [Orchestrator (Inngest)]

[Orchestrator (Inngest)] ..> [Architect Agent]
[Orchestrator (Inngest)] ..> [Notes Agent]
[Orchestrator (Inngest)] ..> [Diagram Agent]
[Orchestrator (Inngest)] ..> [Quiz Agent]
[Orchestrator (Inngest)] ..> [Code Agent (gen-only)]
[Orchestrator (Inngest)] ..> [Accessibility Agent]
[Orchestrator (Inngest)] ..> [Translate Agent (EN↔HI)]

[Architect Agent] --> DB
[Notes Agent] --> DB
[Diagram Agent] --> R2
[Quiz Agent] --> DB
[Code Agent (gen-only)] --> DB
[Accessibility Agent] --> DB
[Translate Agent (EN↔HI)] --> DB

[Export Service (Puppeteer + mermaid-cli)] --> R2
[OCR Service (pdf.js-extract + Tesseract + Vision)] --> DB
[OCR Service (pdf.js-extract + Tesseract + Vision)] --> R2

DB <--> [API Router /api/*]
R2 <--> [API Router /api/*]

[Notes Agent] ..> LLM
[Quiz Agent] ..> LLM
[Translate Agent (EN↔HI)] ..> LLM
[Code Agent (gen-only)] ..> LLM
[Accessibility Agent] ..> LLM
[Architect Agent] ..> LLM
[Audio Player] ..> TTS

@enduml

```

**Key patterns:** Next.js 16 (Streaming/Suspense + PPR), SSE for output; Inngest for parallel, durable orchestration; **Convex only** for data & reactive queries; Cloudflare R2/CDN for files (uploads, renders); Google Cloud TTS with SSML markers.

### Core flows

**Upload → stream → export**

```
@startuml
actor User
participant "Chat UI" as UI
participant "API /api/upload" as API
participant "OCR Service" as OCR
participant "Orchestrator" as ORCH
participant "Agents (parallel)" as AGS
participant "Convex DB" as DB
participant "SSE Gateway" as SSE
participant "Export Service" as EXP

User -> UI : Upload file + select persona
UI -> API : POST /api/upload {file}
API -> OCR : enqueue ingest(doc_id)
OCR -> DB : store pages{texts,bboxes,conf}
UI <- SSE : ingest_progress + low_conf_pages
UI -> ORCH : POST /api/ingest {doc_id}
ORCH -> AGS : plan => notes, quiz, diagram, translate, code(gen-only)
AGS -> DB : upsert sections, diagrams, quiz, glossary
SSE -> UI : stream tokens + section_ready
User -> UI : Export (PDF/MD/Anki)
UI -> EXP : POST /api/export {doc_id, format, theme}
EXP -> DB : read latest version/theme
EXP -> UI : file URL (R2 signed/public)
@enduml

```

**Section‑scoped regen**

```
@startuml
actor User
participant UI
participant "API /api/update-notes" as API
participant ORCH
participant "Notes Agent" as NOTES
participant "Translate Agent" as TRN
participant DB
participant SSE

User -> UI : "Explain rotations deeper (Sec 3.2)"
UI -> API : POST {doc_id, section_id, instruction}
API -> ORCH : enqueue section task
ORCH -> NOTES : regenerate 3.2
NOTES -> DB : write v+1 (3.2)
ORCH -> TRN : invalidate & retranslate 3.2 if HI active
TRN -> DB : write v+1 (HI)
SSE -> UI : section_diff + first_new_token
@enduml

```

### Data model (Convex)

```
@startuml
class users {
  _id: string
  email: string
  name: string
  plan: 'free'|'pro'
  persona_default: 'aditya'|'priya'|'ravi'|'auto'
  theme_default_id: string
  tts_prefs: json? // {lang, voice_id, speed}
  created_at: datetime
}

class documents {
  _id: string
  user_id: string
  title: string
  pages: int
  source_key: string // R2 key
  ocr_conf_avg: float
  rights_attested: boolean
  created_at: datetime
}

class sections {
  _id: string
  doc_id: string
  idx: int
  h_path: string   // "1>3>2"
  lang: 'en'|'hi'
  content_md: string
  summary: string
  key_takeaways: string[]
  checksum: string
  version_id: string
}

class runs {
  _id: string
  doc_id: string
  type: 'ingest'|'regen'|'export'
  plan_json: string
  started_at: datetime
  ended_at: datetime
  status: 'ok'|'error'
  costs_usd: float
}

class agent_steps {
  _id: string
  run_id: string
  agent: 'architect'|'notes'|'diagram'|'quiz'|'code'|'accessibility'|'translate'
  input_ref: string
  output_ref: string
  timings_ms: int
  retries: int
  model: string
  cost_usd: float
}

class quizzes {
  _id: string
  doc_id: string
  scope: 'document'|'section'
  mcq: json
  sa: json
  bloom_levels: string[]
}

class glossary_terms {
  _id: string
  doc_id: string
  term_en: string
  def_en: string
  expl_hi: string
  fidelity_score: float
}

class versions {
  _id: string
  doc_id: string
  parent_id: string?
  changed_section_ids: string[]
  persona: string
  theme_id: string
  created_at: datetime
}

class themes {
  _id: string
  user_id: string
  name: string // Minimal, Dyslexia, High-Contrast, Night, System
  tokens: json // CSS vars {font, spacing, colors}
  is_preset: boolean
}

class suggestions {
  _id: string
  doc_id: string
  run_id: string?
  items: json // [{label, action, payload}]
  created_at: datetime
}

class exports {
  _id: string
  doc_id: string
  format: 'pdf'|'md'|'anki'
  theme_id: string
  key: string // R2 key
  status: 'ok'|'error'
  created_at: datetime
}

class audit_logs {
  _id: string
  user_id: string
  doc_id: string?
  action: string
  meta: json
  created_at: datetime
}

class cost_events {
  _id: string
  run_id: string
  provider: string
  tokens_in: int
  tokens_out: int
  cost_usd: float
  created_at: datetime
}

users "1" -- "many" documents
documents "1" -- "many" sections
documents "1" -- "many" runs
runs "1" -- "many" agent_steps
documents "1" -- "many" quizzes
documents "1" -- "many" glossary_terms
documents "1" -- "many" versions
users "1" -- "many" themes
documents "1" -- "many" suggestions
documents "1" -- "many" exports
runs "1" -- "many" cost_events
@enduml

```

**Indexes:** `sections(doc_id, lang, idx)`, `runs(doc_id, started_at)`, `agent_steps(run_id)`, `glossary_terms(doc_id, term_en)`, `versions(doc_id, created_at desc)`, `themes(user_id, name)`.

### Agents & streaming contracts

- **Architect →** `plan.json` (DAG; section mapping; persona weights). Stream `plan_started`, `plan_graph`, `plan_ready`.
- **Notes →** `sections.content_md`, `summary`, `takeaways`. Stream `section_start`, token `delta`, `section_done`.
- **Diagram →** Mermaid text; `.mmd` stored; rendered to SVG on export.
- **Quiz →** 10 MCQ + 5 SA with rationales + Bloom tags.
- **Code (polyglot, gen‑only) →** language requested by user; code + **Big‑O** + **≥2 edge cases**; **static validation** via parsers/linters; record `syntax_ok`.
- **Accessibility →** FK Grade 10±1 simplification; jargon tooltips.
- **Translate (EN↔HI) →** term locking; bilingual cache by sentence; toggle ≤500ms.

**SSE event union**

```tsx
{ t:"plan"|"delta"|"section_done"|"suggestions"|"cost_update"|"error", ... }

```

### Suggestion engine (state machine)

```
@startuml
[*] --> Idle
Idle --> AfterUpload : doc_uploaded
AfterUpload --> OCRReview : low_conf_pages
AfterUpload --> PlanReady : plan_ready
OCRReview --> PlanReady : pages_confirmed
PlanReady --> NotesFlow : sections_started
NotesFlow --> QuizReady : notes_complete
QuizReady --> ExportReady : quiz_done
ExportReady --> [*]
state NotesFlow {
  [*] --> Streaming
  Streaming --> RegenHint : user_edit
  RegenHint --> Streaming : regen_done
}
@enduml

```

### Performance plan

- **TTFB ≤ 1.5s:** open SSE immediately; stream plan graph first; progressive hydration (PPR + Suspense).
- **≥ 5 updates/sec:** flush token batches every 150–200ms.
- **Section regen ≤ 1s:** warm providers; cache section context; pre‑open connection when a section is focused.
- **Parallelism:** 3–4 agents concurrently per doc via Inngest; backpressure via per‑doc concurrency keys.
- **Realtime UI:** Convex reactive queries (no polling) keep panes in sync.

### Cost control

- Token budgets per agent; short prompts for diagrams/quiz; cache by `doc|section|persona|theme|lang|version`.
- Model tiering: fast/cheap by default; “high quality” on user ask.
- Cost ledger: `cost_events` roll‑up → `runs.costs_usd`; dashboards for **p75** and **median**.

---

## Implementation

**Stack:** Next.js 16 (App Router, Streaming, PPR, Server Actions) + SSE; **Convex Cloud** (DB + functions + reactive); **Inngest Cloud** (durable orchestration); **Cloudflare R2 + CDN** for all files; **Google Cloud TTS**; OCR via `pdf.js-extract → Tesseract.js → Vision` fallback.

### Repo & structure

```
/apps
  /web               # Next.js app (UI + API/SSE)
  /workers           # Inngest handlers (agents, OCR, export)
  /convex            # schema.ts + functions
/packages
  /shared            # zod types, SSE types
  /prompts           # persona prompt templates
  /ui                # shadcn + theme tokens & layouts
/infra
  /terraform         # R2 bucket, Vercel, DNS (optional)

```

### Env & secrets

```
NEXT_PUBLIC_APP_URL=
CONVEX_URL=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
CF_ACCOUNT_ID=
CF_R2_ACCESS_KEY_ID=
CF_R2_SECRET_ACCESS_KEY=
CF_R2_BUCKET=learnflow
PUBLIC_CDN_BASE=https://cdn.example.com
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
MERMAID_BIN=/usr/local/bin/mmdc

```

### Frontend

- Routes: `/` and `/doc/[id]` (PPR shell + streamed sections). Cache tags per section; `revalidateTag` on regen.
- Chat UI: chat composer + actions; **Suggestion rail** (3–5 chips) updates with run state.
- Theme/Template engine: System, Dyslexia, High‑Contrast, Night, Minimal; templates Outline/Cornell/Cheat‑Sheet/Flashcards‑first.
- i18n toggle: ≤500ms, scroll preserved via sentence indices.
- TTS: **Voice Picker** (user must choose), preview, persist to LocalStorage + `users.tts_prefs`; speeds 0.75×/1×/1.25×/1.5×; sentence highlights via SSML marks.

### Backend & orchestration

- **Inngest**
  - `ingest.run` → OCR; scaffold sections; fan‑out agents (notes/diagram/quiz/code/translate/accessibility); parallel steps + per‑doc concurrency keys.
  - `section.regen` → targeted regen + HI invalidation.
  - `export.run` → render themed HTML → **mmdc** for Mermaid SVG → Puppeteer PDF → store on R2.
- **Convex**
  - Schema per Method; indexes for hot paths.
  - Functions: CRUD for documents/sections/versions/themes/suggestions; analytics aggregations; deletion job (≤15m SLA) across R2 keys + rows.

### OCR pipeline

1. `pdf.js-extract` for text layer and coordinates.
2. If no text or **conf < 85** → rasterize page → **Tesseract.js**.
3. If still low confidence → escalate image to **Vision**.
4. Persist `ocr_conf_page` and flag low pages.

### Streaming contracts (SSE)

```tsx
type SseEvent =
  | { t: "plan"; runId: string; plan: { nodes: any[] } }
  | {
      t: "delta";
      agent: "notes" | "diagram" | "quiz" | "translate" | "code";
      sectionIdx: number;
      token: string;
    }
  | { t: "section_done"; sectionIdx: number; checksum: string }
  | {
      t: "suggestions";
      items: { label: string; action: string; payload: any }[];
    }
  | {
      t: "cost_update";
      runId: string;
      costUsd: number;
      tokensIn: number;
      tokensOut: number;
    }
  | { t: "error"; agent?: string; message: string; retryable: boolean };
```

### Observability & security

- Traces per run; agent timings; retries; model; token counts; cost.
- Alerts: TTFB>1.5s; TTS>2s; EN↔HI toggle>500ms; success<99%; cost p75>$2.
- TLS; rights attestation; audit logs on delete/export/version‑restore.

---

## Milestones

- **M0 (Nov 14–17):** Monorepo, CI, envs; R2 adapter; hello‑stream deploy.
- **M1 (Nov 17–21):** Upload + OCR v1; SSE gateway; chat + suggestions; themes/templates.
- **M2 (Nov 21–25):** Architect/Notes/Diagram/Quiz/Code(gen‑only)/Translate; parallel orchestration; bilingual cache.
- **M3 (Nov 25–28):** Dyslexia CSS; TTS voice picker + SSML marks; speeds.
- **M4 (Nov 28–30) — Alpha:** PDF/MD/Anki (CSV fallback) export; versions + diff.
- **M5 (Dec 1–6):** Performance & cost; Notes‑only fallback; deletion SLA.
- **M6 (Dec 6–12):** Glossary fidelity; persona propagation; bilingual quiz parity; code syntax_ok ≥90%.
- **M7 (Dec 15) — Beta:** Flags on; 100–500 users; dashboards & alarms.
- **M8 (Dec 16–29) — GA polish:** .apkg builder if feasible; chunking UX; export pagination polish; onboarding.

**Beta gates:**

- **Aditya:** code syntax_ok ≥ 90%; 10 MCQ + 5 SA; E2E ≤ 60s p95.
- **Priya:** WCAG AA pass; TTS ≤ 2s p95; Grade‑10±1 on ≥ 90% sections.
- **Ravi:** EN↔HI median toggle ≤ 500 ms; glossary fidelity ≥ 90%; bilingual Anki clean import.

---

## Gathering Results

**Dashboards:** latency (TTFB, interarrival p95/p99, regen first token), throughput/success, accessibility usage, bilingual toggle + cache hit, **cost p50/p75**, code syntax_ok by language.

**Acceptance checks:** OCR flags; streaming metrics; concurrency & merge; headers/takeaways; Mermaid render; dyslexia CSS in PDF; TTS start ≤2s with highlights; EN↔HI toggle ≤500ms + glossary ≥20; quizzes 10+5 with Bloom≥3; export fidelity; versions & rollback; delete ≤15m; cost guardrail; trace completeness; notes‑only fallback.

**Learning impact pilot:** n≈30 students; pre/post quiz; target +30% lift; nightly “Beta Health” PDF.

---
