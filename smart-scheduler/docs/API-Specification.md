# SmartScheduler - API Specification

**Version:** 1.0
**Date:** 2025-11-08
**Base URL:** `https://teamfront-smart-scheduler-archlife.us-west-1.elasticbeanstalk.com`
**Protocol:** REST over HTTPS
**Format:** JSON

---

## Table of Contents
1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Common Patterns](#3-common-patterns)
4. [Contractor Endpoints](#4-contractor-endpoints)
5. [Job Endpoints](#5-job-endpoints)
6. [Assignment Endpoints](#6-assignment-endpoints)
7. [Recommendation Endpoints](#7-recommendation-endpoints)
8. [SignalR Hubs](#8-signalr-hubs)
9. [Error Handling](#9-error-handling)
10. [Rate Limiting](#10-rate-limiting)

---

## 1. Overview

### 1.1 API Versioning
- Version included in URL: `/v1/contractors`
- Breaking changes require new version
- Deprecated versions supported for 12 months

### 1.2 Request/Response Format
- Content-Type: `application/json`
- Character Encoding: UTF-8
- Date Format: ISO 8601 (`2025-11-08T14:30:00Z`)
- Time Zone: UTC

### 1.3 HTTP Methods
- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT` - Update existing resources (full)
- `PATCH` - Update existing resources (partial)
- `DELETE` - Delete resources

---

## 2. Authentication

### 2.1 JWT Bearer Token
All API requests require authentication via JWT bearer token.

**Request Header:**
```http
Authorization: Bearer {access_token}
```

**Token Payload:**
```json
{
  "sub": "user-id-guid",
  "email": "dispatcher@example.com",
  "role": "Dispatcher",
  "permissions": ["contractors:read", "contractors:write", "jobs:assign"],
  "exp": 1699468800,
  "iat": 1699465200
}
```

### 2.2 Login Endpoint

**POST** `/api/auth/login`

Request:
```json
{
  "email": "dispatcher@example.com",
  "password": "SecurePassword123!"
}
```

Response (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-guid",
  "expiresIn": 3600,
  "user": {
    "id": "guid",
    "email": "dispatcher@example.com",
    "name": "John Dispatcher",
    "role": "Dispatcher"
  }
}
```

### 2.3 Refresh Token

**POST** `/api/auth/refresh`

Request:
```json
{
  "refreshToken": "refresh-token-guid"
}
```

Response (200 OK):
```json
{
  "accessToken": "new-access-token",
  "expiresIn": 3600
}
```

---

## 3. Common Patterns

### 3.1 Pagination

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `pageSize` (integer, default: 20, max: 100) - Items per page

**Response Structure:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalCount": 95
  }
}
```

### 3.2 Filtering

**Query Parameters:**
- `filter[field]` - Filter by field value
- Example: `?filter[status]=Active&filter[type]=Flooring`

### 3.3 Sorting

**Query Parameters:**
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc`
- Example: `?sortBy=rating&sortOrder=desc`

### 3.4 Field Selection

**Query Parameters:**
- `fields` - Comma-separated list of fields to include
- Example: `?fields=id,name,rating`

---

## 4. Contractor Endpoints

### 4.1 List Contractors

**GET** `/api/contractors`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 20, max: 100) |
| search | string | No | Search by name or location |
| type | string | No | Filter by type: Flooring, Tile, Carpet, Multi |
| status | string | No | Filter by status: Active, Inactive, OnLeave |
| minRating | decimal | No | Minimum rating (0.0-5.0) |
| sortBy | string | No | Field to sort by (name, rating, createdAt) |
| sortOrder | string | No | asc or desc (default: asc) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "John Smith",
      "type": "Flooring",
      "rating": 4.8,
      "baseLocation": {
        "latitude": 30.2672,
        "longitude": -97.7431,
        "address": "123 Contractor Ln",
        "city": "Austin",
        "state": "TX",
        "zipCode": "78701"
      },
      "status": "Active",
      "phoneNumber": "(512) 555-1234",
      "email": "john.smith@example.com",
      "workingSchedule": [
        {
          "dayOfWeek": 1,
          "startTime": "08:00",
          "endTime": "17:00"
        }
      ],
      "skills": ["Hardwood", "Laminate", "Vinyl"],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-11-01T14:20:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 3,
    "totalCount": 52
  }
}
```

### 4.2 Get Contractor by ID

**GET** `/api/contractors/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Contractor ID |

**Response (200 OK):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "John Smith",
  "type": "Flooring",
  "rating": 4.8,
  "baseLocation": {
    "latitude": 30.2672,
    "longitude": -97.7431,
    "address": "123 Contractor Ln",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701"
  },
  "status": "Active",
  "phoneNumber": "(512) 555-1234",
  "email": "john.smith@example.com",
  "workingSchedule": [
    {
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "17:00"
    }
  ],
  "skills": ["Hardwood", "Laminate", "Vinyl"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-11-01T14:20:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Contractor not found

### 4.3 Create Contractor

**POST** `/api/contractors`

**Request Body:**
```json
{
  "name": "Sarah Johnson",
  "type": "Tile",
  "phoneNumber": "(512) 555-5678",
  "email": "sarah.johnson@example.com",
  "baseLocation": {
    "latitude": 30.3950,
    "longitude": -97.7426,
    "address": "456 Oak Ave",
    "city": "Round Rock",
    "state": "TX",
    "zipCode": "78681"
  },
  "workingSchedule": [
    {
      "dayOfWeek": 1,
      "startTime": "07:00",
      "endTime": "16:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "07:00",
      "endTime": "16:00"
    }
  ],
  "skills": ["Ceramic", "Porcelain", "Natural Stone"]
}
```

**Response (201 Created):**
```json
{
  "id": "new-contractor-guid",
  "name": "Sarah Johnson",
  "type": "Tile",
  "rating": 0.0,
  "baseLocation": { ... },
  "status": "Active",
  "phoneNumber": "(512) 555-5678",
  "email": "sarah.johnson@example.com",
  "workingSchedule": [...],
  "skills": ["Ceramic", "Porcelain", "Natural Stone"],
  "createdAt": "2025-11-08T15:30:00Z",
  "updatedAt": "2025-11-08T15:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `409 Conflict` - Email already exists

### 4.4 Update Contractor

**PUT** `/api/contractors/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Contractor ID |

**Request Body:** (Same as Create, all fields required)

**Response (200 OK):** Updated contractor object

**Error Responses:**
- `400 Bad Request` - Validation errors
- `404 Not Found` - Contractor not found

### 4.5 Partial Update Contractor

**PATCH** `/api/contractors/{id}`

**Request Body:**
```json
{
  "phoneNumber": "(512) 555-9999",
  "workingSchedule": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "18:00"
    }
  ]
}
```

**Response (200 OK):** Updated contractor object

### 4.6 Delete Contractor

**DELETE** `/api/contractors/{id}`

**Response (204 No Content)**

**Error Responses:**
- `404 Not Found` - Contractor not found
- `409 Conflict` - Contractor has active assignments

### 4.7 Get Contractor Schedule

**GET** `/api/contractors/{id}/schedule`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date (ISO 8601) |
| endDate | date | Yes | End date (ISO 8601) |

**Response (200 OK):**
```json
{
  "contractorId": "contractor-guid",
  "contractorName": "John Smith",
  "startDate": "2025-11-10",
  "endDate": "2025-11-16",
  "schedule": [
    {
      "date": "2025-11-10",
      "dayOfWeek": "Monday",
      "workingHours": {
        "startTime": "08:00",
        "endTime": "17:00"
      },
      "assignments": [
        {
          "id": "assignment-guid",
          "jobId": "job-guid",
          "jobNumber": "JOB-20251110-ABC123",
          "timeSlot": {
            "startTime": "2025-11-10T09:00:00Z",
            "endTime": "2025-11-10T13:00:00Z"
          },
          "location": "123 Main St, Austin, TX",
          "status": "Confirmed"
        }
      ],
      "availableSlots": [
        {
          "startTime": "2025-11-10T08:00:00Z",
          "endTime": "2025-11-10T09:00:00Z"
        },
        {
          "startTime": "2025-11-10T13:30:00Z",
          "endTime": "2025-11-10T17:00:00Z"
        }
      ]
    }
  ]
}
```

---

## 5. Job Endpoints

### 5.1 List Jobs

**GET** `/api/jobs`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |
| pageSize | integer | No | Items per page |
| search | string | No | Search by job number or address |
| status | string | No | Filter: Open, Assigned, InProgress, Completed, Cancelled |
| type | string | No | Filter: Flooring, Tile, Carpet |
| startDate | date | No | Filter jobs after this date |
| endDate | date | No | Filter jobs before this date |
| sortBy | string | No | Field to sort by |
| sortOrder | string | No | asc or desc |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "job-guid",
      "jobNumber": "JOB-20251108-XYZ789",
      "type": "Flooring",
      "status": "Open",
      "desiredDate": "2025-11-10T09:00:00Z",
      "location": {
        "latitude": 30.2500,
        "longitude": -97.7500,
        "address": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "zipCode": "78701"
      },
      "duration": "04:00:00",
      "priority": "Medium",
      "specialRequirements": ["Eco-friendly materials"],
      "assignedContractor": null,
      "createdAt": "2025-11-08T10:00:00Z",
      "updatedAt": "2025-11-08T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 5.2 Get Job by ID

**GET** `/api/jobs/{id}`

**Response (200 OK):** Job object with full details

### 5.3 Create Job

**POST** `/api/jobs`

**Request Body:**
```json
{
  "type": "Flooring",
  "desiredDate": "2025-11-10T09:00:00Z",
  "location": {
    "latitude": 30.2500,
    "longitude": -97.7500,
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701"
  },
  "duration": "04:00:00",
  "priority": "Medium",
  "specialRequirements": ["Eco-friendly materials", "Pet-friendly"]
}
```

**Response (201 Created):**
```json
{
  "id": "new-job-guid",
  "jobNumber": "JOB-20251108-ABC123",
  "type": "Flooring",
  "status": "Open",
  "desiredDate": "2025-11-10T09:00:00Z",
  "location": { ... },
  "duration": "04:00:00",
  "priority": "Medium",
  "specialRequirements": [...],
  "assignedContractor": null,
  "createdAt": "2025-11-08T15:45:00Z",
  "updatedAt": "2025-11-08T15:45:00Z"
}
```

### 5.4 Update Job

**PUT** `/api/jobs/{id}`

**Request Body:** (Same as Create)

**Response (200 OK):** Updated job object

### 5.5 Cancel Job

**POST** `/api/jobs/{id}/cancel`

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

**Response (200 OK):**
```json
{
  "id": "job-guid",
  "status": "Cancelled",
  "cancellationReason": "Customer requested cancellation",
  "updatedAt": "2025-11-08T16:00:00Z"
}
```

---

## 6. Assignment Endpoints

### 6.1 Create Assignment

**POST** `/api/assignments`

**Request Body:**
```json
{
  "jobId": "job-guid",
  "contractorId": "contractor-guid",
  "scheduledTimeSlot": {
    "startTime": "2025-11-10T09:00:00Z",
    "endTime": "2025-11-10T13:00:00Z"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "assignment-guid",
  "jobId": "job-guid",
  "contractorId": "contractor-guid",
  "scheduledTimeSlot": {
    "startTime": "2025-11-10T09:00:00Z",
    "endTime": "2025-11-10T13:00:00Z",
    "duration": "04:00:00"
  },
  "status": "Pending",
  "score": 0.92,
  "scoreBreakdown": {
    "availabilityScore": 0.95,
    "ratingScore": 0.96,
    "distanceScore": 0.85,
    "availabilityWeight": 0.40,
    "ratingWeight": 0.35,
    "distanceWeight": 0.25,
    "totalScore": 0.92
  },
  "createdAt": "2025-11-08T16:15:00Z",
  "updatedAt": "2025-11-08T16:15:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Contractor not available at requested time
- `404 Not Found` - Job or Contractor not found
- `409 Conflict` - Job already assigned

### 6.2 Get Assignment by ID

**GET** `/api/assignments/{id}`

**Response (200 OK):** Assignment object with full details

### 6.3 Confirm Assignment

**POST** `/api/assignments/{id}/confirm`

**Response (200 OK):**
```json
{
  "id": "assignment-guid",
  "status": "Confirmed",
  "confirmedAt": "2025-11-08T16:20:00Z",
  "updatedAt": "2025-11-08T16:20:00Z"
}
```

### 6.4 Start Assignment

**POST** `/api/assignments/{id}/start`

**Response (200 OK):**
```json
{
  "id": "assignment-guid",
  "status": "InProgress",
  "startedAt": "2025-11-10T09:05:00Z",
  "updatedAt": "2025-11-10T09:05:00Z"
}
```

### 6.5 Complete Assignment

**POST** `/api/assignments/{id}/complete`

**Request Body:**
```json
{
  "completionNotes": "Job completed successfully. Customer satisfied.",
  "actualDuration": "03:45:00"
}
```

**Response (200 OK):**
```json
{
  "id": "assignment-guid",
  "status": "Completed",
  "completedAt": "2025-11-10T12:45:00Z",
  "completionNotes": "Job completed successfully. Customer satisfied.",
  "actualDuration": "03:45:00",
  "updatedAt": "2025-11-10T12:45:00Z"
}
```

### 6.6 Cancel Assignment

**POST** `/api/assignments/{id}/cancel`

**Request Body:**
```json
{
  "reason": "Contractor unavailable due to emergency"
}
```

**Response (200 OK):**
```json
{
  "id": "assignment-guid",
  "status": "Cancelled",
  "cancellationReason": "Contractor unavailable due to emergency",
  "updatedAt": "2025-11-09T14:00:00Z"
}
```

---

## 7. Recommendation Endpoints

### 7.1 Get Contractor Recommendations

**GET** `/api/recommendations`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | guid | Yes | Job ID to get recommendations for |
| maxResults | integer | No | Maximum results to return (default: 10, max: 50) |

**Response (200 OK):**
```json
{
  "jobId": "job-guid",
  "jobDetails": {
    "jobNumber": "JOB-20251108-ABC123",
    "type": "Flooring",
    "location": {
      "address": "123 Main St",
      "city": "Austin",
      "state": "TX"
    },
    "desiredDate": "2025-11-10T09:00:00Z",
    "duration": "04:00:00"
  },
  "recommendations": [
    {
      "rank": 1,
      "contractor": {
        "id": "contractor-guid",
        "name": "John Smith",
        "type": "Flooring",
        "rating": 4.8,
        "baseLocation": {
          "address": "123 Contractor Ln",
          "city": "Austin",
          "state": "TX"
        },
        "phoneNumber": "(512) 555-1234"
      },
      "score": 0.92,
      "scoreBreakdown": {
        "availabilityScore": 0.95,
        "ratingScore": 0.96,
        "distanceScore": 0.85,
        "availabilityWeight": 0.40,
        "ratingWeight": 0.35,
        "distanceWeight": 0.25,
        "explanation": "Contractor John Smith scored highest due to same-day availability (0.95), excellent 4.8 rating (0.96), and proximity of 2.3 miles from the job site (0.85)."
      },
      "availableTimeSlots": [
        {
          "startTime": "2025-11-10T09:00:00Z",
          "endTime": "2025-11-10T13:00:00Z",
          "duration": "04:00:00"
        },
        {
          "startTime": "2025-11-10T14:00:00Z",
          "endTime": "2025-11-10T18:00:00Z",
          "duration": "04:00:00"
        }
      ],
      "distanceFromJob": 2.3,
      "estimatedTravelTime": 12
    },
    {
      "rank": 2,
      "contractor": { ... },
      "score": 0.87,
      "scoreBreakdown": { ... },
      "availableTimeSlots": [ ... ],
      "distanceFromJob": 5.1,
      "estimatedTravelTime": 18
    }
  ],
  "generatedAt": "2025-11-08T16:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Job not found
- `400 Bad Request` - Job is not in Open status

**Performance:**
- Response time: < 500ms (95th percentile)
- Caching: 2 minutes for repeated requests

---

## 8. SignalR Hubs

### 8.1 Connection

**Hub URL:** `wss://api.smartscheduler.com/hubs/notifications`

**Connection Setup:**
```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("wss://api.smartscheduler.com/hubs/notifications", {
    accessTokenFactory: () => getAccessToken()
  })
  .withAutomaticReconnect()
  .build();

await connection.start();
```

### 8.2 Events

#### JobAssigned Event

**Event Name:** `JobAssigned`

**Payload:**
```json
{
  "eventId": "event-guid",
  "eventType": "JobAssigned",
  "timestamp": "2025-11-08T16:15:00Z",
  "data": {
    "jobId": "job-guid",
    "jobNumber": "JOB-20251108-ABC123",
    "contractorId": "contractor-guid",
    "contractorName": "John Smith",
    "assignmentId": "assignment-guid",
    "scheduledTimeSlot": {
      "startTime": "2025-11-10T09:00:00Z",
      "endTime": "2025-11-10T13:00:00Z"
    }
  }
}
```

**Client Subscription:**
```javascript
connection.on("JobAssigned", (payload) => {
  console.log(`Job ${payload.data.jobNumber} assigned to ${payload.data.contractorName}`);
  // Update UI
});
```

#### ScheduleUpdated Event

**Event Name:** `ScheduleUpdated`

**Payload:**
```json
{
  "eventId": "event-guid",
  "eventType": "ScheduleUpdated",
  "timestamp": "2025-11-08T16:20:00Z",
  "data": {
    "contractorId": "contractor-guid",
    "contractorName": "John Smith",
    "updatedFields": ["workingSchedule"],
    "previousSchedule": [...],
    "newSchedule": [...]
  }
}
```

#### ContractorRated Event

**Event Name:** `ContractorRated`

**Payload:**
```json
{
  "eventId": "event-guid",
  "eventType": "ContractorRated",
  "timestamp": "2025-11-08T17:00:00Z",
  "data": {
    "contractorId": "contractor-guid",
    "contractorName": "John Smith",
    "previousRating": 4.7,
    "newRating": 4.8,
    "jobId": "job-guid"
  }
}
```

#### AssignmentStatusChanged Event

**Event Name:** `AssignmentStatusChanged`

**Payload:**
```json
{
  "eventId": "event-guid",
  "eventType": "AssignmentStatusChanged",
  "timestamp": "2025-11-10T09:05:00Z",
  "data": {
    "assignmentId": "assignment-guid",
    "jobId": "job-guid",
    "jobNumber": "JOB-20251108-ABC123",
    "contractorId": "contractor-guid",
    "previousStatus": "Confirmed",
    "newStatus": "InProgress"
  }
}
```

---

## 9. Error Handling

### 9.1 Error Response Format

All errors follow a consistent structure:

```json
{
  "type": "https://api.smartscheduler.com/errors/validation-error",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "00-trace-id-00",
  "errors": {
    "Name": ["Name is required"],
    "PhoneNumber": ["Phone number must be in format (XXX) XXX-XXXX"]
  }
}
```

### 9.2 HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### 9.3 Common Error Types

**Validation Error (400)**
```json
{
  "type": "validation-error",
  "title": "Validation failed",
  "status": 400,
  "errors": {
    "email": ["Email is required", "Email must be valid"]
  }
}
```

**Not Found (404)**
```json
{
  "type": "not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "Contractor with ID 'guid' was not found"
}
```

**Conflict (409)**
```json
{
  "type": "conflict",
  "title": "Resource conflict",
  "status": 409,
  "detail": "A contractor with email 'john@example.com' already exists"
}
```

**Business Rule Violation (400)**
```json
{
  "type": "business-rule-violation",
  "title": "Business rule violated",
  "status": 400,
  "detail": "Contractor cannot be deleted while they have active assignments"
}
```

---

## 10. Rate Limiting

### 10.1 Rate Limits

| User Role | Requests per Minute | Burst Limit |
|-----------|---------------------|-------------|
| Dispatcher | 100 | 120 |
| Manager | 60 | 80 |
| Admin | 200 | 250 |

### 10.2 Rate Limit Headers

**Response Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1699468860
```

### 10.3 Rate Limit Exceeded Response

**429 Too Many Requests:**
```json
{
  "type": "rate-limit-exceeded",
  "title": "Rate limit exceeded",
  "status": 429,
  "detail": "You have exceeded the rate limit of 100 requests per minute",
  "retryAfter": 45
}
```

**Response Headers:**
```http
Retry-After: 45
```

---

## Appendix A: Complete Request/Response Examples

### Example 1: Complete Job Assignment Flow

**Step 1: Create Job**
```http
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "Flooring",
  "desiredDate": "2025-11-10T09:00:00Z",
  "location": {
    "latitude": 30.2500,
    "longitude": -97.7500,
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701"
  },
  "duration": "04:00:00",
  "priority": "High"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/jobs/new-job-guid

{
  "id": "new-job-guid",
  "jobNumber": "JOB-20251108-ABC123",
  "status": "Open",
  ...
}
```

**Step 2: Get Recommendations**
```http
GET /api/recommendations?jobId=new-job-guid&maxResults=5
Authorization: Bearer {token}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "jobId": "new-job-guid",
  "recommendations": [
    {
      "rank": 1,
      "contractor": { ... },
      "score": 0.92,
      "availableTimeSlots": [ ... ]
    }
  ]
}
```

**Step 3: Create Assignment**
```http
POST /api/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "jobId": "new-job-guid",
  "contractorId": "top-contractor-guid",
  "scheduledTimeSlot": {
    "startTime": "2025-11-10T09:00:00Z",
    "endTime": "2025-11-10T13:00:00Z"
  }
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "assignment-guid",
  "status": "Pending",
  "score": 0.92,
  ...
}
```

**Step 4: Confirm Assignment**
```http
POST /api/assignments/assignment-guid/confirm
Authorization: Bearer {token}
```

**Response:**
```http
HTTP/1.1 200 OK

{
  "id": "assignment-guid",
  "status": "Confirmed",
  "confirmedAt": "2025-11-08T16:30:00Z"
}
```

---

**Document Control**
- **Version**: 1.0
- **Author**: Mary, Business Analyst
- **Date**: 2025-11-08
- **Status**: Draft
