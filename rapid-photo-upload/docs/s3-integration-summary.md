# S3 Storage Integration - Implementation Summary

## Overview

The rapid-photo-upload backend has been fully integrated with AWS S3 storage. Images are now uploaded to the `teamfront-rapid-photo-upload-images` bucket instead of local file storage, and the frontend can retrieve photos with presigned URLs for secure viewing.

## What Was Implemented

### 1. S3 Storage Service (`S3PhotoStorageService`)

**Location:** `backend/src/main/java/com/rapidphotoupload/infrastructure/storage/S3PhotoStorageService.java`

**Features:**
- Upload photos to S3 bucket with proper content types
- Download photos from S3 (for backend processing)
- Delete photos from S3
- Generate presigned URLs for secure, temporary access (1-hour expiration)

**Key Methods:**
```java
String upload(String key, InputStream inputStream, String contentType)
InputStream download(String key)
void delete(String key)
String generatePresignedUrl(String key, int expirationMinutes)
```

### 2. AWS Configuration (`AsyncConfig`)

**Location:** `backend/src/main/java/com/rapidphotoupload/infrastructure/config/AsyncConfig.java`

**Features:**
- Configures AWS S3 Client with `DefaultCredentialsProvider`
- Configures S3 Presigner for generating presigned URLs
- Creates `CloudStorageService` bean based on configuration
- Supports both S3 and local file storage for development

**Credential Chain:**
The AWS SDK automatically checks for credentials in this order:
1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. System properties
3. AWS credentials file (`~/.aws/credentials`)
4. EC2 instance profile credentials

### 3. Photo Query API (`PhotoQueryController`)

**Location:** `backend/src/main/java/com/rapidphotoupload/features/photoquery/controller/PhotoQueryController.java`

**New Endpoints:**

#### Get All Photos (Gallery View)
```
GET /api/v1/photos
Authorization: Bearer <JWT_TOKEN>
Query Parameters:
  - status (optional): Filter by status (QUEUED, UPLOADING, COMPLETED, FAILED)

Response:
{
  "photos": [
    {
      "id": "uuid",
      "filename": "photo.jpg",
      "fileSize": 2048576,
      "contentType": "image/jpeg",
      "status": "COMPLETED",
      "url": "https://teamfront-rapid-photo-upload-images.s3.us-west-1.amazonaws.com/photos/ab/abcd1234.jpg?X-Amz-Signature=...",
      "uploadedAt": "2025-11-11T03:20:00Z",
      "width": 1920,
      "height": 1080
    }
  ]
}
```

**Note:** The `url` field contains a presigned URL that expires in 60 minutes. For completed photos, this URL can be used directly to display images in the gallery.

#### Get Single Photo
```
GET /api/v1/photos/{photoId}
Authorization: Bearer <JWT_TOKEN>

Response: Single PhotoResponse object
```

#### Get Download URL (Refresh Presigned URL)
```
GET /api/v1/photos/{photoId}/download-url?expirationMinutes=60
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "url": "https://...",
  "expirationMinutes": 60
}
```

### 4. Configuration Updates

All environment configurations updated to use `teamfront-rapid-photo-upload-images` bucket:

**Production (`application-prod.properties`):**
```properties
cloud.storage.type=s3
cloud.storage.s3.bucket-name=teamfront-rapid-photo-upload-images
cloud.storage.s3.region=us-west-1
cloud.storage.s3.presigned-url-expiration-minutes=60
```

**Development (`application-dev.properties`):** Same as production

**Local (`application-local.properties`):** 
- Uses S3 by default
- Can switch to local storage by setting `cloud.storage.type=local`

## Upload Flow

1. **User uploads photo** → Frontend sends file to `POST /api/v1/upload/photo` or `POST /api/v1/upload/batch`
2. **Backend receives file** → File stored temporarily, Photo aggregate created
3. **Async processing** → `PhotoUploadProcessor` handles the upload:
   - Retrieves file from temporary storage
   - Generates S3 storage key: `photos/{first-2-chars}/{photoId}.{ext}`
   - Uploads to S3 using `CloudStorageService`
   - Updates Photo aggregate with storage key
   - Sends WebSocket progress updates
4. **Frontend receives completion** → WebSocket message indicates upload complete
5. **Gallery refresh** → Frontend calls `GET /api/v1/photos` to get all photos with presigned URLs

## Storage Key Format

Photos are stored in S3 with the following key pattern:
```
photos/{first-2-chars-of-photoId}/{photoId}.{extension}

Example: photos/ab/abcd1234-5678-90ef-ghij-klmnopqrstuv.jpg
```

This partitioning strategy helps distribute files across S3 prefixes for better performance.

## Frontend Integration Guide

### 1. Fetching Photos for Gallery

