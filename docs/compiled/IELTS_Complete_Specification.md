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
# AI Architecture & Integration Specification
**Version 1.0 | Planning only | 25 October 2026**

## A. Purpose and invariant principles
Use two user-owned models, built in phases: (1) English handwriting recognition from scratch; (2) hybrid IELTS Writing criterion estimation. Use asynchronous local inference on Windows RTX 40-series GPU (8 GB VRAM, 32 GB RAM). Web app remains hosted on Netlify; Supabase coordinates private inputs and outputs. The website must not depend on the worker being online. Model performance is unknown until tested.

## B. Trust and processing boundaries
1. **Browser / phone:** authenticated page submits images using server-mediated, scope-limited signed upload instructions. No Supabase service role, model credential or privileged API key leaks client-side.
2. **Next.js API:** authorizes attempts, checks 60-minute writing phase and 10-minute upload-only deadline server-side, issues expiring QR upload tokens, validates file metadata, records attempt and enqueues work after upload completion.
3. **Supabase:** private objects, RLS-protected records, durable job table, realtime status broadcasts limited by owner access. Store opaque storage references rather than raw essay text in job payload.
4. **On-demand Python worker:** uses securely held machine-local credentials; claims a job transactionally, downloads its allowed objects by scoped mechanism, validates media and runs model locally. Never expose a worker HTTP server publicly just to connect Netlify to localhost.
5. **Human verification checkpoint:** OCR prediction is not directly treated as student-authored spelling; before scoring, the student approves or corrects extracted text.
6. **Writing scorer:** consumes verified text, exact prompt, task type, task-1 chart or verified structured description, scoring rubrics and versioned model configuration.
7. **Results:** atomic versioned score/feedback write, job completion, audit and realtime student notification. All numeric bands labeled "Estimated / Experimental".

### Paper writing state machine
`created → writing_active (60 min) → upload_open (10 min) → submitted → queued_ocr → processing_ocr → awaiting_text_verification → queued_scoring → processing_scoring → completed`

Alternate states: `upload_expired`, `cancelled`, `failed_retryable`, `failed_terminal`, `disrupted`. Computer writing skips upload/OCR/verification and enters `queued_scoring` after submission. Timer and QR token expiry are checked on server; a user cannot extend the window by clock manipulation. Post-upload image quality problems may require manual handling without silently extending the mock rules.

### Job reliability design
- Unique constraint on `(attempt_id, operation, input_version, model_version)` to avoid double billing/scoring; worker claims via database lock/lease.
- Acknowledgment after results are durably committed. Use lease expiration, capped exponential backoff, dead-letter state and reason codes. No unconditional infinite retries.
- Queue polling or realtime notifications; statuses are owner-filtered, and a worker heartbeat indicates online/offline. GPU-intensive training and inference are serialized.
- On-demand worker can be offline indefinitely; "Queued — AI worker offline" must be shown instead of an artificial completion ETA.
- Avoid storing model inference secrets or raw user inputs in error logs. Retain minimal diagnostic metrics and configurable retention policies.

## C. Model 1 — Scratch CRNN English OCR
| Component | Initial research design |
|---|---|
| Recognition input | Cropped, normalized grayscale line images; height 48 px, variable width |
| Page processing | Detect page boundaries, lines, reading order and paragraphs as separately benchmarked components |
| Visual encoder | Lightweight 4–5-stage CNN; random initialization |
| Sequence module | 2-layer bidirectional LSTM, hidden size ~256 per direction, subject to VRAM budget |
| Output | Character vocabulary including spaces, punctuation and CTC blank |
| Criterion | CTC loss; validate time-step width vs label length |
| Optimizer | AdamW; initial learning rate ~1e-3 to be tuned on validation only |
| Batch/precision | Batch 8 initially, length bucketing, AMP only if numerically stable |
| Epoch policy | Early stopping; first trial up to 100 epochs, not a promised convergence point |
| Artifact | Best-validation recognition checkpoint + tokenizer/charset/preprocess definition; hash & metadata |

**Scratch definition:** train recognition network weights from random initialization; use no pretrained OCR recognition weights. Page detection may use traditional CV components, provided documentation separates pretrained and non-pretrained elements. Model must be tested on unseen writers and noisy photographed IELTS pages, not solely clean scanned lines.

**Confidence:** CTC logits or decoding scores are not automatically calibrated uncertainty. Calibrate on held-out validation examples and show low-confidence text regions; abstain when confidence is unreliable.

