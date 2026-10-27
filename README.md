# Aster — IELTS Academic Platform

Phase 1 provides a React/Next.js foundation for the private IELTS Academic platform described in the source specifications. **Aster** is temporary branding. This release includes the interface, account architecture, profile settings, database security foundation and Netlify configuration. It does not include exam engines, real question banks, AI models, payments or fabricated learner results.

The project can run immediately in an explicitly labeled demonstration mode. Connecting real accounts requires a Supabase project and the setup below. Phase 2 has not started.

## Run locally

Use **Node.js 24** and npm. Dependencies are pinned in `package-lock.json`.

```powershell
Set-Location F:\IELTS
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Copy the example only if `.env.local` does not already exist; preserve any configuration you have already added. Open **http://localhost:3000**. The application entry point is `src/app/page.tsx`; the original empty `index.html` is preserved for provenance and is not used by Next.js.

To run a production build locally:

```powershell
npm run build
npm start
```

## What Phase 1 includes

- Responsive homepage, sidebar and mobile navigation, learner dashboard and light/dark themes.
- Reading, Listening, Writing, Speaking, Mock Tests, Analytics, Planner and Bookmarks previews with honest empty states.
- Profile and learning-goal preferences. Demo preferences remain in browser storage and can be cleared; connected profiles use the signed-in account and database policies.
- Email/password login, allowlisted registration, email confirmation, Google OAuth, password reset, logout and administrator authenticator setup.
- Server-verified private membership, database-controlled roles and MFA enforcement for connected administration.
- Supabase schema migration, row-level security, audit events, private storage reservations, and local PostgreSQL policy tests.
- Environment templates, security headers, CI checks and Netlify build configuration.

No real IELTS questions, scores, users, recordings, writing submissions or AI outputs are bundled. Numerical mock-format descriptions are requirements from the SRS, not learner activity. Target bands are user preferences, not assessed results. English/Bengali language preferences are stored; full translated interface copy is a later localization task. Privacy and terms pages are foundation drafts requiring owner review before operational use.

See [the implementation record](docs/phase1-implementation.md) for scope, changed areas, validation and remaining setup.

## Environment modes

| Variable | Demo | Connected |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_MODE` | `demo` | `connected` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Exact local or production origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Leave empty | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Leave empty | Supabase publishable key or legacy anon key |

An omitted mode defaults to demo. Connected mode with missing/invalid configuration fails closed and directs users to setup-aware sign-in. It never falls back to an authenticated demo account. Demo mode does not create a Supabase client, read private records or provide privileged administrator controls.

`NEXT_PUBLIC_*` values are included in the browser bundle at build time. Only public project configuration belongs there. **Never enter a service-role key, `sb_secret_` key, database password or Google OAuth client secret in these variables.** This phase does not require a service-role key. Keep `.env.local` outside Git; `.gitignore` excludes environment files except the placeholder example. Restart development or rebuild deployment after changing public configuration.

## Connect Supabase

Use a new dedicated Supabase project or disposable staging project first. The [database setup guide](supabase/README.md) contains the exact migration, allowlist, admin bootstrap and revocation procedures.

1. Apply `supabase/migrations/20261025000100_phase1_foundation.sql` using the SQL Editor or a linked Supabase CLI project. No migration has been applied to a hosted account by this implementation.
2. Configure email/password authentication with email confirmation enabled, and anonymous sign-in disabled. Keep the provider's authentication rate limits enabled.
3. Add the intended user's email to `public.private_access` using the trusted SQL Editor **before** registration or Google sign-in. The database rejects new accounts outside this allowlist, including direct calls to the Auth API.
4. Configure **Authentication → URL Configuration** with the exact Site URL and these redirect destinations for each intended environment:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/reset-password`
   - `http://localhost:3000/auth/confirm`
   - Equivalent exact paths on the production origin.
5. Put the project URL/public key in `.env.local`, set `NEXT_PUBLIC_APP_MODE=connected`, and restart the app.
6. Create the approved account, confirm the email and verify login/logout. Registration and reset forms use non-enumerating responses; they do not prove that an email was delivered. Check Supabase sender restrictions and quotas for the intended recipients.
7. Assign the intended operator the admin role using the reviewed SQL in the database guide. Enable TOTP in Supabase Auth MFA settings. Visit `/admin`; the app will require authenticator enrollment or a verification code before connected admin access.

The application supports Supabase PKCE code exchange at `/auth/callback`. For email templates that use token hashes, `/auth/confirm` accepts the supported token type and directs a recovery token to the password-reset form. Template links can use:

```text
Confirmation: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
Recovery:     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
```

