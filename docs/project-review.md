# IELTS project review

Reviewed on 25 October 2026. This review covers all 10 original files in `F:\IELTS`. It records the supplied requirements, missing implementation resources and a proposed application structure. It does not claim that the described features have been built.

## Findings from every original file

| Original file | What it provides | Current location |
| --- | --- | --- |
| `01_SRS.md` | IELTS Academic scope, requirements R01-R20, roles, modules, UX and acceptance scenarios | [Source](specifications/01_SRS.md) |
| `02_AI_Architecture.md` | Paper/typed Writing pipeline, QR transfers, durable jobs, scratch OCR and hybrid evaluation | [Source](specifications/02_AI_Architecture.md) |
| `03_Database_Design.md` | Proposed Supabase tables, relationships, RLS and privacy; no executable SQL migrations | [Source](specifications/03_Database_Design.md) |
| `04_Evaluation_Protocol.md` | Data splits, OCR/Writing measurements, integration/security tests and release gates | [Source](specifications/04_Evaluation_Protocol.md) |
| `05_Development_Roadmap.md` | Eight phases, priorities, dependencies, risks and deliverables | [Source](specifications/05_Development_Roadmap.md) |
| `IELTS_Complete_Specification.md` | Compilation containing all five numbered Markdown documents verbatim | [Compilation](compiled/IELTS_Complete_Specification.md) |
| `IELTS_Academic_Final_SRS_and_Roadmap.docx` | Editable export of the same substantive specification, with title/TOC material | [Word copy](compiled/IELTS_Academic_Final_SRS_and_Roadmap.docx) |
| `IELTS_Academic_Final_SRS_and_Roadmap.pdf` | 25-page reference export of the same substantive specification | [PDF copy](compiled/IELTS_Academic_Final_SRS_and_Roadmap.pdf) |
| `README.md` | Original package index and limitations | [Preserved README](specifications/README.md) |
| `index.html` | Empty file, 0 bytes; no existing webpage or application | [Original placeholder](../index.html) |

The Word/PDF copies were checked against the Markdown content. Differences are export formatting, title/TOC material, repeated table headers and page-boundary text layout; no additional substantive requirements were found. The exported title has corrupted punctuation. There are no embedded resource images or attached files in the PDF, and no media or embedded files in the Word package. Word comment/footnote parts contain no substantive text.

The numbered Markdown documents are the working baseline; the compiled documents remain reference snapshots. All originals, including the empty HTML file and original README, are preserved byte-for-byte. [The manifest](source-manifest.json) records their old locations, new locations, sizes and SHA-256 hashes.

## Product and intended experience

The requested product is a full IELTS Academic preparation application, initially private and free for the authorized personal user. It is designed for later multi-user access. General Training and active payment/subscription functionality are outside the initial release.

| Area | Required behavior |
| --- | --- |
| Reading | Three passages, 40 questions and a 60-minute full mock; targeted practice, highlighting, flags, autosave, objective marking and post-attempt explanations |
| Listening | Four parts and 40 questions; restricted once-play audio in mocks, configurable review timing, flexible playback and transcripts in practice |
| Writing | Task 1 and Task 2, shared 60-minute mock, word counts, typed responses or photographed paper responses, task weighting 1:2 |
| Paper Writing | Separate 10-minute upload-only window, direct upload or QR phone transfer, ordered private images, OCR and learner verification before evaluation |
| Speaking | Three-part timed practice, microphone setup, consented private recordings and history; live voice interviewing requires a separate feasibility stage |
| Learner workspace | Dashboard, goals, study planner, progress, mock history, bookmarks, recommendations, in-app notifications, export and deletion |
| Administration | Question bank, manual/bulk imports, test builder, content rights/provenance, mandatory human publishing review, settings and audit logs |
| Interface | Premium educational design, temporary branding permitted, sidebar, responsive layouts, dark/light themes, English/Bengali interface, accessible controls |

