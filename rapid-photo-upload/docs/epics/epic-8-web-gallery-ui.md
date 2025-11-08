# Epic 8: Web Gallery UI

**Epic ID:** 8  
**Title:** Web Gallery UI  
**Description:** Photo grid, infinite scroll, detail view

## Overview

Implement the web photo gallery interface with infinite scroll, photo grid display, filtering, sorting, and detailed photo view. This epic focuses on performance optimization for displaying large photo collections.

## Photo Grid Display

### Grid Layout
- Responsive grid (3-5 columns on desktop, 2-3 on tablet, 1 on mobile)
- Photo cards with thumbnails
- Lazy loading for images
- Skeleton loaders during fetch
- Smooth grid animations

### Thumbnail Display
- Presigned thumbnail URLs from API
- Lazy loading as images enter viewport
- Placeholder/loading state
- Error state for failed image loads
- Aspect ratio preservation

### Photo Cards
- Thumbnail image
- Filename display
- Upload date
- File size
- Status badge
- Tags display (if any)
- Hover effects

## Infinite Scroll Pagination

### Pagination Implementation
- React Query infinite query
- Load more on scroll to bottom
- Loading indicator at bottom
- Smooth scroll behavior
- Page size: 50 photos (default)

### Performance Optimization
- Virtual scrolling for large lists (optional)
- Image lazy loading
- Efficient re-rendering
- Debounced scroll handlers

## Filtering & Sorting

### Tag Filtering
- Multi-select tag dropdown
- Filter by multiple tags (AND logic)
- Clear filters button
- Active filter indicators
- Tag autocomplete from user's existing tags

### Sorting Options
- Sort by upload date (default, newest first)
- Sort by filename (A-Z, Z-A)
- Sort by file size (largest first, smallest first)
- Sort dropdown UI
- Sort state persistence

### Status Filtering
- Filter by upload status
- Show only completed photos (default)
- Show failed uploads
- Show in-progress uploads

## Photo Detail View

### Modal/Fullscreen View
- Click photo → Opens detail modal
- Full-size image display
- Photo metadata display:
  - Filename
  - File size
  - Dimensions (width x height)
  - Upload date
  - Tags (with add/remove)
  - Upload status
- Download button
- Delete button (with confirmation)
- Close button

### Image Display
- Full-size image with presigned URL
- Zoom functionality (optional)
- Loading state
- Error handling

## Search Functionality

### Filename Search
- Search input field
- Debounced search (300ms)
- Filter photos by filename
- Clear search button
- Search state persistence

## Photo Actions

### Download Photo
- Download button on photo card and detail view
- Uses presigned download URL
- Downloads with original filename
- Download progress indicator (optional)

### Delete Photo
- Delete button in detail view
- Confirmation dialog
- Optimistic UI update
- Error handling on failure
- Remove from grid on success

### Tag Management
- Add tags in detail view
- Remove tags
- Tag autocomplete
- Bulk tagging (growth feature)

## Performance Requirements

- Initial grid load: < 500ms for 50 photos
- Infinite scroll fetch: < 1 second
- Image lazy loading: visible within 200ms
- Smooth scrolling at 60 FPS
- No UI blocking during operations

## Responsive Design

### Breakpoints
- Desktop: 1920x1080 (3-5 columns)
- Tablet: 768x1024 (2-3 columns)
- Mobile: 375x667 (1 column)

### Touch Optimization
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures (optional)
- Pull-to-refresh (mobile)

## Error Handling

### API Errors
- Error state display
- Retry button
- Graceful degradation
- User-friendly error messages

### Image Load Errors
- Broken image placeholder
- Retry image load
- Error icon display

## Acceptance Criteria

- [ ] Photo grid with responsive layout
- [ ] Thumbnail lazy loading
- [ ] Infinite scroll pagination
- [ ] Tag filtering functional
- [ ] Sorting by date, filename, size
- [ ] Status filtering implemented
- [ ] Photo detail modal/view
- [ ] Filename search working
- [ ] Download functionality
- [ ] Delete functionality (with confirmation)
- [ ] Tag management in detail view
- [ ] Performance targets met
- [ ] Responsive design implemented
- [ ] Error handling in place

## Dependencies

- Epic 6: Web Frontend Core (routing, state, API client)
- Epic 4: Photo Query API (photo listing endpoints)
- React Query for infinite queries
- Image lazy loading library (optional)

## Related Epics

- Epic 7: Web Upload UI (photos uploaded here)
- Epic 11: Mobile Gallery (mobile equivalent)

