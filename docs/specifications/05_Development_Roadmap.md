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
