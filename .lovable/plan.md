# Compact Subsector Accordion

## Goal
Make the Sector Specifics subsector list compact while preserving every existing setting and action.

## Changes
- Add page-level expansion state so only one subsector can be open at a time.
- Render every subsector as a collapsed summary row by default.
- Show the subsector name, selected base Generic template, generation status, and a chevron in the collapsed row.
- Expand the selected row in place to reveal the existing Developer defaults, specification summary, prompt selection, template generation, upload, reset, and delete controls unchanged.
- Make both the summary row and chevron toggle expansion, while preventing existing action buttons from accidentally collapsing the row.
- Add accessible expanded-state labels and keyboard-compatible controls.

## Verification
- Confirm all rows start collapsed.
- Confirm opening one row closes the previously open row.
- Confirm clicking an open row collapses it.
- Confirm existing Generate/Regenerate, prompt selection, upload, reset, and delete behavior remains available inside the expanded row.
- Check the page at desktop and narrow widths and confirm the preview builds without errors.
