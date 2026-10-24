# IELTS Academic AI Preparation Platform
## Software Requirements Specification (SRS) — Baseline v1.0

**Status:** Requirements baseline for design and planning; no implementation authorized.  
**Product strategy:** Private personal release, designed for later public multi-user deployment.  
**Document date:** 25 October 2026.  
**Requirements coverage:** R01–R20, consolidated from the planning decisions.

### 1. Purpose and scope
Deliver a professional, accessible IELTS **Academic-only** preparation web application covering Reading, Listening, Writing and Speaking, with personal progress, optional AI assistance and an administrator-controlled question bank. The initial deployment is private and free-tier-first. Later public deployment is contingent on security, rights, AI quality, scaling and cost gates. IELTS is a trademark of its respective owner; the application must not imply official affiliation or certification. AI bands are **estimates, not official IELTS scores**.

### 2. Release boundaries and architecture
- Initial release: one authorized personal user, with a private admin role, on an existing custom domain; Google and verified email/password sign-in, plus constrained guest practice. Guest work is ephemeral unless a migration mechanism is explicitly designed.
- Frontend and application backend: Next.js, React, TypeScript, Tailwind; Next.js API routes/serverless functions. Host website using existing GitHub → Netlify free-tier deployment.
- Managed database, authentication and private media storage: Supabase PostgreSQL/Auth/Storage. User-owned data isolated with RLS and application authorization. Administrative privilege verified server-side, never inferred from the UI.
- AI: locally trained and locally run Python/PyTorch worker on Windows with RTX 40-series NVIDIA 8 GB VRAM, 32 GB system RAM. Asynchronous database-backed job dispatch; no assumed permanent GPU/cloud availability.
- No required paid hosting or paid API subscription at initial release. Free-plan quotas and availability are contingent on actual provider terms. Any payment/billing framework is future-only and disabled at launch.
- Target future capacity: 100–500 concurrent users is an aspirational *test target*, not a verified guarantee, and excludes any assumption of 100–500 simultaneous GPU inference sessions.

### 3. Roles and authorization
| Role | Permitted actions | Boundary |
|---|---|---|
| Guest | Try explicitly enabled, limited practice | No access to private results, uploads, or privileged AI |
| Student | Own tests, files, bookmarks, analytics, profile, consent and deletion | No other user's data; no answer-key access during active mocks |
| Administrator | Manage content, approve publication, users, settings and operational logs | Privileged access requires admin MFA and auditable actions |
| AI worker identity | Claim assigned jobs; read only authorized job-linked inputs; write versioned results | No student interactive permissions; narrowly scoped credentials |

### 4. Requirements catalogue — core functionality
Identifiers are stable references for implementation tickets and QA cases.

**R01 Public-capable accounts.** Design tenant-safe data boundaries from the start while limiting initial registration to private mode; later public enrollment is a controlled rollout.

**R02 Academic only.** Present IELTS Academic tasks, question patterns and evaluation terminology; do not add General Training.

**R03 Four modules.** Reading, Listening, Writing, Speaking, each with practice, result persistence, progress indicators and mode-specific access rules.

**R04.1 Reading.** Full mock: 3 passages, 40 questions, 60-minute clock. Other modes: passage-only and question-type practice. Features: timer, answer autosave, navigation, text highlighting, flagging, automatic key-based marks and *estimated* band mapping, post-attempt explanations, performance history, AI reading tutor, pre-submission unanswered review. Adaptive device layout. In exam mode, do not leak answers/feedback or allow unauthorized elapsed-time resets.

**R04.2 Listening.** Full mock: four 10-question parts, 40 questions, ~30-minute audio plus the configured computer-delivered review window (baseline: 2 minutes). Audio plays once, without pause, skip, rewind, speed control or replay in exam mode. Practice modes: individual part, question type, repeat listening, dictation. Practice audio features: play/pause, seek, 0.75–1.5× speed, segment replay, repeat, post-attempt transcript. Support multiple choice, matching, maps/plans/diagrams, form/note/table/flowchart/summary completion, sentence completion and short answers. Provide answer explanations, transcript alignment, spelling/word-limit validation, history, AI tutor, autosave/resume, flags and review; responsive layout. Actual computer test timing can vary by delivery method and must be configurable rather than hard-coded as an official universal rule.

