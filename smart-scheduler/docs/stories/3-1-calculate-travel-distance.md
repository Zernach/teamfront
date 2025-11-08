# Story 3.1: Calculate Travel Distance

Status: drafted

## Story

As a system component,
I want to calculate travel distance between locations,
so that proximity-based contractor ranking and availability calculations can account for travel time.

## Acceptance Criteria

1. System integrates with Google Maps Distance Matrix API
2. System falls back to OpenRouteService if primary API fails
3. System caches frequent route calculations
4. System responds in < 200ms (cached) or < 1s (API call)
5. System handles API rate limits gracefully

## Tasks / Subtasks

- [ ] Task 1: Create Distance Calculation Service Interface (AC: 1, 2)
  - [ ] Create IDistanceCalculationService interface
  - [ ] Define CalculateDistance method signature
  - [ ] Define fallback strategy
- [ ] Task 2: Implement Google Maps Distance Matrix Integration (AC: 1, 5)
  - [ ] Create GoogleMapsDistanceService implementation
  - [ ] Integrate Google Maps Distance Matrix API
  - [ ] Handle API authentication
  - [ ] Implement rate limit handling
  - [ ] Handle API errors and timeouts
- [ ] Task 3: Implement OpenRouteService Fallback (AC: 2, 5)
  - [ ] Create OpenRouteServiceDistanceService implementation
  - [ ] Integrate OpenRouteService API
  - [ ] Implement fallback logic when primary fails
  - [ ] Handle fallback API errors
- [ ] Task 4: Implement Caching Layer (AC: 3, 4)
  - [ ] Create cache key from origin + destination coordinates
  - [ ] Implement caching strategy (Redis or in-memory)
  - [ ] Set cache expiration (e.g., 24 hours)
  - [ ] Check cache before API calls
- [ ] Task 5: Create Distance Calculation Query (AC: 4)
  - [ ] Create CalculateDistanceQuery
  - [ ] Implement query handler
  - [ ] Use caching layer
  - [ ] Return distance in miles/kilometers
- [ ] Task 6: Create API Endpoint (AC: 4)
  - [ ] Create POST /api/distance/calculate endpoint
  - [ ] Accept origin and destination locations
  - [ ] Return distance with response time metrics
- [ ] Task 7: Write Unit Tests
  - [ ] Test Google Maps API integration
  - [ ] Test OpenRouteService fallback
  - [ ] Test caching behavior
  - [ ] Test rate limit handling
  - [ ] Test performance requirements

## Dev Notes

- Relevant architecture patterns and constraints
  - Strategy Pattern: Multiple distance service implementations
  - Caching: Use distributed cache for scalability
  - Resilience: Implement retry and circuit breaker patterns
  - Configuration: Store API keys securely
- Source tree components to touch
  - `backend/Services/IDistanceCalculationService.cs` - Interface
  - `backend/Services/GoogleMapsDistanceService.cs` - Primary implementation
  - `backend/Services/OpenRouteServiceDistanceService.cs` - Fallback
  - `backend/Services/DistanceCalculationService.cs` - Orchestrator with caching
  - `backend/Queries/CalculateDistanceQuery.cs`
  - `backend/Handlers/CalculateDistanceHandler.cs`
  - `backend/Controllers/DistanceController.cs`
  - `backend/Configuration/DistanceServiceOptions.cs` - API configuration
- Testing standards summary
  - Unit tests for each service implementation
  - Integration tests with mocked APIs
  - Test caching and fallback scenarios
  - Performance tests for response times

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Use dependency injection for service implementations
  - Follow strategy pattern for multiple providers
- Detected conflicts or variances (with rationale)
  - Requires external API credentials configuration

### References

- [Source: docs/epics/epic-3-distance-proximity-calculation.md#FR-007]
- [Source: docs/PRD-Master.md#Section-5.3]
- [Source: docs/API-Specification.md]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