**TypeScript Example:**
```typescript
interface PhotoResponse {
  id: string;
  filename: string;
  fileSize: number;
  contentType: string;
  status: string;
  url: string | null; // Presigned URL (null if not uploaded yet)
  uploadedAt: string;
  width: number | null;
  height: number | null;
}

interface PhotoListResponse {
  photos: PhotoResponse[];
}

async function fetchGalleryPhotos(token: string): Promise<PhotoListResponse> {
  const response = await fetch('https://api.example.com/api/v1/photos?status=COMPLETED', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
```

### 2. Displaying Photos

The `url` field in the response contains a presigned URL that can be used directly in an `<Image>` component:

```tsx
import { Image } from 'react-native';

function PhotoGallery({ photos }: { photos: PhotoResponse[] }) {
  return (
    <View>
      {photos.map(photo => (
        photo.url && (
          <Image
            key={photo.id}
            source={{ uri: photo.url }}
            style={{ width: 200, height: 200 }}
          />
        )
      ))}
    </View>
  );
}
```

### 3. Handling Expired URLs

Presigned URLs expire after 60 minutes. If a user keeps the gallery open for longer, you may need to refresh the URLs:

```typescript
async function refreshPhotoUrl(photoId: string, token: string): Promise<string> {
  const response = await fetch(
    `https://api.example.com/api/v1/photos/${photoId}/download-url`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data.url;
}
```

### 4. Filtering by Status

To show only completed uploads:
```typescript
const completedPhotos = await fetch(
  'https://api.example.com/api/v1/photos?status=COMPLETED',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

## Deployment Requirements

### AWS Credentials

The backend needs AWS credentials to access the S3 bucket. Set these environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-west-1
```

Or use IAM roles if deploying to EC2/ECS/Elastic Beanstalk.

### S3 Bucket Configuration

The `teamfront-rapid-photo-upload-images` bucket must:
1. Exist in the `us-west-1` region
2. Have appropriate CORS configuration for web access (if needed)
3. Have proper IAM permissions for the backend service

**Example S3 Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/backend-service-role"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::teamfront-rapid-photo-upload-images/*"
    }
  ]
}
```

## Testing

### Manual Testing Steps

1. **Start the backend:**
   ```bash
   cd backend
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   export SPRING_PROFILES_ACTIVE=dev
   mvn spring-boot:run
   ```

2. **Upload a photo** using the upload API
3. **Check S3 bucket** to verify the file was uploaded
4. **Call the gallery API** to get photos with presigned URLs
5. **Open the presigned URL** in a browser to view the image

### Integration Test

The `PhotoUploadProcessor` automatically:
- Uploads to S3 asynchronously
- Sends WebSocket progress updates
- Updates the Photo aggregate with the storage key

## WebSocket Progress Updates

The WebSocket connection continues to work as before. Progress messages now include:

```json
{
  "type": "photo_progress",
  "photoId": "uuid",
  "jobId": "uuid",
  "progress": 100,
  "total": 100,
  "status": "COMPLETED"
}
```

And for job-level progress:
```json
{
  "type": "job_progress",
  "photoId": null,
  "jobId": "uuid",
  "progress": 50,
  "total": 100,
  "status": "IN_PROGRESS"
}
```

## Troubleshooting

### Photos Not Appearing in Gallery

**Check:**
1. Photo status is `COMPLETED` (check database or API response)
2. `storageKey` field is populated in the database
3. S3 bucket contains the file at the expected key
4. AWS credentials are configured correctly
5. Backend logs for any S3 upload errors

### Presigned URLs Not Working

**Check:**
1. URL hasn't expired (60-minute TTL)
2. AWS credentials have permission to generate presigned URLs
3. S3 bucket permissions allow public access via presigned URLs
4. No CORS errors (check browser console)

### Upload Fails to S3

**Check:**
1. AWS credentials are valid
2. S3 bucket exists and is in the correct region
3. IAM permissions allow `s3:PutObject`
4. Backend logs for detailed error messages
5. Network connectivity to S3

## Next Steps

### Recommended Enhancements

1. **Thumbnail Generation:** Create thumbnails during upload for faster gallery loading
2. **Caching:** Implement presigned URL caching to reduce S3 API calls
3. **Pagination:** Add pagination to the gallery API for large photo collections
4. **Sorting/Filtering:** Implement advanced filtering (by date, size, tags)
5. **CDN Integration:** Use CloudFront for faster photo delivery
6. **Progressive Loading:** Implement lazy loading in the gallery UI

## Summary

✅ **Backend Changes Complete:**
- S3 storage service fully implemented
- Photos uploaded to `teamfront-rapid-photo-upload-images`
- Gallery API returns photos with presigned URLs
- WebSocket progress updates include `jobId`
- All environments configured for S3

✅ **Frontend Integration:**
- Call `GET /api/v1/photos` to fetch gallery photos
- Use the `url` field to display images
- Filter by `status=COMPLETED` for completed uploads only
- Refresh URLs after 60 minutes if needed

✅ **Ready for Deployment:**
- Ensure AWS credentials are configured
- Verify S3 bucket exists and has correct permissions
- Deploy and test the full upload-to-gallery flow