**R04.3 Writing.** Full mock: Task 1 and Task 2 within a shared 60-minute timer; minimum instructed word counts 150 and 250; scoring weights 1:2 respectively. Modes: full mock, Task 1 practice, Task 2 practice, topic-based, untimed, rewrite/improve. Task 1 materials: line/bar/pie/table, process, maps/plans, mixed visuals. Task 2 labels: opinion, discussion, advantages/disadvantages, problems/solutions, two-part, positive/negative development (practice categories, not official score criteria). Editor: real-time word counts, autosave, task navigation, split screen, text sizing, practice-only planning notes and grammar feedback, version history and submission confirmation. AI scores and feedback estimate four official criteria: Task Achievement/Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy. Sentence corrections, comparison, vocabulary, organization, visual data checking, improved examples, progress and AI tutor. Live AI assistance is disabled during full mock; permitted for practice only.

**R04.4 Speaking.** Full AI interview approximating three parts across 11–14 minutes, including Part 2 one-minute preparation, short notes, 1–2 minutes speaking and examiner follow-up. Practice: parts, topics, cue cards, free AI conversation, pronunciation, repeat-and-improve. Natural voice plus static examiner avatar; accent selection; turn detection, interruption handling, microphone tests, reconnection and transcription; recordings privately stored with consent. Full mock blocks hints and follows part timing. Feedback: *estimated* fluency/coherence, lexical resource, grammatical range/accuracy, pronunciation (four equal criterion weights); transcript with corrections, improvements, history and tutor. Pronunciation must be assessed from audio, not text transcript alone. Real-time audio remains a feasibility-gated feature, not guaranteed by free deployment.

**R05 Accounts and learner workspace.** Email/password and Google OAuth; email verification, reset, remember session and constrained guest access. Profile name/photo, country/time zone, target bands, planned exam date, language level, daily goal, accessibility/localization preferences. Dashboard: estimated band (or insufficient-data state), module progress, mock history, resume, graphs, weaknesses, study planner, recommendations, streak/time tracking, reports and bookmarks. Account: manage linked identities and sessions, own results, recordings, consent, data export and deletion. In-app notifications for daily goals, exam date, results, weekly trends, streaks and security; no outbound email notifications selected. Roles: student and admin only.

**R06 Admin and content operations.** Platform overview, user control, content CRUD, test analytics, AI usage monitoring, audit trail, analytics export and configuration. Bank supports manual and bulk CSV/XLSX/JSON import, reading passages, listening audio/transcripts, Writing prompts/assets, Speaking cue cards, media, tags, answer keys/explanations, accepted spelling variants, word limits, search/duplicate detection, version history. Test builder manual/rule-generated, format templates, structural validation, preview, scheduling, difficulty balancing, clone and archive. AI may draft materials, TTS and explanations, but never independently grants publish authority. Publishing state machine: **draft → automatic validation → human/admin review → published**, with rejection and versioning. Content from original or legally licensed sources only; record license and provenance. MFA, protected endpoints, private storage, backup, audit, soft deletion and immutable attempt snapshots required.

**R07 Business model.** Entire app free in initial release. Reading, Listening, Writing and Speaking practice free; mock tests and AI/advanced analytics were labeled limited despite selected *unlimited daily numeric quotas* for Writing Evaluation, Speaking AI and tutor messages. Resolve operationally: no per-user numeric limit for private initial user, but enforce fair-use, concurrency and hard infrastructure/provider budget caps; no SLA for unlimited availability. Monthly/yearly plan configuration, multi-currency, card/local payment processing, renewal/cancel/invoices/webhooks/refunds, and monetization admin dashboards remain **future-design only**, disabled and excluded from MVP operational acceptance. Never store card details directly.

**R08 Technical baseline.** Next.js full-stack serverless, Supabase, provider-agnostic AI adapters, managed free-tier website, HTTPS, server-side secrets, RLS, rate limiting, backups, autosave/recovery, asynchronous AI jobs, observability, tests, CI/CD and staging. Future public-scale load tests mandatory.

