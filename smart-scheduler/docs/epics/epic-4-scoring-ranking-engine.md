# Epic 4: Scoring & Ranking Engine

**Epic ID:** 4  
**Title:** Scoring & Ranking Engine  
**Priority:** P0 (Critical)  
**Status:** Active Development

---

## Overview

This epic implements the core intelligent matching algorithm that scores and ranks contractors based on multiple weighted factors including availability, rating, and distance. This is the primary differentiator of the SmartScheduler system.

## Goal

Provide intelligent contractor recommendations by scoring and ranking contractors using a weighted multi-factor algorithm, enabling dispatchers to quickly identify the best contractors for each job.

---

## Functional Requirements

### FR-009: Weighted Scoring Algorithm
- **Description**: System shall rank contractors using weighted scoring
- **Priority**: P0 (Critical)
- **Algorithm**:
```
score = (availabilityWeight × availabilityScore) +
        (ratingWeight × ratingScore) +
        (distanceWeight × distanceScore)

Default Weights:
- availabilityWeight: 0.40
- ratingWeight: 0.35
- distanceWeight: 0.25

Score Components (0.0 - 1.0):
- availabilityScore: 1.0 if available same day, decreasing by 0.1/day delay
- ratingScore: rating / 5.0
- distanceScore: 1.0 - (distance / maxDistance), where maxDistance = 50 miles
```
- **Acceptance Criteria**:
  - Configurable weights via application settings
  - All scores normalized to 0.0 - 1.0 range
  - Final score between 0.0 and 1.0
  - Detailed score breakdown returned with results
  - Performance: < 200ms for 100 contractors

### FR-010: Contractor Recommendation API
- **Description**: Primary endpoint for contractor recommendations
- **Priority**: P0 (Critical)
- **Input**:
  - jobType: string (required)
  - desiredDate: DateTime (required)
  - location: Location (required)
  - duration: TimeSpan (optional, default: 4 hours)
  - maxResults: int (optional, default: 10)
- **Output**:
  - List of RankedContractor objects sorted by score (descending)
  - Each result includes: contractor details, score, score breakdown, available time slots
- **Acceptance Criteria**:
  - Returns only contractors matching job type
  - Returns only contractors with availability on desired date
  - Maximum 50 results regardless of maxResults parameter
  - Response time: < 500ms
  - Handles no matches gracefully with empty array

---

## Related Domain Entities

- **Contractor**: Contains Rating, Type, BaseLocation
- **Job**: Contains JobType, DesiredDate, Location, Duration
- **Assignment**: Contains Score and ScoreBreakdown (ScoringDetails value object)
- **ScoringDetails**: Value object containing detailed score breakdown

---

## Domain Services

- **Scoring Service**: Core domain service responsible for scoring calculations

---

## Dependencies

- Epic 1: Contractor Management (CRUD) - Required for contractor data
- Epic 2: Availability Engine - Required for availability scoring
- Epic 3: Distance & Proximity Calculation - Required for distance scoring
- Application configuration for weight management

---

## References

- Master PRD: `PRD-Master.md` - Section 5.4
- Backend PRD: `PRD-Backend.md` - Section 4.4 Domain Services
- API Specification: `API-Specification.md`

