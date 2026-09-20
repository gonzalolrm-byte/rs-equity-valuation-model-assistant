# Match Latest Sub-sector Defaults Panel

## Scope
- Rebuild each sub-sector’s defaults area to match the latest reference: compact A/B rows, pre-selected streams, a highlighted Unit Economics approach area, and an Operational units row.
- Add four Unit Economics presets: Common Operations, Common Capacity, Independent Operations, and Fully Independent, with their displayed Volume, Capacity, Revenue, COGS, and CapEx structure summaries.
- Add developer-selectable Sales / Output Unit and Capacity Unit defaults with a lock.
- Keep reset behavior and the generated-template controls below the panel.

## User Questionnaire Behavior
- Translate each Unit Economics preset into consistent volume, capacity, revenue, COGS, and CapEx defaults.
- Locked choices remain visible but cannot be changed; unlocked choices remain defaults users may change.
- Preserve existing question IDs, mappings, and model-generation behavior.

## Technical Details
- Extend the per-sub-sector configuration with a Unit Economics preset, its lock, operational-unit defaults, and their lock.
- Merge new defaults into older browser-saved configurations for compatibility.
- Use the existing semantic design tokens and controls.
- Verify compilation, preview logs, and desktop rendering.