**R09 UX and accessibility.** Premium AI-learning visual design, temporary brand, rich education illustrations outside exam-critical views, sidebar navigation, light/dark, responsive desktop/mobile, English and Bengali localization with more languages later. Pages: homepage, auth, dashboard, four modules, mock center, analytics, planner, bookmarks, profile, admin, FAQ, privacy/terms. Exam surface: distraction-free mode, sticky timer, bottom navigation, adjustable split panes, highlights/notes, zoom, configurable theme, keyboard shortcuts, autosave indicator, time alerts, submission confirmation and network recovery. WCAG 2.2 AA *target* subject to audit, screen-reader and keyboard support, visible focus, contrast and reduced motion. Actual IELTS prompts and candidate responses stay in English.

### 5. Expanded handwriting-based writing requirements
**R11 Dual writing mode.** Before mock start, choose computer-based typed submission or paper-based photographed submission. Both are IELTS-style practice simulations, not official administration. Paper simulation has 60 minutes to write physically and a separate 10-minute **upload-only window**; it is not 10 additional minutes of IELTS writing time. User cannot edit the timer server-side or access model scores while testing. Honour-system limitations must be disclosed.

**R12 Cross-device QR submission.** Desktop can directly upload image files or request a short-lived, signed/scoped QR transfer URL. Phone opens a narrow mobile page, uploads ordered pages, tags Task 1 versus Task 2, and submits; browser desktop receives realtime status and previews. Tokens are high-entropy, expire after the attempt's upload window, can be revoked, are limited by allowed file count/size/content types and never expose private storage credentials. Store images in private bucket and use authenticated/signed time-limited access, malware/type checks and duplicate prevention. Persist completion atomically and handle race between timeout and final upload.

**R13 Handwriting processing.** Image preprocessing (rotation, crop, deskew, contrast), page ordering/manual reorder, line detection, scratch OCR, paragraphs, confidence/uncertainty flags, page-level extraction and user verification. Keep immutable raw OCR and a separate verified-text version; OCR errors must not be mistaken for candidate grammar errors. Multiple photographed pages allowed.

**R14 Free AI infrastructure.** Local worker on Windows NVIDIA GPU, asynchronous Supabase job table, optional future verified free cloud compute. No assumption of always-on GPU, free voice streaming or paid API dependency. Worker pulls authorized jobs; client never calls an insecure local LAN endpoint. Cloud-hosted frontend must continue working when worker is offline, with clear pending/failure states.

**R15 Writing evaluation safeguards.** Feed OCR-verified or directly typed response, prompt, task type and verified chart/structured visual context to rubric-aware evaluation. Persist four estimated criterion bands, task weighting, evidence, uncertainty, model/dataset version, reviewer corrections and original response. Allow abstention for invalid input or insufficient evidence.

### 6. Model and data requirements
**R16 Models.** OCR recognition must be trained **from random initialization** (CNN + two-layer BiLSTM + CTC) rather than fine-tuning pretrained recognition weights. This does not prohibit standard image processing. Hybrid writing system: compact pretrained encoder scorer fine-tuned for human-rated writing, deterministic rule checks and separately validated feedback language model. Do not claim encoder alone understands task-specific images; verified structured chart data or a validated visual component is needed. Store only best validation deployment checkpoint; temporary crash-recovery files may be retained only under explicit retention controls.

**R17 Data.** Licensed public research data plus separately collected data, human-reviewed labels and audit. Split 80/10/10 without writer leakage for OCR or author/prompt leakage for writing. IAM-like datasets may restrict commercial use; provenance/consent must be recorded. No synthetic IELTS labels presented as genuine examiner ratings. Protect test split from tuning; freeze evaluation corpora.

**R18 Architecture and deployment.** CRNN OCR and hybrid writing scoring; local GPU worker plus Supabase queue; job progress asynchronous; best checkpoint. No coding or training until approved implementation stage.

**R19 Hardware baseline.** NVIDIA RTX 40-series 8 GB GPU, 32 GB RAM, Windows, local-only training, 50 GB training allocation and on-demand worker. Experimental initial OCR settings: grayscale line height 48 px, variable width buckets, two-layer BiLSTM hidden size 256, batch 8 (adaptive), AdamW, AMP if stable, early stopping, up to 100 epochs as *trial budget*. Writing initial encoder batch 4–8 with accumulation if needed. Serialize heavy GPU jobs; never guarantee model or latency capacity without benchmark.

