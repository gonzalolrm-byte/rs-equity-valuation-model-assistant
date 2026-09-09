# Service layer

This folder is the boundary between the front end and the future backend.

Today every function here is a **mock implementation** that runs in the browser
(`claudeService.ts`, `excelService.ts`). Nothing calls Anthropic, and no API key
exists anywhere in this project.

Phase 2 replaces the bodies only:

| Mock today | Phase 2 |
| --- | --- |
| `claudeService.runAction()` | `createServerFn` that reads the prompt from the database, assembles the document context and calls the Anthropic Messages API with `ANTHROPIC_API_KEY` (server-side secret only). |
| `excelService.buildModel()` | Deterministic server-side workbook manipulation (adapt periods, populate cells, preserve formulas/formatting). |
| `src/lib/data.ts` lists | Database tables: `prompt_actions`, `prompt_versions`, `developer_resources`, `valuation_projects`, `questionnaire_responses`, `uploaded_documents`, `generated_models`, `prompt_execution_logs`. |
| `src/lib/store.tsx` (localStorage) | Same React context, data fetched/persisted through server functions. |

Rules that must survive the migration:

- Claude never decides what to do. Every user selection maps to an **action ID**
  whose prompt text is editable in the Developer Console.
- Claude interprets and extracts; application code manipulates the workbook.
- Unresolved inputs are reported as `Data not found`, `Missing information` or
  `Requires user input` — never invented.
