# Story 7.1: File Selection Interface

Status: drafted

## Story

As a user,
I want to select photos using drag-and-drop or file browser,
so that I can easily choose photos to upload.

## Acceptance Criteria

1. Drag-and-drop zone component created
2. Visual feedback on drag-over state
3. File validation on drop (type, size, count)
4. Support for multiple files (up to 100)
5. Click-to-browse file input implemented
6. Custom styled file selection button/area
7. Clear visual feedback for valid/invalid files
8. File browser integration working
9. Same validation for drag-drop and click-to-browse

## Tasks / Subtasks

- [ ] Task 1: Create drag-and-drop zone component (AC: 1)
  - [ ] Create DropZone component
  - [ ] Handle drag events (dragenter, dragover, dragleave, drop)
  - [ ] Prevent default browser behavior
  - [ ] Style drop zone
- [ ] Task 2: Add drag-over visual feedback (AC: 2)
  - [ ] Show visual indicator on dragenter/dragover
  - [ ] Change styling on drag-over
  - [ ] Show drop zone highlight
- [ ] Task 3: Implement file validation on drop (AC: 3)
  - [ ] Validate file types (images only)
  - [ ] Validate file sizes (max 50MB each)
  - [ ] Validate total count (max 100 files)
  - [ ] Show validation errors
- [ ] Task 4: Support multiple files (AC: 4)
  - [ ] Handle multiple files in drop event
  - [ ] Process all files
  - [ ] Track file count
  - [ ] Enforce 100 file limit
- [ ] Task 5: Create click-to-browse input (AC: 5)
  - [ ] Create file input with multiple attribute
  - [ ] Style file input (hidden, custom button)
  - [ ] Handle file selection
  - [ ] Trigger validation
- [ ] Task 6: Style file selection button (AC: 6)
  - [ ] Create custom styled button
  - [ ] Match design system
  - [ ] Show clear call-to-action
  - [ ] Handle click to open file browser
- [ ] Task 7: Show visual feedback (AC: 7)
  - [ ] Show checkmark for valid files
  - [ ] Show error icon for invalid files
  - [ ] Display error messages
  - [ ] Highlight selected files
- [ ] Task 8: Integrate file browser (AC: 8)
  - [ ] Open native file browser on click
  - [ ] Support file selection
  - [ ] Handle file browser selection
- [ ] Task 9: Apply same validation (AC: 9)
  - [ ] Use same validation logic for both methods
  - [ ] Show consistent error messages
  - [ ] Handle errors uniformly

## Dev Notes

- Use react-dropzone or similar library
- Validate files before adding to queue
- Show clear error messages
- Support accessibility (keyboard navigation, screen readers)

### Project Structure Notes

- Component: `src/components/upload/DropZone.tsx`
- File Input: `src/components/upload/FileInput.tsx`
- Validation: `src/utils/fileValidation.ts`
- Types: `src/types/upload.ts`

### References

- [Source: docs/epics/epic-7-web-upload-ui.md#File Selection Interface]
- [Source: docs/epics/epic-7-web-upload-ui.md#File Validation]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