**R20 Integration/release.** Durable status lifecycle, realtime progress, retry, deduplication, timeout recovery, cancellation, priority, monitoring and temp cleanup. OCR comprehensive evaluation; writing human-rated comparison; personal validated prototype gate; full versioning; failed jobs persist and retry; uploaded originals private until user deletion or applicable retention policy. Only opt-in data may be used for future model training.

### 7. Non-functional requirements (NFR)
| ID | Requirement | Initial acceptance criterion |
|---|---|---|
| NFR-01 | Privacy and auth | Cross-user reads/writes denied; all RLS routes and bucket policies tested |
| NFR-02 | Data integrity | Autosave and upload are idempotent; historical mock results preserve question/model versions |
| NFR-03 | Recoverability | Worker-offline, browser refresh, failed OCR and network interruptions preserve submissions |
| NFR-04 | Accessibility | WCAG 2.2 AA target; documented manual + automated audit and remediation |
| NFR-05 | Browser support | Chrome, Edge, Firefox, Safari smoke/end-to-end matrix, with device-specific mic caveats |
| NFR-06 | Localization | English and Bengali interface; test prompts and responses in English |
| NFR-07 | Observability | Job and authentication errors logged without exposing raw essays/secrets unnecessarily |
| NFR-08 | Maintainability | TypeScript types, DB migrations, API contracts, CI, environment-based config |
| NFR-09 | Rights and consent | Content licensing inventory, upload consent, opt-in training-data reuse |
| NFR-10 | Cost safety | Provider/API budget caps, storage monitoring and fail-closed optional AI paths |

### 8. Critical acceptance scenarios
1. A signed-in user completes Reading mock; exactly 40 answers are scored from immutable answer keys; latest estimated band and history display; no answers leaked during active attempt.
2. Listening exam plays once at normal speed; refresh/seek cannot trigger a free replay, and connection failures create an explicit disrupted-attempt status.
3. User completes 60-minute paper Writing mock, scans QR with phone, uploads Task 1/2 pages in 10-minute upload window; desktop status updates without exposing any personal file publicly.
4. Local AI worker is off: document uploads and jobs remain safe and visible as queued. Worker later starts and processes each eligible submission once; duplicate events do not produce duplicate results.
5. OCR marks uncertain text; user corrects transcription; evaluation uses **verified** text, and corrections do not overwrite original scan or raw OCR version.
6. Writing response and task prompt produce four estimated criteria with evidence, version IDs and uncertainty; invalid chart/context or insufficient information abstains rather than confidently fabricating a score.
7. Unapproved generated content fails to appear in public test bank; administrative approval and audit trail are required.
8. Guest cannot view signed-in profile, read files, run privileged AI endpoints or promote self to admin.
9. Account deletion removes or schedules deletion of data under documented retention and backup policies; protected logs retain only permitted minimum.
10. Mobile/desktop keyboard navigation, focus, timer warnings and screen-reader labels are tested.

### 9. Explicit exclusions and deferred decisions
- Not an official IELTS exam; no official score guarantee; no remote invigilation guarantee.
- Native mobile app, live paid subscriptions, paid voice providers and public-scale GPU hosting excluded from initial release.
- Continuous 24/7 local model availability not promised. Real-time Speaking remains an R&D milestone requiring feasibility tests; no unsupported claim of fully self-hosted, unlimited voice AI on 8 GB VRAM.
- Reference/acceptance for estimated band conversion, scoring calibration, OCR thresholds, latency SLAs and hosting quotas must be determined empirically. Do not invent achieved accuracy.
- Confirm precise RTX model, applicable public-dataset licenses, evaluator access, intended volume, full privacy jurisdiction and payment provider availability before public launch.

### 10. Requirements traceability
R01–R03: platform and modules; R04.1–R04.4: subject engines; R05: account/dashboard; R06: admin/content; R07: payment/access; R08: infrastructure; R09: UX/accessibility; R10: phase/QA/governance; R11–R15: paper writing, cross-device upload and safeguards; R16–R20: custom AI, data, compute, evaluation and deployment.

**Change control:** Any modification after this baseline must record ID, reason, impact on security/cost/UX and acceptance test changes. This package is a design baseline and does not assert functionality is implemented.
