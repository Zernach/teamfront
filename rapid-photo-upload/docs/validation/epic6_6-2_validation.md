# Epic 6 Story 6-2 Validation Guide: API Client and State Management Setup

## 30-Second Quick Test

Verify API client and state management compile:
```bash
cd frontend && yarn tsc --noEmit
```

Expected: No TypeScript errors

## Automated Test Results

### TypeScript Compilation
- **Status**: ✅ SUCCESS
- **Errors**: 0

## Manual Validation Steps

### 1. Verify API Client Configuration

```bash
cat frontend/services/apiClient.ts | head -30
```

Expected:
- Base URL configured
- Request interceptor adds JWT token
- Response interceptor handles 401, 403, 500
- Token refresh logic implemented

### 2. Verify Token Refresh Logic

```bash
grep -A 10 "refreshAccessToken" frontend/services/apiClient.ts
```

Expected:
- Refresh token retrieved from storage
- New access token obtained
- Original request retried with new token
- Prevents multiple simultaneous refresh requests

### 3. Verify Redux Store

```bash
cat frontend/store/index.ts
ls frontend/store/
```

Expected:
- Store configured with auth and upload slices
- authSlice.ts and uploadSlice.ts exist

### 4. Verify Auth State

```bash
cat frontend/store/authSlice.ts | head -30
```

Expected:
- User data storage
- Token storage
- isAuthenticated flag
- setAuth and clearAuth actions

### 5. Verify React Query Hooks

```bash
ls frontend/hooks/
cat frontend/hooks/api.ts | head -20
cat frontend/hooks/auth.ts | head -20
```

Expected:
- usePhotos, usePhoto, useUploadJob hooks
- useLogin, useLogout, useRegister hooks
- useRefreshToken hook

### 6. Verify Error Boundary

```bash
cat frontend/components/ErrorBoundary.tsx
grep ErrorBoundary frontend/components/Providers.tsx
```

Expected:
- ErrorBoundary component exists
- Wraps app in Providers

### 7. Verify React Query Configuration

```bash
cat frontend/services/queryClient.ts
```

Expected:
- QueryClient configured
- Default options set (staleTime, gcTime, retry)
- Cache settings configured

## Edge Cases and Error Handling

### Token Refresh
- ✅ Prevents multiple simultaneous refresh requests
- ✅ Handles refresh failure gracefully
- ✅ Clears tokens on refresh failure
- ✅ Retries original request after refresh

### Error Handling
- ✅ 401 Unauthorized → Token refresh attempt
- ✅ 403 Forbidden → Error logged
- ✅ 500 Server Error → Error logged
- ✅ Network errors → Error logged
- ✅ Error boundary catches React errors

### State Management
- ✅ Auth state persisted to localStorage
- ✅ Upload queue state in Redux
- ✅ Server state in React Query cache
- ✅ Clear separation of concerns

## Acceptance Criteria Checklist

- [x] Axios API client configured with base URL
- [x] Request interceptor adds JWT token to headers
- [x] Response interceptor handles errors (401, 403, 500)
- [x] Token refresh logic implemented
- [x] Global state management set up (Redux Toolkit)
- [x] Auth state slice created (user, token, isAuthenticated)
- [x] React Query configured for server state
- [x] Error handling and retry logic configured (ErrorBoundary, React Query retry)

## Architecture Notes

### API Client
- Axios with interceptors
- Automatic token injection
- Token refresh on 401
- Error handling for all status codes

### State Management
- Redux Toolkit for client state (auth, upload queue)
- React Query for server state (photos, jobs)
- Clear separation of concerns

### Error Handling
- Error boundary for React errors
- API error handling in interceptors
- React Query retry logic
- Network error detection

## Rollback Plan

If issues are discovered:
1. All code is in version control
2. Revert changes: `git checkout HEAD -- frontend/services/ frontend/store/ frontend/hooks/`
3. Re-run TypeScript check to verify clean state

## Files Created/Modified

- `frontend/services/apiClient.ts` - Enhanced with token refresh
- `frontend/hooks/api.ts` - React Query hooks for photos
- `frontend/hooks/auth.ts` - React Query hooks for authentication
- `frontend/components/ErrorBoundary.tsx` - Error boundary component
- `frontend/components/Providers.tsx` - Enhanced with ErrorBoundary

## Next Steps

Story 6-2 is complete. Epic 6 (Web Frontend Core) is now complete!