## D. Model 2 — Hybrid Writing Evaluation
- **Rule layer (deterministic):** counts, answer presence, section completeness, input validity, explicit required word thresholds, prompt/asset linkage. A below-minimum response is not automatically assigned a fixed official band; flag it for rubric consideration.
- **Small encoder scorer:** pretrained compact text encoder fine-tuned on legitimately sourced human-rated responses. Output four criteria, with per-criterion metrics. Long essays require chunking/hierarchical pooling and ablation checks; simple truncation of essay endings is unacceptable.
- **Task 1 grounding:** feed both source image and validated structured chart facts, or independently evaluated vision module; no task-1 data-accuracy judgment if factual source data unavailable.
- **Feedback model:** separately evaluated small generative model, limited to cited student phrases and actual input; enforce schema of claim, location, suggested correction, reason, confidence. It must not fabricate student sentences.
- **Scoring:** aggregate four IELTS Writing criteria within each task under a documented rubric, Task 2 weight twice Task 1. Rounding of a final estimated writing band must be documented and tested; never imply the internal heuristic is the official examiner's hidden calculation.
- **Safety:** suspicious/incomplete OCR, missing chart, incoherent evidence, out-of-distribution scripts or uncertain scores trigger "Review required"/"Unable to estimate reliably".
- **Versions:** retain scorer, feedback model, rubric, dataset and preprocessing versions separately; do not overwrite old report after a model upgrade.

## E. Training/inference resource strategy
**Available:** NVIDIA RTX 40 family, 8 GB VRAM, 32 GB RAM, Windows; precise card unknown; reserved 50 GB training space. Train OCR and writing separately. One heavy GPU worker at a time; reserve headroom for display/OS. Initial working batches 8 OCR, 4–8 writing, adjust after out-of-memory measurement. Mixed precision, bucketing, gradient accumulation and early stopping as evaluated. Large generative feedback is a feasibility dependency rather than committed locally trainable capability at 8 GB.

**Local worker lifecycle:** manually start when needed; authenticate, register heartbeat, claim pending jobs; stop gracefully after job completion. If worker stops midway, an expired lease allows safe reprocessing. A public version needs always-available compute or a clearly labeled best-effort processing policy.

## F. Security and consent
- QR URL: unpredictable one-purpose, one-attempt token; hash tokens at rest; expiry aligned with upload window; rate limit, file size/count limit and revoke. An upload token may upload but must not download other objects or change answers.
- Image handling: verify decoded type, limit pixels, handle EXIF orientation, strip unwanted metadata, enforce maximum bytes/pages and quarantine suspicious content.
- Storage: private bucket + signed read links with short validity; user-controlled deletion and retention policy; optional explicit opt-in for training reuse, independent of evaluation consent.
- Supabase: students RLS-own their attempts, uploads and feedback; admin privileges checked server side with MFA; worker scoped to claim/complete only allowed jobs. Service-role keys bypass RLS and must never be embedded in app/browser code.
- Observability: structured operational logs without credential/PII leakage; access and model-version auditing.

## G. Acceptance / failure tests
1. QR upload from a phone appears on desktop for its own attempt only.
2. Expired QR or cross-user token cannot access uploads/answers.
3. Local worker offline does not lose submissions and does not falsely claim completion.
4. Simulated duplicate job creation results in exactly one active result version.
5. Uncertain OCR must be corrected or explicitly verified before scoring.
6. Task-1 evaluator refuses unsupported chart-accuracy claims when visual grounding absent.
7. Worker crashes during checkpoint/result commit; job eventually recovers without partial scored state.
8. Logged metrics report throughput, median/p95 inference time, GPU peak memory, success/failure and user-visible latency. Benchmarks are measured, never fabricated.

## H. Speaking AI dependency
Speaking is part of the product requirements but **not included in the two custom writing models**. Real-time turn-taking, speech-to-text, pronunciation acoustics and synthesized voice require their own separately validated architecture. A local 8 GB GPU and a free Netlify tier do not guarantee acceptable continuous real-time voice. Treat it as a future feasibility gate; provide manual/audio-recorded practice paths if live voice cannot be supplied within free resource limits.
# Database Design & Data Governance
**Version 1.0 — Proposed relational schema, not executable migrations.**