Exam questions and candidate responses remain in English. Full mocks suppress live assistance and protect answer keys. Estimated bands must never be presented as official IELTS scores. Missing results should use empty, pending or insufficient-data states.

## Architecture already selected by the documents

- **Web:** React with Next.js, TypeScript and Tailwind; server routes for privileged operations.
- **Hosting:** GitHub-to-Netlify workflow and an existing custom domain, whose actual details were not supplied.
- **Backend:** Supabase PostgreSQL, authentication, private storage and realtime updates; owner-based row-level security and server-verified admin privileges.
- **Authentication:** Verified email/password and Google sign-in; constrained guest practice, private enrollment and admin MFA.
- **Local AI:** Windows Python/PyTorch worker on the stated RTX 40-series 8 GB GPU and 32 GB RAM; 50 GB training allocation. The exact hardware is not verified.
- **Queue:** Durable, idempotent jobs with progress, retry, cancellation, leases and versioned results. The web app must continue working when the local worker is offline.
- **OCR:** CNN, two-layer BiLSTM and CTC, with recognition weights trained from random initialization; preserve raw OCR separately from learner-verified text.
- **Writing evaluation:** Compact fine-tuned encoder, deterministic checks and separately evaluated feedback generation. Task 1 needs verified chart facts or a validated visual component.