Use the template matching the event; test confirmation, expired links and recovery on the configured project. The callback routes reject unknown redirect targets. Review [Supabase's server-side authentication guidance](https://supabase.com/docs/guides/auth/server-side/nextjs) when configuring templates and redirects.

For Google sign-in, configure a Google OAuth web client and enter its client ID and secret in **Supabase's Google provider settings**, not the repository. Use the provider callback URI shown by Supabase (normally `https://YOUR_PROJECT.supabase.co/auth/v1/callback`) as Google's authorized redirect URI. Add the intended app origins and any consent-screen test users. The approved email must still be present in the database allowlist. See [Supabase's Google provider guide](https://supabase.com/docs/guides/auth/social-login/auth-google).

No hosted account, OAuth provider, production email delivery or real MFA flow can be verified without this external setup.

## Prepare Netlify deployment

The Git origin is [DS-Popeye/IELTS](https://github.com/DS-Popeye/IELTS). The source is prepared for deployment; this implementation does not itself provision or publish a Netlify site.

1. After reviewing the changes, commit and push the project to the repository.
2. In Netlify, import the repository and use its root as the base directory. `netlify.toml` specifies Node 24, build command `npm run build` and publish directory `.next`.
3. Netlify supplies its current Next.js/OpenNext integration automatically. Do not add a static-SPA redirect to `index.html` or configure a static export; server routes and authentication need the Next.js runtime. See [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).
4. For a preview, set `NEXT_PUBLIC_APP_MODE=demo` and the preview origin as `NEXT_PUBLIC_SITE_URL`. Keep preview builds isolated from real accounts. Review Netlify environment scopes so a production `connected` value does not leak into deploy previews.
5. For the intended private workspace, configure the four environment variables for the **production** context with `connected` mode and the exact production HTTPS origin. Add the matching Supabase redirects before testing sign-in. Rebuild after changing public variables.
6. Add the custom domain in Netlify, complete its DNS instructions, verify HTTPS, and update the canonical site origin and Auth redirects together. Use a separate Supabase staging project for any connected staging site; avoid wildcard production OAuth redirects.
7. Run the real-account acceptance checklist below before using connected mode with personal data.

The app has no required paid API or payment dependency. Free-plan hosting, storage, authentication and build availability still depend on the providers' current quotas; deployment is not a guarantee of unlimited usage. No local GPU process is deployed by this phase.

## Checks and tests

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run check` runs lint, type checking, unit/database tests and a production build. Browser tests are separate and run against an explicitly configured demo server. Playwright covers desktop/mobile layouts, navigation, theme persistence, demo preferences, configuration-dependent authentication, empty states, 404s and automated accessibility scans. `npm run test:e2e:ui` opens the interactive test runner. If port 3000 is already occupied by a connected-mode app, stop that server before running the demo tests.

For the same production-browser check used for this delivery, build first and select the production test server:

```powershell
npm run build
$env:PLAYWRIGHT_SERVER = "production"
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_SERVER
```

Observed local results: lint and type checking passed, 76 unit/database tests passed, the production build passed, and 43 browser tests passed with one desktop skip for a mobile-only control. Ten automated accessibility scans passed. See the [validation record](docs/phase1-implementation.md#validation-record) for the exact limits; hosted sign-in and deployment are not claimed as verified.

The database tests execute the actual migration against PGlite/PostgreSQL with minimal Supabase Auth/Storage schema stubs. They exercise policy behavior, including two-user isolation, allowlist revocation, escalation attempts and MFA. They do not replace testing against Supabase's real Auth and Storage services. A separate pgTAP suite and local-stack instructions are in [supabase/README.md](supabase/README.md).

The [GitHub Actions workflow](.github/workflows/ci.yml) runs checks for main-branch pushes and pull requests, using demo mode and read-only repository permissions. It does not receive production credentials or deploy the app. Automated accessibility checks are useful coverage, not a complete WCAG certification or a substitute for manual screen-reader review.

## Remaining connected acceptance checks

- Apply and test the migration on a disposable Supabase project, including the pgTAP suite.
- Verify approved and denied registration, email confirmation, reset links, Google sign-in and logout with actual accounts.
- Verify separate users cannot read/update each other's records through the Supabase API, including revoked membership and active sessions.
- Verify student denial, administrator TOTP enrollment/challenge, and session expiry for `/admin`.
- Confirm private bucket access through the Storage API is denied in Phase 1.
- Test GitHub-to-Netlify deployment, the production domain/HTTPS, redirects and deployment rollback.
- Decide operational retention, backups and restoration procedures; review privacy/terms drafts.
- Review Phase 1 before authorizing Phase 2. Question banks, exam engines and AI remain out of this release.

## Project structure

```text
src/
  app/                         App Router routes, layouts and auth callbacks
  components/                  Shared shell, branding, themes and auth interface
  features/modules/            Honest module previews and planned-format content
  features/profile/            Validated local/connected preference forms
  lib/auth/                    Server authentication, access guards and validation
  lib/supabase/                Separate browser/server clients
  types/                       Database contracts
  proxy.ts                     Session-cookie refresh and no-store behavior
supabase/
  migrations/                  Versioned Phase 1 schema and RLS
  tests/database/              pgTAP tests for a disposable Supabase database
tests/
  unit/                        Configuration, redirect and input validation
  database/                    Executed migration/policy tests in PostgreSQL
  e2e/                         Desktop/mobile browser checks
docs/                          Preserved specifications and implementation record
resources/                     Reserved intake folders; no real content supplied
.github/workflows/             Continuous integration checks
```

## Requirements and preserved source material

The working baseline remains [SRS](docs/specifications/01_SRS.md), [AI architecture](docs/specifications/02_AI_Architecture.md), [database design](docs/specifications/03_Database_Design.md), [evaluation protocol](docs/specifications/04_Evaluation_Protocol.md) and [roadmap](docs/specifications/05_Development_Roadmap.md). These sources were not rewritten during implementation.

The original package README is preserved at [docs/specifications/README.md](docs/specifications/README.md). Compiled [Markdown](docs/compiled/IELTS_Complete_Specification.md), [Word](docs/compiled/IELTS_Academic_Final_SRS_and_Roadmap.docx) and [PDF](docs/compiled/IELTS_Academic_Final_SRS_and_Roadmap.pdf) copies are unchanged. The [original review](docs/project-review.md) is a historical pre-implementation inventory; current implementation status is recorded here and in the Phase 1 record. [Source hashes](docs/source-manifest.json) and the [resource guide](resources/README.md) remain available.
