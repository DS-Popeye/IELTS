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
