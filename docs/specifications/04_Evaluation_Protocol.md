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
