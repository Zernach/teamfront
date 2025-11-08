# Story 10.1: Mobile Photo Selection and Upload

Status: drafted

## Story

As a mobile user,
I want to select photos from my device library or camera and upload them,
so that I can add photos to my collection from my mobile device.

## Acceptance Criteria

1. Native photo picker integration (iOS and Android)
2. Multi-photo selection (up to 100)
3. Photo preview before upload
4. Camera integration for direct capture
5. Camera permissions handling
6. File validation (type, size, count)
7. Upload queue display
8. Real-time progress tracking
9. Background upload support
10. HEIC/HEIF format handling

## Tasks / Subtasks

- [ ] Task 1: Integrate native photo picker (AC: 1)
  - [ ] Install react-native-image-picker or similar
  - [ ] Configure iOS permissions (Info.plist)
  - [ ] Configure Android permissions (AndroidManifest.xml)
  - [ ] Create PhotoPicker component
- [ ] Task 2: Support multi-photo selection (AC: 2)
  - [ ] Enable multiple selection in picker
  - [ ] Track selected photos
  - [ ] Enforce 100 photo limit
  - [ ] Show selection count
- [ ] Task 3: Create photo preview (AC: 3)
  - [ ] Create PreviewScreen component
  - [ ] Display selected photos
  - [ ] Allow removing photos
  - [ ] Show photo details
- [ ] Task 4: Integrate camera (AC: 4)
  - [ ] Add camera capture functionality
  - [ ] Open camera on button press
  - [ ] Capture photo
  - [ ] Add to selection
- [ ] Task 5: Handle camera permissions (AC: 5)
  - [ ] Request camera permissions
  - [ ] Handle permission denial
  - [ ] Show permission explanation
  - [ ] Guide user to settings if needed
- [ ] Task 6: Validate files (AC: 6)
  - [ ] Validate file types (images only)
  - [ ] Validate file sizes (max 50MB each)
  - [ ] Validate total count (max 100)
  - [ ] Show validation errors
- [ ] Task 7: Create upload queue display (AC: 7)
  - [ ] Create UploadQueue component
  - [ ] Show list of photos being uploaded
  - [ ] Display status for each photo
  - [ ] Show in bottom sheet or modal
- [ ] Task 8: Implement progress tracking (AC: 8)
  - [ ] Connect to WebSocket
  - [ ] Display progress for each photo
  - [ ] Show overall progress
  - [ ] Update in real-time
- [ ] Task 9: Support background uploads (AC: 9)
  - [ ] Use background task API
  - [ ] Continue uploads in background
  - [ ] Handle app state changes
  - [ ] Resume uploads on app resume
- [ ] Task 10: Handle HEIC/HEIF formats (AC: 10)
  - [ ] Detect HEIC/HEIF files
  - [ ] Convert to JPEG if needed
  - [ ] Handle conversion errors
  - [ ] Preserve image quality

## Dev Notes

- Use react-native-image-picker or expo-image-picker
- Handle platform-specific differences (iOS vs Android)
- Support background uploads for better UX
- Convert HEIC to JPEG for compatibility

### Project Structure Notes

- Component: `src/components/upload/PhotoPicker.tsx`
- Camera: `src/components/upload/CameraCapture.tsx`
- Preview: `src/components/upload/PhotoPreview.tsx`
- Upload Queue: `src/components/upload/UploadQueue.tsx`
- Native Module: `src/native/PhotoPickerModule.ts`

### References

- [Source: docs/epics/epic-10-mobile-upload.md#Photo Selection]
- [Source: docs/epics/epic-10-mobile-upload.md#Camera Integration]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

