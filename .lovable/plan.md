# Keep Core Template Uploads After Refresh

## Implementation
- Move the two Generic DCF template file lists into the application’s existing saved browser state.
- Update upload, replace, remove-file, and remove-template actions to write through that saved state.
- Preserve the current labels, controls, accepted file types, and page layout.

## Verification
- Upload a test file, refresh the page, and confirm the file entry remains visible.
- Confirm the current project build remains error-free.

## Technical note
This fixes browser persistence for the displayed upload records. The prototype still stores them only in the current browser, not in shared online storage.
