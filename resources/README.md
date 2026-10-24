# Project resources

These directories are reserved for the actual source materials needed by the IELTS application. None were included in the original specification package. The `.gitkeep` files only preserve empty directories.

| Folder | Expected materials |
| --- | --- |
| `brand/` | Site name notes, logo, favicon, permitted illustrations and design references |
| `content/reading/` | Passages, question sets, answer keys, accepted variants and explanations |
| `content/listening/` | Audio, transcripts, question sets, answer keys and maps/diagrams |
| `content/writing/` | Task 1/2 prompts, chart/map/process assets, verified chart facts and permitted examples |
| `content/speaking/` | Topics, cue cards and examiner follow-up prompts |

For each content set, include the original source, author/owner, license or publication permission, attribution requirements and any usage restrictions. Preserve unmodified originals; a later importer can produce validated application records. The specified bulk import formats are CSV, XLSX and JSON; the actual import schema will be defined during implementation.

The app's content pipeline will validate and review materials before publication. These source directories are not the public website folder and are not secure storage for private personal data. Keep student essays, photos, recordings, secret keys and real user exports out of the source repository. Do not expose active exam answer keys in a frontend asset bundle.

OCR datasets, human-rated essay corpora and model checkpoints are separate future AI dependencies. Store large or sensitive training data outside Git in a configured local location, with its own license, consent and split manifests. Do not add fabricated ratings or model results to fill missing resources.

No new files are necessary merely to start a frontend foundation with temporary branding. Real practice content and connected services are required for their corresponding production features; see [the project review](../docs/project-review.md).
