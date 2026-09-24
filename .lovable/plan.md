# Add Template Selection and Specification Summary

## Implementation
- Restore **Generic - Unit Economics** and **Generic - Percentage Based** as the two base-template choices for every sub-sector.
- Keep the selected base template saved with each generated sub-sector template.
- Add an automatic developer-specification summary showing the selected approach, revenue-stream setup, output measurement, capacity measurements, and selected prompts.
- Include that summary in the generation instructions so the prompt can select and regenerate the appropriate sector template from the developer’s specifications.
- Preserve the existing generation controls, prompt selection behavior, and saved sub-sector settings.

## Verification
- Open multiple sub-sectors and confirm both generic templates are selectable.
- Confirm the automatic summary reflects each sub-sector’s saved settings and selected prompts.
- Generate a template and confirm its displayed prompt and downloaded content include the chosen template and specification summary.
