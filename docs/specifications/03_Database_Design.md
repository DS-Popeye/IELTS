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
