# Epic 7: Web Upload UI

**Epic ID:** 7  
**Title:** Web Upload UI  
**Description:** Drag-drop, queue management, progress tracking

## Overview

Implement the web upload interface with drag-and-drop file selection, upload queue management, real-time progress tracking, and error handling. This epic focuses on delivering exceptional user experience during high-volume concurrent uploads.

## File Selection Interface

### Drag-and-Drop Zone
- Visual drop zone component
- Drag-over state feedback
- File validation on drop
- Support for multiple files (up to 100)
- Clear visual feedback for valid/invalid files

### Click-to-Browse
- File input with multiple selection
- Custom styled button/area
- File browser integration
- Same validation as drag-and-drop

### File Validation
- Client-side file type validation (images only)
- File size validation (max 50MB per file)
- Total count validation (max 100 files)
- Clear error messages for rejected files
- Visual indicators for validation status

## Thumbnail Preview

### Preview Generation
- Generate thumbnails using `createObjectURL`
- Display thumbnails immediately after selection
- Grid layout for multiple thumbnails
- Loading state for thumbnail generation

### Preview Display
- Thumbnail cards with filename
- File size display
- Remove button for each file
- Visual feedback for selected files

## Upload Queue Management

### Queue Display
- Visible upload queue component
- List of files with status badges
- Individual progress bars per file
- Batch overall progress indicator
- Queue persists across page navigation

### Status Badges
- Queued: File waiting to upload
- Uploading: Active upload with percentage
- Completed: Successfully uploaded
- Failed: Upload failed with error

### Progress Tracking
- Individual file progress (0-100%)
- Real-time updates via WebSocket
- Smooth progress bar animations
- Batch overall progress calculation
- Time remaining estimation (optional)

## Upload Execution

### Upload Flow
1. User selects files → Added to queue
2. User clicks "Upload" → Batch upload initiated
3. Files uploaded concurrently (max 10 simultaneous)
4. Progress updates in real-time
5. Completed files move to "Completed" section
6. Failed files show error with retry option

### Concurrent Upload Handling
- Process up to 10 uploads simultaneously
- Queue management for remaining files
- Non-blocking UI during uploads
- Background upload processing

## Error Handling

### Failed Upload Display
- Clear error messages per file
- Error type identification (quota, size, network, etc.)
- Retry button for failed uploads
- Bulk retry option
- Error details on hover/click

### Retry Mechanism
- Individual file retry
- Bulk retry for all failed uploads
- Retry preserves original file data
- Retry queue management

## Upload Queue Persistence

### State Persistence
- Upload queue stored in global state
- Persists across page navigation
- Resume uploads on page return
- Clear queue option

### Background Uploads
- Uploads continue when navigating away
- Notification/indicator for active uploads
- Return to upload page to view progress
- Upload completion notifications

## User Experience Enhancements

### Visual Feedback
- Smooth animations for state changes
- Loading spinners during upload initiation
- Success animations on completion
- Error state visual indicators

### Responsive Design
- Mobile-friendly drag-and-drop
- Touch-optimized file selection
- Responsive grid layout
- Adaptive progress bar sizing

### Accessibility
- Keyboard navigation support
- Screen reader announcements
- ARIA labels for status
- Focus management

## Performance Optimization

### Thumbnail Generation
- Efficient `createObjectURL` usage
- Memory cleanup on component unmount
- Lazy thumbnail generation for large lists

### Progress Updates
- Throttled progress updates (avoid UI spam)
- Efficient state updates
- Minimal re-renders

## Acceptance Criteria

- [ ] Drag-and-drop file selection working
- [ ] Click-to-browse file selection working
- [ ] File validation (type, size, count)
- [ ] Thumbnail preview generation
- [ ] Upload queue display with status badges
- [ ] Individual progress bars functional
- [ ] Batch progress indicator working
- [ ] Real-time progress via WebSocket
- [ ] Failed upload error display
- [ ] Retry mechanism for failed uploads
- [ ] Upload queue persistence across navigation
- [ ] Background upload support
- [ ] Responsive design implemented
- [ ] Performance optimized

## Dependencies

- Epic 6: Web Frontend Core (routing, state, API client)
- Epic 3: Upload API (upload endpoints)
- Epic 5: Real-Time Progress (WebSocket events)
- React Dropzone (optional, for drag-and-drop)

## Related Epics

- Epic 8: Web Gallery UI (view uploaded photos)
- Epic 10: Mobile Upload (mobile equivalent)

