# Epic 3: Distance & Proximity Calculation

**Epic ID:** 3  
**Title:** Distance & Proximity Calculation  
**Priority:** P0 (Critical)  
**Status:** Active Development

---

## Overview

This epic implements distance and travel time calculation between locations, enabling proximity-based contractor ranking and availability calculations that account for travel time between jobs.

## Goal

Accurately calculate travel distance and time between job locations and contractor base locations, with support for caching and fallback mechanisms for reliability.

---

## Functional Requirements

### FR-007: Calculate Travel Distance
- **Description**: System shall calculate distance between locations
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Integration with Google Maps Distance Matrix API
  - Fallback to OpenRouteService if primary fails
  - Caching of frequent route calculations
  - Response time: < 200ms (cached), < 1s (API call)
  - Handles API rate limits gracefully

### FR-008: Calculate Travel Time
- **Description**: System shall estimate travel time between locations
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Considers time of day for traffic patterns
  - Returns optimistic, realistic, and pessimistic estimates
  - Used in availability calculation for job sequencing
  - Cached for performance

---

## Related Domain Entities

- **Location**: Value object with Latitude, Longitude, Address properties
- **Job**: Contains Location value object
- **Contractor**: Contains BaseLocation value object

---

## External Integrations

- **Google Maps Distance Matrix API**
  - Purpose: Calculate distance and travel time
  - SLA: 99.9% uptime
  - Rate Limits: 100 requests/second
  - Fallback: OpenRouteService API

- **OpenRouteService API**
  - Purpose: Fallback distance calculation service
  - Used when Google Maps API is unavailable

---

## Dependencies

- Epic 1: Contractor Management (CRUD) - Required for contractor location data
- Epic 2: Availability Engine - Uses travel time for availability calculations
- External API credentials and configuration
- Caching infrastructure

---

## References

- Master PRD: `PRD-Master.md` - Section 5.3, Section 7.1
- Backend PRD: `PRD-Backend.md`
- API Specification: `API-Specification.md`