## 1. Design principles
Supabase Postgres owns transactional state and row authorization. Supabase Storage owns private images/audio; large model checkpoints remain on local trusted storage or a versioned model registry rather than database blobs. Every mutable business row should include UUID key, timestamps, owner or scope, and soft-delete fields where appropriate. Use foreign keys, uniqueness and selective indexing; constrain enum-like statuses at DB level. Text scores are estimates with explicit algorithm provenance.

## 2. Entity relationship overview
`auth.users → profiles → test_attempts → responses → ai_jobs → ocr_outputs / evaluations → feedback_items`

`test_definitions → test_versions → sections/passages → questions → answer_key_versions`

`test_attempts → uploads → storage.objects`

`models → model_versions → evaluations`

`users → goals / bookmarks / progress_snapshots / notifications / consent_records`

`admins → content_reviews / audit_events`

## 3. Core tables and fields
| Table | Core fields (illustrative) | Key constraints and notes |
|---|---|---|
| `profiles` | `user_id`, `display_name`, `country`, `timezone`, `language`, `target_overall`, `exam_date`, `study_goal_minutes` | `user_id` FK auth.users unique; own-row RLS |
| `user_roles` | `user_id`, `role`, `assigned_by`, `assigned_at` | Roles student/admin; admin grant restricted |
| `test_definitions` | `id`, `module`, `title`, `difficulty`, `content_license_id`, `created_by` | Module enum; draft metadata |
| `test_versions` | `id`, `test_id`, `version`, `status`, `published_at`, `approved_by`, `timer_config_json`, `content_hash` | Immutable published versions; unique `(test_id,version)` |
| `test_sections` | `id`, `test_version_id`, `ordinal`, `section_type`, `passage_text`, `audio_asset_id`, `image_asset_id` | Question/asset references are versioned |
| `questions` | `id`, `section_id`, `ordinal`, `question_type`, `prompt_json`, `word_limit`, `tags_json` | Unique ordinal per section; validate type schema |
| `answer_key_versions` | `id`, `question_id`, `version`, `accepted_answers_json`, `explanation`, `verified_by` | Never client-fetch during open exam |
| `content_assets` | `id`, `storage_key`, `media_type`, `sha256`, `license_id`, `owner_id` | Private uploads, validated MIME/size |
| `content_licenses` | `id`, `source_name`, `source_url`, `rights_basis`, `permitted_uses`, `expires_at`, `review_status` | Rights clearance before publication |
| `content_reviews` | `id`, `test_version_id`, `reviewer_id`, `decision`, `review_notes`, `created_at` | Human approval enforced by publish transition |
| `test_attempts` | `id`, `user_id`, `test_version_id`, `module`, `mode`, `status`, `started_at`, `writing_ends_at`, `upload_ends_at`, `submitted_at` | Server-authoritative deadlines; guest policy separately scoped |
| `attempt_responses` | `id`, `attempt_id`, `question_id`, `answer_json`, `version`, `saved_at` | Unique `(attempt_id,question_id)`; optimistic version to avoid overwrite |
| `writing_submissions` | `id`, `attempt_id`, `task_number`, `typed_text`, `input_type`, `submitted_at`, `verified_text_version_id` | Unique `(attempt_id,task_number)`; immutable after submission |
| `upload_sessions` | `id`, `attempt_id`, `token_hash`, `expires_at`, `revoked_at`, `max_files`, `used_files` | Tokens only grant upload; never store raw token |
| `submission_uploads` | `id`, `attempt_id`, `task_number`, `page_order`, `storage_key`, `sha256`, `validated_at`, `uploaded_at` | Unique ordered page per task; private file |
| `ocr_text_versions` | `id`, `upload_id`, `model_version_id`, `raw_text`, `corrected_text`, `verification_state`, `verified_by`, `verified_at` | Store raw and user-corrected separately; never silently overwrite |
| `ai_jobs` | `id`, `attempt_id`, `operation`, `input_version`, `model_version_id`, `status`, `priority`, `lease_owner`, `lease_until`, `retries`, `last_error_code` | Dedup unique key; transactional claim; indexes on `(status,priority,created_at)` |
| `model_registry` | `id`, `model_family`, `task`, `description`, `license`, `created_at` | OCR, writing scorer, feedback, future speech |
| `model_versions` | `id`, `model_id`, `semantic_version`, `checkpoint_hash`, `dataset_version`, `config_hash`, `metrics_json`, `approved_for_personal` | Immutable artifact lineage |
| `writing_evaluations` | `id`, `attempt_id`, `task_number`, `scorer_version_id`, `feedback_version_id`, `rubric_version`, `criteria_json`, `estimated_band`, `uncertainty_json`, `evaluation_status` | No unsupported score on abstention; unique by evaluated input/model version |
| `feedback_items` | `id`, `evaluation_id`, `response_span`, `criterion`, `issue`, `suggestion`, `evidence`, `confidence` | References real student text and prompt |
| `practice_scores` | `id`, `attempt_id`, `raw_correct`, `raw_total`, `estimated_band`, `score_map_version` | Reading/Listening deterministic; version conversion tables |
| `study_goals` | `id`, `user_id`, `date`, `target_minutes`, `completed_minutes` | Unique `(user_id,date)` |
| `bookmarks` | `id`, `user_id`, `question_id`, `note` | Unique `(user_id,question_id)` |
| `progress_snapshots` | `id`, `user_id`, `module`, `period`, `metrics_json` | Derived; rebuildable |
| `notifications` | `id`, `user_id`, `type`, `payload_json`, `read_at` | In-app only; user-owned |
| `consent_records` | `id`, `user_id`, `scope`, `policy_version`, `granted_at`, `withdrawn_at` | Separate evaluation consent and training-data opt-in |
| `audit_events` | `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `timestamp`, `metadata_json` | Write-only for student; controlled admin reads |

## 4. RLS and role policy matrix
| Resource | Student | Administrator | Local AI worker |
|---|---|---|---|
| Profile / goal | Own read/write | Controlled administrative read | No access by default |
| Published question metadata | Read if entitled | CRUD via protected server | Read job-relevant version |
| Hidden answer key | Only after attempt if allowed | Protected CRUD | Read if scoring job requires |
| Attempts and submissions | Own read/write within timed state | Limited case review with audit | Read only assigned job data |
| Private handwritten media | Own via restricted signed URL | Review with audit | Assigned object only |
| Scores and OCR output | Own read; verified correction writes only | Reviewed access | Write scoped results |
| Queue and logs | Own job status only | Monitored view | Atomic claim/complete via privileged function |
| Model files / secrets | None | Deployment-controlled | Locally held minimal permissions |

**Critical design:** Supabase service-role key bypasses RLS. Do not put it in browser bundles, QR upload links or publicly exposed endpoints. Prefer server-side narrowly scoped RPCs for claim/complete operations; verify token claims and access policies. Guest access must never receive privileged rows.

## 5. File and upload governance
- Storage buckets conceptually: `content-private`, `student-uploads-private`, `speaking-recordings-private`; never public by default.
- Uploads pass byte length limits, extension + MIME + decoded format checks, image dimension limits, EXIF orientation handling, hash dedup, scan/quarantine policy and authorized page order.
- QR sessions bind to `attempt_id` and task upload phase, use high-entropy hashed token; short TTL not beyond upload deadline. QR is an upload capability, not an authentication bypass.
- Retention selected: user-controlled private image retention until deletion or published retention policy. Backups and audit/event deletion timelines need separate documented durations. Training use only after distinct opt-in.
- Historical attempts reference exact published test/answer key and model versions even when content changes later.

## 6. Transactions and indexes
- Save answer with monotonic `version` to avoid last-write-wins loss from delayed requests.
- Finalize upload and enqueue OCR in one transaction or transactional outbox; ensure retry safe operations.
- Job claim via `FOR UPDATE SKIP LOCKED` or suitable queue abstraction; `lease_until` permits recovery.
- Use index on `test_attempts(user_id,started_at DESC)`, `submission_uploads(attempt_id,task_number,page_order)`, `ai_jobs(status,priority,created_at)`, `writing_evaluations(attempt_id,task_number)` and `audit_events(timestamp)`; verify with query plans.
- Materialize derived progress snapshots periodically only if needed. Do not use summary rows as authoritative source of exam answers.

## 7. Migration and review policy
Schema changes shipped as versioned migrations with rollback/test plan. Validate `ON DELETE` semantics for user deletion without accidentally deleting shared licensed content. Establish backup/restore drill before public enrollment. A future subscriptions schema may be designed separately, but not installed as an active billing system for private MVP.

## 8. Data deletion and privacy tests
A user can export own essays/results/media references and request deletion; deletion cascades to user-owned rows and private objects while respecting documented minimal security logging and backup expiration. Anonymous/guest attempts expire rather than accumulating unowned sensitive files. Test RLS by attempting read, update, signed-URL reuse, QR replay and forbidden admin operations across at least two separate accounts.
# AI Model Evaluation, QA & Release Protocol
**Version 1.0 | Research prototype; measurements pending.**

## 1. Evaluation governance
All published numerical model results must come from executed, reproducible runs; until then label metric cells **Not measured**. Do not use guessed values or model-generated examiners as ground truth. Store provenance and dataset permission. Separate *engineering success* (system operates) from *measurement validity* (model agrees with independent ground truth) and *production fitness* (sufficient reliability, privacy, resources, cost).

## 2. Dataset and leakage prevention
| Aspect | OCR | Writing evaluation |
|---|---|---|
| Source | Licensed research forms + consented IELTS handwriting | Licensed essays + IELTS-related examiner-scored essays with permitted use |
| Required labels | Exact transcript, writer ID, line/paragraph bounds/order | Original prompt, response, task number, criterion-level human marks where available, score source, rater IDs where permitted |
| Split | 80/10/10 writer-independent, stratify by legibility/domain | 80/10/10 group by author + prompt/topic family to minimize leakage |
| Validation | Tune training and calibrate confidence | Choose checkpoints, thresholds and calibrate uncertainty |
| Final test | Locked once; no hyperparameter tuning | Locked once; no prompt re-engineering on test |
| Rights | Research-only source cannot silently become commercial data | Do not recode arbitrary essay scores as official IELTS bands |

Synthetic images or model-produced feedback can supplement training with explicit provenance, but never substitute for genuine human labels in the independent evaluation set. Datasets with shared prompts, paraphrases or repeated writers require group-aware de-duplication.

## 3. OCR evaluation
- **CER =** `(substitutions + deletions + insertions) / reference characters` (document convention for whitespace and punctuation).
- **WER =** `(word substitutions + deletions + insertions) / reference words` (tokenizer and normalization documented).
- Report line-level macro and corpus-level micro CER/WER; explain which is primary. Evaluate *end-to-end page* quality separately (detection errors, line ordering, paragraph preservation), not just pre-cropped recognition.
- Slices: neat/messy handwriting, unfamiliar writers, blur, shadows, rotation, mixed pen/pencil, lined/plain paper, punctuation, digits, task 1/2 and long essays.
- Report missing/extra lines, failed page count, OCR abstention, calibration for low-confidence warnings, inference latency median/p95, CPU/GPU peak memory and image upload/processing failures.
- Keep at least 20 qualitatively reviewed errors in final research report when data exists, with image excerpt and corrected reference, only if sharing rights permit.

## 4. Writing score evaluation
- Independently human-rated Task 1 and Task 2 essays are the target comparator. Document rater expertise, rating rubric, adjudication of disagreement and any missing marks. If only total human band is available, do not claim criterion-specific accuracy.
- Primary numeric measures: criterion and total **MAE**, **quadratic weighted kappa (QWK)**, and percentage within ±0.5 band; report sample count and confidence intervals when feasible. Include human-vs-human agreement as a ceiling/context if possible.
- Evaluate Task 1 chart-dependent correctness against verified source data, including unsupported numbers, missing overviews, fact contradictions and chart-withholding abstention.
- Human raters judge feedback evidence accuracy, error relevance, actionable suggestions and fabricated quotations; record hallucination/error rates and disagreement. Do not assume a fluent feedback explanation proves a correct band.
- Compare baseline rules-only, compact scorer-only, scorer+rules, and hybrid+feedback; keep same locked final test set.
- Test typed vs paper OCR-derived verified answers; quantify incremental score drift caused by OCR corrections (should converge to same verified text, otherwise bug).
- Set prospective acceptance thresholds **after** baseline measurement and review, not post-hoc to make model look successful.

## 5. Writing score calculation checks
1. Each task has four named criteria, rubric version and a documented method for combining them into a task estimate.
2. Task 2 counts twice Task 1 in combined estimated score. Example calculations are labeled illustrative and do not claim knowledge of examiner-internal scoring mechanisms.
3. Band rounding procedure is formally specified in scorer configuration and tested at .25/.75 cases, subject to valid rubric aggregation rules.
4. If image/prompt missing, verified OCR absent, output invalid or evidence ungrounded, result is `review_required` / `unable_to_estimate` rather than an invented number.
5. Never label experimental scorer output “official IELTS grade”.

## 6. Integration and operational testing
| Test ID | Scenario | Pass criterion |
|---|---|---|
| INT-01 | Computer Writing submitted | Exactly one queued scorer job with immutable submitted text |
| INT-02 | Paper Writing QR upload | Token scoped to attempt, phone images visible on desktop, page order verified |
| INT-03 | Timer abuse | Browser clock changes, reload or forged requests cannot extend 60+10 windows |
| INT-04 | QR expiry/replay | Expired/revoked/replayed token cannot upload or read another user's work |
| INT-05 | Worker offline | Uploads and queued jobs persist; UI shows pending |
| INT-06 | Retry/dedup | Worker crash, timeouts and duplicate events do not produce conflicting evaluations |
| INT-07 | OCR correction | Verified text is used; original scan and raw OCR remain accessible to owner |
| INT-08 | Cross-user security | RLS, admin checks and storage permissions deny all unowned reads/writes |
| INT-09 | Training consent | No retained user images added to training without explicit revocable opt-in |
| INT-10 | Results | Each result includes model version, rubric version, estimated label and uncertainty |
| INT-11 | Listening audio | Full mock never grants replay or unlimited audio-control privileges |
| INT-12 | Accessibility | Keyboard, screen reader, contrast, resize, focus and reduced-motion audit completed |
| INT-13 | Offline session | Autosave reflects last successfully persisted version; sync conflicts handled |
| INT-14 | Recovery | Backups restored in a tested environment; loss/inconsistency recorded |

## 7. Threat model focus
- Hostile QR replay, forged storage object paths, upload bombs/huge images and attempts to leak unapproved answer keys.
- Authorization bypass via service-role key, unguarded worker RPC, overly permissive RLS, guest privilege escalation or browser-only subscriptions.
- AI prompt injection hidden in essay/handwriting content; it is task data, not operational instructions. Model outputs must conform to schema and cannot dictate job/publish actions.
- Model poisoning through unconsented or forged labels. Dataset manifests contain source/licensing and review status.
- DoS via unrestricted inference jobs. Use global budget caps and capacity controls even if private MVP has no per-user numeric quota.

## 8. Release stages and gates
**Gate 0 — Data readiness:** ownership/license checks, writer/author/prompt de-dup, annotated validation and frozen test protocol.

**Gate 1 — Baseline trained:** best checkpoint exists and loads on 8 GB GPU; reproducible logs, CER/WER/MAE/QWK measured where labels exist; training failures documented.

**Gate 2 — Validated personal prototype (selected):** held-out dataset evaluation, error review, at least sample human feedback review, clear uncertainty/abstention and demo end-to-end typed/paper flow. Report experimental limitations; this is not a validated medical/legal-grade or official testing service.

**Gate 3 — Multi-user beta:** penetration/RLS testing, backup/restore drills, rights approval, accessibility audit, consent, operations/availability testing and separate voice feasibility validation.

**Gate 4 — Public launch:** security/privacy/legal sign-off, published support/disclaimer, verified provider quotas and cost budget, scalability testing for 100–500 concurrent *web users*, plus measured separate concurrency limits for GPU writing and voice sessions.

## 9. Reproducibility report template
Record run ID, source manifest and license, anonymized corpus counts, split hashes, seed, architecture/optimizer/learning rate/batch/precision/epoch, computer GPU and driver/CUDA, checkpoint SHA-256, exact code commit, primary/secondary metrics, uncertainty and per-slice errors, manual review notes, final gate decision. Publish results only after execution; never backfill benchmark numbers from estimates.
# Phased Development Roadmap & Delivery Checklist
**Version 1.0 | Private-first, free-tier-first, quality-gated.**

## 1. Delivery strategy
Build each stage as deployable and demonstrable without promising that later compute-heavy AI capabilities will run on free hosting indefinitely. The current authorization is **planning/documentation only**: do not write application code, train models, purchase services or deploy without explicit new instruction. Each phase has prerequisites, deliverables and exit gate; dates are deliberately uncommitted until effort and resources are measured.

## 2. Dependencies
- Phase 1 platform foundation is prerequisite for all subsequent web integration.
- Phase 2 content/attempt engine and RLS underpins Writing and Speaking exams.
- Phase 3 Writing + QR image pipeline depends on Supabase private media and realtime status.
- Phase 4 scratch OCR depends on licensed data, annotation and hardware baseline.
- Phase 5 evaluator depends on human-rated essays and verified text pipeline.
- Phase 6 live Speaking depends on feasibility of speech/audio inference under 8 GB GPU and free compute constraints; prototype before committing public SLA.
- Phase 7 admin/analytics depends on immutable test and score versions.
- Phase 8 public rollout depends on all applicable security, rights, privacy, QA and load gates.

## 3. Phase plan
### Phase 1 — Foundation & private deployment
**Scope:** project scaffolding, repo conventions, premium dark/light design tokens, homepage/login, private student/admin authorization, Google/email + reset, Supabase schema/RLS and private buckets, profile, initial dashboard shell, domain + Netlify deployment, secrets policy, CI/staging and audit logging.

**Deliverables:** authenticated site, role checks, reproducible environment setup, navigation and empty-state UI, secure migration scripts, first E2E test suite, deployment guide.

**Exit:** private access enforced from server; no service-role key client-side; signup and logout verified; two-user RLS negative tests pass; automatic deployment works.

### Phase 2 — Reading and Listening exam engines
**Scope:** content/test versioning and test player, Reading 3 passages/40/60; Listening four parts/40 and exam-only once-play audio, practice controls, autosave, timed submission, bookmarks, answer key explanations after exam, progress history, adaptive layout.

**Deliverables:** accessible reading/listening mock and practice, deterministic scoring and versioned band mapping, test-admin manual content entry/preview.

**Exit:** all answer/question-type tests pass; refresh/clock manipulation doesn't create extra mock time; listening replay restriction tested; cross-browser access smoke tests pass.

### Phase 3 — Dual-mode Writing, QR transfer and job platform
**Scope:** typed Writing Task 1/2 editor, timed shared 60-minute mock; paper mock with 10-minute upload-only phase, direct desktop file upload and mobile QR handoff, private images, per-task ordered pages, image quality checks, realtime status, persistent AI jobs, user text verification UI, error/retry states.

**Deliverables:** secure QR upload and typed/paper submissions independent of whether model is trained; sample/mock worker status (not fabricated evaluation scores).

**Exit:** unprivileged QR cannot read answers, token expires, phone-to-desktop sync, atomic submission, worker-offline pending state and replay/duplicate protections pass.

### Phase 4 — Scratch CRNN OCR research and integration
**Scope:** licensed data intake and human annotation, writer-independent 80/10/10 split, CNN–BiLSTM–CTC scratch baseline, 8 GB VRAM experiment, CER/WER and page quality/error analysis, confidence review and best checkpoint packaging, local worker integration.

**Deliverables:** versioned dataset manifest, training/evaluation notebook/scripts *after approval*, trained best checkpoint only after actual run, reproducibility report, OCR text verification UI integration.

**Exit:** baseline independently measured, bounded GPU memory, actual unseen-writer tests, manual review/checkpoint reproducibility and fallback when unreadable.

### Phase 5 — Hybrid Writing evaluator research
**Scope:** legitimately sourced/rater-verified writing labels, prompt-aware small encoder and rule-based checks, task-1 visual grounding, feedback generation evaluation, scoring calibration, criterion analysis, 1:2 task weighting, versioning and uncertainty gates.

**Deliverables:** model card, measured MAE/QWK per task/criterion, human-rater comparison, traceable feedback with text evidence and no unsupported claims.

**Exit:** validated personal prototype release gate; typed and OCR-corrected answers yield consistent scoring, uncertain cases abstain, human review completed.

### Phase 6 — Speaking practice and AI feasibility
**Scope:** recorded speaking practice, three-part test flow and time controls, secure consent, speech transcription, acoustic pronunciation research, AI interviewer feasibility experiments, static avatar and natural voice interface, post-attempt feedback and history.

**Deliverables:** basic practice with reliable recording first; separately measured real-time turn-taking, latency/quality/cost feasibility report; no promise of fully live features before proven.

**Exit:** mic and cross-browser tests, informed consent and deletion, measured real-time feasibility or clearly documented deferred mode; student can recover disrupted attempt.

### Phase 7 — Comprehensive admin and learning features
**Scope:** bulk content import, license provenance, automatic validation + mandatory human approval, generation of drafts, scheduled publishing, immutable exam versions, full dashboard analytics, study planner, recommendation logic, AI tutors where resource limits allow, progress exports, in-app notifications, accessibility refinements.

**Deliverables:** admin workflows, content review queue, study activity reports and database backfill/data lineage checks.

**Exit:** unpublished/AI-generated drafts unavailable to students, all admin writes auditable, score and version integrity tested, no access-control gaps.

### Phase 8 — QA, operational readiness and public launch gate
**Scope:** full tests, WCAG 2.2 AA audit target, privacy/consent/data export/deletion, secure uploads and RLS penetration tests, backup/restore drill, disaster recovery, simulated local-worker offline, provider quota review, web load tests, measured GPU capacity, content rights review and launch documentation.

**Deliverables:** QA report, release checklist, production operations runbook, known limitations, privacy/terms and deployment/rollback plan.

**Exit:** all critical blockers resolved; no public release by default; separate authorization required for enabling public registration.

## 4. Proposed priority tiers
| Priority | Functions |
|---|---|
| P0 — Release-critical | Auth/RLS, test timers/autosave, stable Reading/Listening, private Writing submission, secure upload, backups and error states |
| P1 — Differentiators | Scratch OCR, text verification, human-validated Writing estimates, QA analytics, admin content review |
| P2 — Advanced | Fully conversational voice examiner, rich pronunciation analytics, broad multilingual UI, high-scale operations, sophisticated adaptive AI tutor |
| Deferred business | Active subscriptions, cards, invoices, premium access, paid AI and paid hosting |

## 5. Major risk register
| Risk | Impact | Mitigation | Gate |
|---|---|---|---|
| Training from scratch with insufficient labels | OCR accuracy weak | Pilot dataset, writer splits, error inspection, stop/re-scope if no learning | Phase 4 |
| Human-rated IELTS data scarce | Miscalibrated band estimates | Collect consented ratings, restrict claims, abstain, report uncertainty | Phase 5 |
| Task 1 graph grounding absent | Fabricated chart evaluations | Require structured facts/validated vision or abstain | Phase 5 |
| Local worker offline | Evaluation delayed | Durable queue, clear pending statuses and cancellation | Phases 3–5 |
| RTX 8 GB memory limits | OOM/inference delays | Small encoder/CRNN, serial GPU jobs, AMP, profiling | Phases 4–6 |
| Free hosting/storage quotas | Service disruption | Quota monitoring, retention/cleanup, measured load, fallback | Each release |
| QR capability leakage | Exposure of handwritten content | Short TTL, hashed scoped token, access controls, size limits | Phase 3 |
| Copyright/licensing violation | Publication risk | License inventory and mandatory human approval | Phases 2, 7, 8 |
| False implied official IELTS endorsement | Legal/user trust harm | Clear IELTS-style/estimated terminology, notices | All phases |
| Payment design contradicted by free launch | Scope creep | Keep payment disabled and out of MVP gates | All phases |
| Real-time AI speaking too costly | Feature unavailable | Feasibility spike, recorded practice fallback | Phase 6 |

## 6. QA matrix and deliverables
| Quality domain | Minimum verification |
|---|---|
| Unit/integration | Scoring, timers, authorization, upload, queue transitions and band aggregation |
| E2E | Auth, four test modes, QR phone-to-desktop, OCR verification, report access |
| Security | RLS cross-user probes, admin MFA, token expiry, secrets, file access, audit |
| Accessibility | Keyboard-only, screen reader, focus/contrast, reduced-motion, errors |
| Compatibility | Windows/macOS browser matrix as available, Android/iOS upload camera, desktop split layouts |
| Performance | Browser metrics, exam autosave responsiveness, web concurrency and separately measured GPU throughput |
| Model evaluation | Writer/author/prompt leakage audits, CER/WER, MAE/QWK, examiner comparison and error slices |
| Operations | GitHub → Netlify, domain/SSL, restore drill, outage/retry and quota alarms |

## 7. Required documentation package
1. SRS (this package)
2. AI Architecture Specification
3. Proposed Database Schema & RLS Design
4. AI Evaluation & QA Protocol
5. Phased Development Roadmap

**Future implementation deliverables (not yet authored):** runnable API documentation, actual migration SQL, component-level design system and Figma screens, GitHub README tied to repository, deployment screenshots, verified test reports, trained checkpoints and a signed-off privacy/security runbook. Documentation must not pretend unfinished implementation exists.

## 8. Decision log and next approval
Current decisions: local-only training, 8 GB NVIDIA GPU, 50 GB working allocation, on-demand local worker, private initial release, no paid hosting, Google/email login, QR Writing upload, OCR from random initialization, hybrid human-validated Writing evaluation, estimated scores only, mandatory admin content review. **Next approval** should authorize only Phase 1 implementation after exact environment and repo/domain details are known. The user explicitly prohibited coding/training at this planning step.
