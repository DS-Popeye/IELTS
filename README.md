# IELTS Academic Platform

This workspace contains the reviewed requirements for a private IELTS Academic preparation application. The planned stack is React with Next.js, TypeScript and Tailwind, hosted on Netlify, with Supabase for authentication, database and private storage. AI processing is planned as a separate local Python worker.

**Current status: document review and organization complete; application implementation has not started.** The existing `index.html` is an empty original placeholder. There is no runnable React project, installed dependency set, database migration or trained model yet.

## Start here

- [Project review and missing inputs](docs/project-review.md)
- [Original source inventory and SHA-256 checksums](docs/source-manifest.json)
- [Resource placement guide](resources/README.md)

## Source specifications

The five numbered Markdown documents are the working baseline. Keep future requirement changes in these sources and regenerate the compiled copies when appropriate.

| Document | Contents |
| --- | --- |
| [01 SRS](docs/specifications/01_SRS.md) | Product scope, roles, modules, requirements and acceptance scenarios |
| [02 AI Architecture](docs/specifications/02_AI_Architecture.md) | Typed/paper Writing, QR uploads, OCR, evaluation and local worker |
| [03 Database Design](docs/specifications/03_Database_Design.md) | Proposed entities, ownership, private storage and access policies |
| [04 Evaluation Protocol](docs/specifications/04_Evaluation_Protocol.md) | Model measurements, integration tests, security and release gates |
| [05 Development Roadmap](docs/specifications/05_Development_Roadmap.md) | Eight implementation phases, dependencies and delivery checks |

The [original package README](docs/specifications/README.md) is preserved unchanged. Its descriptions of files at the package root refer to the original layout.

## Compiled reference copies

- [Complete Markdown specification](docs/compiled/IELTS_Complete_Specification.md)
- [Word specification and roadmap](docs/compiled/IELTS_Academic_Final_SRS_and_Roadmap.docx)
- [PDF specification and roadmap](docs/compiled/IELTS_Academic_Final_SRS_and_Roadmap.pdf)

These contain the same substantive requirements as the five source documents, rather than additional application resources. The PDF has 25 pages. The Word/PDF title contains an export punctuation artifact; the original files have been preserved.

## Current folder structure

```text
IELTS/
  README.md                         Project entry point
  index.html                        Original empty placeholder
  docs/
    project-review.md               Findings, dependencies and future layout
    source-manifest.json            All 10 originals and preservation checksums
    specifications/                 Five numbered documents + original README
    compiled/                       Combined Markdown, Word and PDF
  resources/
    README.md                       Guide to supplying actual resources
    brand/                          Reserved; no branding supplied
    content/
      reading/                      Reserved; no practice content supplied
      listening/                    Reserved; no audio or transcripts supplied
      writing/                      Reserved; no prompts or chart assets supplied
      speaking/                     Reserved; no cue cards supplied
```

Resource directories contain only `.gitkeep` placeholders. They are source intake locations, not public website assets or a secure vault for user submissions.

## Next implementation stage

The documented first phase is the foundation: design tokens, homepage, navigation, private authentication and roles, profile, dashboard shell, Supabase setup and Netlify configuration. Subsequent phases add test engines, Writing uploads, model research and integration, Speaking, full administration, analytics and release checks.

React with Next.js follows the supplied architecture and is supported by [Netlify's Next.js integration](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/). The eventual build needs a Git/build deployment, not just uploading the empty `index.html`. The local GPU worker is a separate process from the Netlify web application.

No extra architecture document or logo is required to begin a frontend foundation. Real authentication, practice content, deployment and AI each need the specific inputs listed in the project review. No credentials should be placed in these documents or committed to source control.
