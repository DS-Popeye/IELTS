# Phase 1 implementation record

This record covers the IELTS Academic Platform foundation in `F:\IELTS`, using temporary **Aster** branding. It follows the 25 October 2026 baseline and the user's authorization to implement Phase 1. Original requirements and compiled references remain preserved. Phase 2 is not authorized by this work.

## Implemented areas

| Area | Implementation | Boundary |
| --- | --- | --- |
| Application | Next.js App Router, React, TypeScript, Tailwind setup, locally bundled fonts and modular features | No exam engine or scoring |
| Visual interface | Responsive homepage, workspace/sidebar/mobile drawer, premium light/dark design | Branding is temporary |
| Learner workspace | Dashboard, profile, goals and explicit empty states | No fabricated history, scores or learner identity |
| Prepared pages | Four modules, Mock Tests, Analytics, Planner, Bookmarks and Admin | Future functions are marked by phase; no fake working controls |
| Authentication | Supabase browser/server clients, cookie refresh, email/password, private registration, Google, recovery, logout | Requires external project/provider configuration |
| Authorization | Verified server identity, active allowlist membership, DB-owned roles, admin MFA | Demo admin is a read-only preview without private records |
| Profile | Validated preferences saved in browser storage in demo or owner-scoped DB rows when connected | Language preference stored; full bilingual copy deferred |
| Database | Migration, RLS, allowlisted account provisioning, audit records, reserved private buckets | No exam, upload, AI or payment schema |
| Delivery | Pinned packages, environment template, Netlify build configuration and CI | No remote deployment or service provisioning implied |
| Documentation | Local run, backend bootstrap, hosting, testing and release guidance | Operational privacy/retention decisions still need owner input |

## Files and responsibility map

- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.nvmrc`, `.editorconfig`: reproducible application tooling.
- `.gitignore`, `.env.example`, `netlify.toml`: credential exclusion, explicit environment modes and hosting configuration.
- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/icon.svg`, `src/app/page.tsx`: app foundation, design tokens, temporary branding and homepage.
- `src/components/layout/*`, `src/components/ui/*`, `src/components/providers/*`, `src/lib/navigation.ts`: shared responsive navigation, public layout, theme and illustration components.
- `src/app/(workspace)/*`, `src/features/modules/*`: dashboard and prepared subject/learning/admin pages.
- `src/app/(auth)/*`, `src/app/auth/*`, `src/components/auth/*`: account screens, server callbacks and authenticator interface.
- `src/lib/env.ts`, `src/lib/auth/*`, `src/lib/supabase/*`, `src/proxy.ts`: environment validation, access guards, trusted identity, auth actions and cookie handling.
- `src/features/profile/*`, `src/types/database.ts`: input validation integration, profile persistence and schema contract.
- `supabase/migrations/20261025000100_phase1_foundation.sql`, `supabase/config.toml`, `supabase/README.md`: database/security foundation and operator setup.
- `tests/unit/*`, `tests/database/*`, `supabase/tests/database/*`, `tests/e2e/*`: security, validation, PostgreSQL and browser checks.
- `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`: test orchestration and continuous integration.
- `README.md`, `docs/phase1-implementation.md`: current setup and implementation record.

## Security design

Demo mode is a visibly labeled, account-free preview. It does not initialize a Supabase client or obtain private data. Profile examples are stored in a separate browser-only key and have a clear-data control. Connected mode fails closed when configuration is incomplete or invalid.

Connected routes verify the current identity through Supabase, then check active membership and the role from the database. Membership is not inferred from a client button, route name or editable user metadata. Registration uses an operator-maintained email allowlist enforced by the database trigger. Existing users are not automatically enrolled. Administrator routes additionally require MFA and the database `has_admin_access()` check.

The migration grants profile owners only permitted preference changes. It blocks client role/allowlist mutations, preserves audit integrity, and reserves private buckets with browser access denied until later upload pipelines are implemented. Security-definer functions have constrained search paths and derive identities from authenticated claims. The browser key is public; no service-role credential is required by the web app.

App-level audit calls are supplementary telemetry, not proof that provider-level authentication operations occurred. Supabase Auth audit logs remain authoritative for those actions. Production retention, backup and review procedures are operator configuration still to be completed.

## Validation record

Final local verification was completed on 26 October 2026. Browser checks used the optimized production build in demo mode on desktop Chromium and an emulated Pixel 7 mobile viewport.

| Check | Status |
| --- | --- |
| ESLint | Passed with zero warnings |
| TypeScript and generated route types | Passed |
| Auth/configuration/validation/action/access-guard tests | 53 passed |
| Actual migration under local PostgreSQL/PGlite | 23 passed, including two-user negative tests |
| Next.js production build | Passed; App Router pages, server handlers and Proxy compiled |
| Playwright desktop/mobile flows | 43 passed; one mobile-only menu test intentionally skipped on desktop |
| Automated accessibility scans | 10 scans passed: homepage, dashboard, profile and login on both viewports, plus the dashboard in dark mode |
| Visual inspection | Production homepage and dashboard screenshots inspected at desktop/mobile sizes, including the dark dashboard; no observed clipping or overlap |
| Dependency audit | npm reported zero known vulnerabilities in the installed lockfile |
| Hosted Supabase pgTAP and API isolation checks | Requires configured external project |
| Google OAuth/email delivery/real MFA | Requires external provider configuration |
| GitHub Actions execution and Netlify deployment | Requires reviewed source push/site connection |
| Manual screen-reader/cross-browser audit | Not a completed certification |

The first browser run exposed muted-text contrast and accessible-name issues, which were corrected. An ambiguous test locator was scoped to the actual form error, and the production run avoids first-request development compilation timing. Tests also verify demo preferences stay in browser storage, survive reload, validate input and can be cleared; they do not send requests to Supabase. The browser menu's Escape behavior and focus restoration pass on mobile.

The Codex browser preview connector was unavailable. Visual review used screenshots produced by the local Playwright tests. Test artifacts are ignored by Git. No production credentials were needed for these checks.

PGlite executes the actual SQL migration with minimal Supabase platform schema stubs. It can verify PostgreSQL privileges and RLS, but not the provider's Auth service, email delivery, MFA protocol, Storage HTTP API or production settings. Browser checks run in demo mode and must not be represented as a real sign-in acceptance test.

## External setup still required

1. Create/configure the dedicated Supabase project and apply the migration to disposable staging first.
2. Bootstrap the authorized email and admin role through trusted SQL; configure verified email/password, Google OAuth and TOTP.
3. Set exact site origins and redirect paths in the app, Supabase and Google; keep secrets in provider settings.
4. Validate real two-user isolation, revoked membership, admin MFA, confirmation/recovery and signout.
5. Import the reviewed GitHub repository into Netlify, configure environment contexts and the custom domain, and test deployment/rollback.
6. Complete the operational privacy/terms, retention, email sender and backup/restore decisions.

The source is prepared for free-tier-first hosting, without a paid API requirement. Provider quotas and availability have not been guaranteed. No datasets, local worker, OCR, Writing evaluator, real-time Speaking model, exam content or payment functionality were introduced.

## Phase boundary

The foundation can be reviewed locally now. Operational Phase 1 exit checks that depend on configured services remain explicitly separate from local implementation. The next phase requires review and approval before building Reading/Listening engines or ingesting actual question banks.
