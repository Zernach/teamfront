# Story 7.2: Upload Queue and Progress Tracking

Status: drafted

## Story

As a user,
I want to see my upload queue with real-time progress for each photo,
so that I can monitor upload status and identify any issues.

## Acceptance Criteria

1. Upload queue component displays selected photos
2. Shows status for each photo (Queued, Uploading, Complete, Failed)
3. Displays progress percentage for each photo
4. Shows overall batch progress
5. Real-time updates via WebSocket
6. Individual progress bars for each photo
7. Overall progress indicator
8. Error messages displayed for failed uploads
9. Retry button for failed uploads
10. Queue persists across page navigation

## Tasks / Subtasks

- [ ] Task 1: Create upload queue component (AC: 1)
  - [ ] Create UploadQueue component
  - [ ] Display list of selected photos
  - [ ] Show photo thumbnails
  - [ ] Show filenames
- [ ] Task 2: Display status for each photo (AC: 2)
  - [ ] Show status badge (Queued, Uploading, Complete, Failed)
  - [ ] Color-code status badges
  - [ ] Update status in real-time
- [ ] Task 3: Display progress percentage (AC: 3)
  - [ ] Show progress bar for each photo
  - [ ] Display percentage text
  - [ ] Update progress in real-time
- [ ] Task 4: Show overall batch progress (AC: 4)
  - [ ] Calculate overall progress: (completed / total) * 100
  - [ ] Display overall progress bar
  - [ ] Show overall percentage
- [ ] Task 5: Connect to WebSocket (AC: 5)
  - [ ] Establish WebSocket connection
  - [ ] Listen to upload progress events
  - [ ] Update UI on events
  - [ ] Handle reconnection
- [ ] Task 6: Create individual progress bars (AC: 6)
  - [ ] Create ProgressBar component
  - [ ] Show progress for each photo
  - [ ] Animate progress updates
- [ ] Task 7: Create overall progress indicator (AC: 7)
  - [ ] Create OverallProgress component
  - [ ] Show total progress
  - [ ] Display completed/total count
- [ ] Task 8: Display error messages (AC: 8)
  - [ ] Show error message for failed uploads
  - [ ] Style error messages clearly
  - [ ] Include error details
- [ ] Task 9: Add retry functionality (AC: 9)
  - [ ] Add retry button for failed uploads
  - [ ] Call retry API endpoint
  - [ ] Reset photo status
  - [ ] Re-initiate upload
- [ ] Task 10: Persist queue state (AC: 10)
  - [ ] Store queue in local storage or state
  - [ ] Restore queue on page load
  - [ ] Maintain queue across navigation

## Dev Notes

- Use React Query for upload state management
- Connect to WebSocket from Epic 5
- Update UI reactively on WebSocket events
- Handle edge cases (network errors, page refresh)

### Project Structure Notes

- Component: `src/components/upload/UploadQueue.tsx`
- Progress Bar: `src/components/upload/ProgressBar.tsx`
- WebSocket Hook: `src/hooks/useUploadProgress.ts`
- Upload Store: `src/store/uploadStore.ts`

### References

- [Source: docs/epics/epic-7-web-upload-ui.md#Upload Queue Management]
- [Source: docs/epics/epic-5-realtime-progress.md]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

