# Story 4.1: Weighted Scoring Algorithm

Status: drafted

## Story

As a dispatcher,
I want contractors ranked using a weighted scoring algorithm,
so that I can quickly identify the best contractors for each job based on multiple factors.

## Acceptance Criteria

1. System uses configurable weights for availability, rating, and distance
2. All scores normalized to 0.0 - 1.0 range
3. Final score calculated as: (availabilityWeight × availabilityScore) + (ratingWeight × ratingScore) + (distanceWeight × distanceScore)
4. Default weights: availability=0.40, rating=0.35, distance=0.25
5. Availability score: 1.0 if available same day, decreasing by 0.1/day delay
6. Rating score: rating / 5.0
7. Distance score: 1.0 - (distance / maxDistance), where maxDistance = 50 miles
8. Final score between 0.0 and 1.0
9. Detailed score breakdown returned with results
10. Performance: < 200ms for 100 contractors

## Tasks / Subtasks

- [ ] Task 1: Create Scoring Service Domain Service (AC: 1, 2, 3, 4, 5, 6, 7, 8)
  - [ ] Create ScoringService domain service
  - [ ] Implement availability score calculation
  - [ ] Implement rating score calculation
  - [ ] Implement distance score calculation
  - [ ] Implement weighted combination algorithm
  - [ ] Normalize all scores to 0.0-1.0 range
- [ ] Task 2: Implement Score Component Calculations (AC: 5, 6, 7)
  - [ ] Calculate availability score based on days until available
  - [ ] Calculate rating score from contractor rating
  - [ ] Calculate distance score from job location distance
  - [ ] Handle edge cases (no availability, no rating, max distance)
- [ ] Task 3: Create Configuration for Weights (AC: 1, 4)
  - [ ] Create ScoringWeights configuration class
  - [ ] Load from appsettings.json
  - [ ] Set default values
  - [ ] Allow runtime configuration updates
- [ ] Task 4: Create Score Breakdown DTO (AC: 9)
  - [ ] Create ScoringDetails value object
  - [ ] Include component scores (availability, rating, distance)
  - [ ] Include weights used
  - [ ] Include final score
- [ ] Task 5: Optimize Performance (AC: 10)
  - [ ] Batch score calculations
  - [ ] Cache distance calculations
  - [ ] Optimize database queries
  - [ ] Use parallel processing where appropriate
- [ ] Task 6: Write Unit Tests
  - [ ] Test availability score calculation
  - [ ] Test rating score calculation
  - [ ] Test distance score calculation
  - [ ] Test weighted combination
  - [ ] Test normalization
  - [ ] Test performance with 100 contractors

## Dev Notes

- Relevant architecture patterns and constraints
  - Domain Service: ScoringService encapsulates scoring logic
  - Configuration: Use IOptions pattern for weights
  - Performance: Optimize for batch processing
  - Dependencies: Requires Epic 2 (availability) and Epic 3 (distance)
- Source tree components to touch
  - `backend/Services/ScoringService.cs` - Domain service
  - `backend/ValueObjects/ScoringDetails.cs` - Value object
  - `backend/Configuration/ScoringWeightsOptions.cs` - Configuration
  - `backend/appsettings.json` - Default weights configuration
- Testing standards summary
  - Unit tests for each score component
  - Test weighted combination algorithm
  - Test normalization edge cases
  - Performance tests for 100 contractors

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Domain service in Services folder
  - Value objects in ValueObjects folder
  - Configuration using IOptions pattern
- Detected conflicts or variances (with rationale)
  - Depends on Epic 2 and Epic 3 - may need to mock for initial implementation

### References

- [Source: docs/epics/epic-4-scoring-ranking-engine.md#FR-009]
- [Source: docs/PRD-Master.md#Section-5.4]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

