# Epic 10: Mobile Upload

**Epic ID:** 10  
**Title:** Mobile Upload  
**Description:** Photo picker, camera, background upload

## Overview

Implement mobile photo upload functionality with native photo library access, camera integration, background upload support, and real-time progress tracking optimized for iOS and Android platforms.

## Photo Selection

### Photo Library Access
- Native photo picker integration
- Multi-photo selection (up to 100)
- Photo preview before upload
- HEIC/HEIF format handling
- Image format conversion (if needed)

### Camera Integration
- Camera capture functionality
- Direct photo capture and upload
- Camera permissions handling
- Image quality settings
- Preview before upload

### Selection Interface
- Native photo picker UI
- Grid view of available photos
- Selection indicators
- Selected photos preview
- Remove selected photos

## File Validation

### Client-Side Validation
- File type validation (images only)
- File size validation (max 50MB per file)
- Total count validation (max 100 files)
- Clear error messages
- Visual feedback for invalid files

## Upload Queue Management

### Queue Display
- Bottom sheet or modal for upload queue
- List of selected photos
- Status badges per photo
- Individual progress indicators
- Overall batch progress

### Status Indicators
- Queued: Waiting to upload
- Uploading: Active with percentage
- Completed: Successfully uploaded
- Failed: Upload failed with error

### Progress Tracking
- Individual photo progress (0-100%)
- Real-time updates via SSE or polling
- Smooth progress animations
- Batch overall progress
- Upload speed indicator (optional)

## Upload Execution

### Upload Flow
1. User selects photos → Added to queue
2. User taps "Upload" → Batch upload initiated
3. Photos uploaded concurrently (max 10 simultaneous)
4. Progress updates in real-time
5. Completed photos removed from queue
6. Failed photos show error with retry

### Concurrent Upload Handling
- Process up to 10 uploads simultaneously
- Queue management for remaining photos
- Non-blocking UI during uploads
- Background upload processing

## Background Upload Support

### iOS Background Upload
- Background Fetch API integration
- Background URLSession configuration
- Upload continuation when app backgrounded
- Local notifications for completion
- Resume uploads on app foreground

### Android Background Upload
- Foreground service for persistent uploads
- WorkManager for reliable background tasks
- Notification with progress
- Upload continuation when app backgrounded
- Resume uploads on app foreground

### Background Upload Features
- Uploads continue when app backgrounded
- Persistent notification with progress
- Resume interrupted uploads on app reactivation
- Network disconnection handling
- Queue persistence across app restarts

## Error Handling

### Failed Upload Display
- Clear error messages per photo
- Error type identification
- Retry button for failed uploads
- Bulk retry option
- Error details on tap

### Retry Mechanism
- Individual photo retry
- Bulk retry for all failed uploads
- Retry preserves original photo data
- Automatic retry on network reconnect

### Network Handling
- Network disconnection detection
- Queue uploads when offline
- Resume uploads when online
- Network status indicator
- Offline queue management

## Platform-Specific Features

### iOS Features
- Photos framework integration
- Native file picker
- HEIC to JPEG conversion
- Background upload with URLSession
- Local push notifications

### Android Features
- Scoped storage support (Android 10+)
- Runtime permission handling
- Foreground service for uploads
- WorkManager integration
- FCM push notifications (optional)

## User Experience

### Visual Feedback
- Smooth animations for state changes
- Loading spinners during upload initiation
- Success animations on completion
- Haptic feedback for actions (iOS)
- Error state visual indicators

### Touch Optimization
- Large tap targets (min 44x44px)
- Swipe gestures for actions
- Pull-to-refresh (optional)
- Long-press for options

## Performance Optimization

### Upload Performance
- Efficient file streaming
- Memory management for large files
- Background thread processing
- Battery optimization

### UI Performance
- Smooth animations (60 FPS)
- Efficient re-renders
- Lazy loading for photo previews
- Memory leak prevention

## Acceptance Criteria

- [ ] Photo library access functional
- [ ] Multi-photo selection working
- [ ] Camera integration (optional)
- [ ] File validation (type, size, count)
- [ ] Upload queue display
- [ ] Individual progress indicators
- [ ] Batch progress indicator
- [ ] Real-time progress updates
- [ ] Background upload support (iOS)
- [ ] Background upload support (Android)
- [ ] Failed upload error display
- [ ] Retry mechanism functional
- [ ] Network disconnection handling
- [ ] Offline queue management
- [ ] Platform-specific features implemented
- [ ] Performance optimized

## Dependencies

- Epic 9: Mobile Frontend Core (navigation, state, API client)
- Epic 3: Upload API (upload endpoints)
- Epic 5: Real-Time Progress (SSE or polling)
- @react-native-camera-roll/camera-roll
- react-native-vision-camera (optional)
- Background task libraries

## Related Epics

- Epic 11: Mobile Gallery (view uploaded photos)
- Epic 7: Web Upload UI (web equivalent)

