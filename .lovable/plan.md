# Match Sub-sector Defaults Panel

## Scope
- Rebuild each sub-sector’s defaults area to match the supplied reference: compact bordered rows for sections A–E, aligned segmented selectors, independent lock controls, and the operational-unit lock grouped beneath CapEx.
- Add Section C for Unit Economics Structure with separate Volume input and Capacity input defaults, each supporting Common or Independent and its own lock.
- Split the current shared COGS/CapEx lock into independent locks for sections D and E.
- Keep the existing saved defaults, reset behavior, template generation, and template upload areas below the redesigned panel.

## User Questionnaire Behavior
- Apply the new Volume and Capacity Common/Independent defaults and locks to the corresponding user-facing sub-sector controls.
- Preserve existing revenue-stream, unit-selection, COGS, and CapEx logic; locked defaults remain visible but cannot be changed.
- Maintain compatibility with defaults already saved in the browser by filling newly added settings from safe defaults.

## Technical Details
- Extend `SubsectorConfigDefaults` with volume/capacity structure values and separate lock flags, plus separate COGS and CapEx lock flags.
- Update persistence merging so older saved configurations receive all new defaults.
- Use existing semantic design tokens and controls; no backend or workflow IDs change.
- Verify compilation, current preview logs, and the desktop layout in the live preview.