Next.js satisfies the React requirement and matches the supplied architecture. [Netlify's current documentation](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) supports Next.js rendering and server routes through its adapter. A Netlify web deployment is separate from the proposed local GPU process.

No hosted service configuration, real migrations, code, trained checkpoints or executed benchmark results are present. Model quality, free-tier availability, real-time voice and public-scale capacity remain unverified.

## Delivery sequence

| Phase | Deliverable | Important dependency |
| --- | --- | --- |
| 1 | Foundation: homepage, UI system, navigation, private auth/roles, profile, dashboard shell and deployment setup | Supabase/account configuration for connected functionality |
| 2 | Reading/Listening practice and mock engines, autosave, scoring, content versions | Actual approved practice content and audio |
| 3 | Typed/paper Writing, QR upload, private storage and durable job states | Secure backend, server deadlines and upload policies |
| 4 | Scratch OCR research and integration | Licensed handwriting data, human labels and measured training runs |
| 5 | Hybrid Writing evaluation and evidence-based feedback | Human-rated essays, chart facts and independent validation |
| 6 | Recorded Speaking and separate live voice feasibility work | Microphone/browser testing and a proven speech pipeline |
| 7 | Full administration, imports, content approval, analytics, planner and tutors | Versioned content/results and resource limits |
| 8 | Accessibility, security, privacy, backups, load testing and public-launch readiness | Verified release gates and a later decision to enable public access |

Phase 1 is a foundation deliverable; completing it does not mean all four exam engines or AI models are operational. The proposed numerical metrics remain “Not measured” until actual evaluation runs are performed.

## Inputs and files still needed

No additional requirements file is needed to begin the frontend foundation. The documents already allow a temporary brand. The following dependencies apply when connecting the corresponding real features:

| Input | Needed for | Supplied? |
| --- | --- | --- |
| Preferred site name, logo, favicon, colors or design references | Final branding; temporary branding can be used initially | No |
| Supabase project URL/public client key and server-side environment configuration | Real sign-in, saved results, private storage and backend operations | No |
| Initial authorized user/admin identity; Google OAuth setup | Private access and Google sign-in | No |
| Original/licensed passages, questions, answer keys, accepted variants and explanations | Reading and objective marking | No |
| Listening audio, transcripts, questions, answer keys and associated diagrams | Listening practice and full mocks | No |
| Writing prompts, Task 1 chart/map/process assets and verified source facts | Writing tasks and grounded evaluation | No |
| Speaking topics, cue cards and follow-up prompts | Speaking practice | No |
| Content source/license records | Permission to publish each practice resource | No |
| GitHub repository, Netlify site and custom-domain details | Actual user-hosted deployment and OAuth redirects | No |
| Licensed handwriting samples, transcripts, writer IDs and annotations | OCR research | No |
| Permitted essays, original prompts, human ratings and author/rater metadata | Writing evaluator research | No |
| Exact GPU model and local training environment | AI implementation and memory/latency measurement | Not verified |
| Consent, retention/deletion decisions and final privacy/terms content | Operational handling of accounts, essays and recordings | Not finalized |

Branding is optional for the first foundation. Training datasets and models are later-stage needs. Account configuration is required for connected features but not to write the application shell. A Netlify account token is not needed merely to prepare source code for the user to host.

Store secret credentials in local/server/hosting environment settings, not in documents, public assets or chat. Public client configuration is distinct from privileged server credentials. Any authored demonstration content must be identified as original practice material; demonstration AI scores must not impersonate measured evaluations.

Implementation files such as `package.json`, TypeScript and Next.js configuration, styles, React components, `.env.example`, SQL migrations, tests and deployment configuration will be created during implementation. The user does not need to supply these files.

## Details to resolve during implementation

1. **Requirement numbering:** R10 is referenced as phase/QA/governance in traceability without its own dedicated catalogue entry.
2. **Schema consistency:** The ER sketch uses generic `responses`, `models` and `evaluations` names, while detailed tables use `attempt_responses`, `model_registry` and `writing_evaluations`. Normalize names in migrations.
3. **Evaluation lineage:** Persist an explicit evaluated input-version reference so corrected text, model versions and results remain reproducible.
4. **Configurable rules:** Finalize answer normalization, band conversion/rounding, upload limits, storage retention, queue capacity and retry policy. These are not all concrete in the planning package.
5. **AI capacity:** “Unlimited” private usage means no per-user numeric quota; global budgets and concurrency still apply. The 100-500 concurrent-user target is an untested web target, not simultaneous GPU inference capacity.
6. **Speaking:** Recorded practice can precede live interviewing. Natural voice, pronunciation analysis and turn-taking need a separate validated pipeline.
7. **Historical scope text:** The source package records a planning-only stage. The current user request governs this review and organization step; it asks for findings and missing inputs before main-app creation.

These points do not require replacing the existing specification package. Routine technical choices can be recorded as implementation decisions; genuine content, accounts and model evidence cannot be invented.

## Proposed future application structure

The directories below are a plan, not existing application code. A single web app at the repository root keeps Netlify configuration straightforward; the Python worker stays separate.

```text
IELTS/
  src/
    app/                      Next.js routes, layouts and server handlers
    components/               Shared interface and exam components
    features/                 Auth, dashboard, four modules, admin, learning tools
    lib/                      Supabase clients, authorization, scoring, validation
    styles/                   Theme tokens and global styles
    locales/                  English and Bengali interface messages
    types/                    Shared application contracts
  public/                     Approved public branding and static interface assets
  supabase/
    migrations/               Versioned schema, RLS and storage policies
    seed/                     Approved development fixtures
  worker/                     Separate local Python AI worker and model adapters
  tests/                      Unit, integration and end-to-end checks
  docs/                       Reviewed specifications and implementation guides
  resources/                  Source content intake, outside public assets
  package.json                Future web dependencies and commands
  next.config.ts              Future framework configuration
  tsconfig.json               Future TypeScript configuration
  netlify.toml                Future deployment configuration if needed
  .env.example                Variable names/placeholders only
```

Large datasets and checkpoints should use configured local paths outside Git. Student submissions belong in access-controlled storage. Answer keys and unpublished content must not be shipped in `public/` or the browser bundle. The original empty `index.html` is retained now; a Next.js app will use framework routes/layouts as its entry point.

## Organization completed

Nine original documents were moved into `docs/specifications/` and `docs/compiled/`; `index.html` stayed at the root. A new root README, this review, a preservation manifest and a resource guide were added. Resource folders are reserved with placeholders only. No application code, dependencies, migrations, model training, service provisioning or deployment was performed.
