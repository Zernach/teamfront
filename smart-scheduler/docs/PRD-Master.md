# SmartScheduler - Master Product Requirements Document

**Version:** 1.0
**Date:** 2025-11-08
**Project:** SmartScheduler - Intelligent Contractor Discovery & Scheduling System
**Product Owner:** Ryan
**Status:** Active Development

---

## Executive Summary

SmartScheduler is an intelligent contractor discovery and scheduling system designed to automate and optimize the assignment of contractors to flooring jobs. The system uses structured logic, real-time data, and weighted scoring algorithms to automatically match jobs to the best available, qualified contractors.

### Key Objectives
- Automate contractor-to-job matching using intelligent algorithms
- Reduce manual scheduling time by 40%
- Improve contractor utilization rate by 25%
- Accelerate job assignment time by 20%
- Enhance customer satisfaction through faster, more accurate matching

---

## 1. Product Vision & Strategy

### 1.1 Problem Statement
The flooring industry currently suffers from significant operational inefficiencies due to manual scheduling processes:
- **Long Response Times**: Manual review of contractor availability delays job assignments
- **Scheduling Errors**: Human error leads to double-bookings and missed opportunities
- **Underutilized Capacity**: Inability to optimize contractor workload distribution
- **Poor Customer Experience**: Delayed responses impact customer satisfaction

### 1.2 Solution Overview
SmartScheduler transforms Floorzap from a job-tracking tool into an intelligent operational assistant by:
1. Automatically discovering available contractors based on job requirements
2. Scoring and ranking contractors using multi-factor weighted algorithms
3. Providing real-time schedule updates through event-driven architecture
4. Optimizing workforce utilization through intelligent matching

### 1.3 Target Users
- **Primary**: Dispatchers responsible for contractor assignment
- **Secondary**: Contractors receiving job assignments
- **Tertiary**: Operations managers monitoring system performance

---

## 2. Success Metrics & KPIs

### 2.1 Efficiency Metrics
| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| Manual Scheduling Time | 100% | 60% (-40% reduction) | Time tracking per assignment |
| Contractor Utilization | 100% | 125% (+25% improvement) | Jobs/contractor/week |
| Assignment Speed | 100% | 120% (+20% improvement) | Time from job creation to assignment |
| Customer Satisfaction | Baseline CSAT | +15% improvement | Post-job surveys |

### 2.2 Technical Performance Metrics
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Recommendation API Response Time | < 300ms | < 500ms |
| System Uptime | 99.5% | 99.0% |
| Real-time Event Delivery | < 2s | < 5s |
| Database Query Performance | < 100ms | < 200ms |

---

## 3. System Architecture Overview

### 3.1 Architectural Principles

**Domain-Driven Design (DDD)**
- Core entities modeled as rich domain objects: Job, Contractor, Schedule, Assignment
- Bounded contexts clearly defined and enforced
- Ubiquitous language established across business and technical teams

**Command Query Responsibility Segregation (CQRS)**
- Commands (write operations): AssignJob, UpdateContractor, CreateJob, UpdateSchedule
- Queries (read operations): GetRankedContractors, GetContractorAvailability, GetJobDetails
- Clear separation enables independent scaling and optimization

**Vertical Slice Architecture (VSA)**
- Features organized by business capability rather than technical layer
- Each slice contains all layers needed for that feature
- Reduces coupling and improves maintainability

### 3.2 Layer Architecture

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                   │
│  (React Native + TypeScript Frontend)        │
└─────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────┐
│         API Gateway Layer                    │
│      (.NET 8 Web API + SignalR)             │
└─────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────┐
│         Application Layer                    │
│  (Commands, Queries, Event Handlers)         │
└─────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────┐
│         Domain Layer                         │
│  (Entities, Value Objects, Domain Services)  │
└─────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────┐
│         Infrastructure Layer                 │
│  (Database, External APIs, Messaging)        │
└─────────────────────────────────────────────┘
```

### 3.3 Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Backend API | .NET 8 (C#) | Mandatory requirement, enterprise-grade performance |
| Frontend | React Native + TypeScript | Cross-platform, type-safe, component-based |
| Real-time Communication | SignalR | Integrated .NET solution for WebSocket communication |
| Database | PostgreSQL | Open-source, robust, excellent spatial support |
| Cloud Platform | AWS | Mandatory requirement, comprehensive service ecosystem |
| Mapping Service | Google Maps API / OpenRouteService | Distance calculation, routing optimization |
| Message Bus | AWS SNS/SQS or In-Memory | Event-driven communication |
| AI/LLM (Optional) | OpenAI API / LangChain | Explanation generation, enhanced user experience |

---

## 4. Core Domain Model

### 4.1 Domain Entities

**Contractor**
```csharp
Properties:
- Id: Guid
- Name: string
- Type: ContractorType (enum: Flooring, Tile, Carpet, Multi)
- Rating: decimal (0.0 - 5.0)
- BaseLocation: Location (value object)
- Schedule: WorkingHours (value object)
- Skills: List<Skill>
- Status: ContractorStatus (enum: Active, Inactive, OnLeave)
- CreatedAt: DateTime
- UpdatedAt: DateTime

Behaviors:
- UpdateRating(decimal newRating)
- AddSkill(Skill skill)
- UpdateSchedule(WorkingHours hours)
- MarkUnavailable(DateRange range)
```

**Job**
```csharp
Properties:
- Id: Guid
- JobType: JobType (enum: Flooring, Tile, Carpet)
- DesiredDate: DateTime
- Location: Location (value object)
- Duration: TimeSpan
- Status: JobStatus (enum: Open, Assigned, InProgress, Completed, Cancelled)
- Priority: Priority (enum: Low, Medium, High, Urgent)
- SpecialRequirements: List<string>
- CreatedAt: DateTime
- UpdatedAt: DateTime

Behaviors:
- AssignContractor(Contractor contractor, TimeSlot timeSlot)
- Cancel(string reason)
- Complete(DateTime completionTime)
```

**Assignment**
```csharp
Properties:
- Id: Guid
- JobId: Guid
- ContractorId: Guid
- ScheduledTimeSlot: TimeSlot (value object)
- Status: AssignmentStatus (enum: Pending, Confirmed, InProgress, Completed)
- Score: decimal
- ScoreBreakdown: ScoringDetails (value object)
- CreatedAt: DateTime
- ConfirmedAt: DateTime?

Behaviors:
- Confirm()
- Start()
- Complete(CompletionDetails details)
- Cancel(string reason)
```

### 4.2 Value Objects

**Location**
```csharp
Properties:
- Latitude: decimal
- Longitude: decimal
- Address: string
- City: string
- State: string
- ZipCode: string

Behaviors:
- DistanceTo(Location other): decimal
- IsWithinRadius(Location center, decimal radiusMiles): bool
```

**WorkingHours**
```csharp
Properties:
- DayOfWeek: DayOfWeek
- StartTime: TimeSpan
- EndTime: TimeSpan
- TimeZone: TimeZoneInfo

Behaviors:
- IsAvailableAt(DateTime dateTime): bool
- GetAvailableSlots(DateTime date, TimeSpan duration): List<TimeSlot>
```

**TimeSlot**
```csharp
Properties:
- StartTime: DateTime
- EndTime: DateTime
- Duration: TimeSpan

Behaviors:
- OverlapsWith(TimeSlot other): bool
- Contains(DateTime time): bool
```

---

## 5. Core Functional Requirements

### 5.1 Contractor Management (CRUD)

**FR-001: Create Contractor**
- **Description**: System shall allow creation of new contractor profiles
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - All required fields validated before save
  - Duplicate contractor detection by name + location
  - Default working hours set to Mon-Fri 8AM-5PM
  - Unique contractor ID generated
  - CreatedAt timestamp recorded

**FR-002: Read/View Contractor**
- **Description**: System shall allow viewing contractor details
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Individual contractor view by ID
  - List view with filtering and pagination
  - Search by name, type, location, rating
  - Include current availability status
  - Show job history and statistics

**FR-003: Update Contractor**
- **Description**: System shall allow updating contractor information
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - All fields except ID are editable
  - Validation on all field updates
  - UpdatedAt timestamp recorded on changes
  - Optimistic concurrency control implemented
  - Change history tracked

**FR-004: Delete/Deactivate Contractor**
- **Description**: System shall allow soft deletion of contractors
- **Priority**: P1 (High)
- **Acceptance Criteria**:
  - Soft delete (status = Inactive) instead of hard delete
  - Cannot delete contractors with active assignments
  - Deleted contractors excluded from searches
  - Admin can restore deleted contractors
  - Audit trail maintained

### 5.2 Availability Engine

**FR-005: Calculate Contractor Availability**
- **Description**: System shall accurately determine contractor availability
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Considers working hours configuration
  - Accounts for existing job assignments
  - Respects marked unavailable periods
  - Calculates available time slots by duration
  - Performance: < 100ms per contractor

**FR-006: Find Open Time Slots**
- **Description**: System shall identify available time slots for job duration
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Input: Contractor ID, desired date, job duration
  - Output: List of available time slots
  - Accounts for travel time between jobs
  - Minimum 30-minute buffer between jobs
  - Handles overnight jobs spanning multiple days

### 5.3 Distance & Proximity Calculation

**FR-007: Calculate Travel Distance**
- **Description**: System shall calculate distance between locations
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Integration with Google Maps Distance Matrix API
  - Fallback to OpenRouteService if primary fails
  - Caching of frequent route calculations
  - Response time: < 200ms (cached), < 1s (API call)
  - Handles API rate limits gracefully

**FR-008: Calculate Travel Time**
- **Description**: System shall estimate travel time between locations
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Considers time of day for traffic patterns
  - Returns optimistic, realistic, and pessimistic estimates
  - Used in availability calculation for job sequencing
  - Cached for performance

### 5.4 Scoring & Ranking Engine

**FR-009: Weighted Scoring Algorithm**
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

**FR-010: Contractor Recommendation API**
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

### 5.5 Event-Driven Updates

**FR-011: Job Assignment Event**
- **Description**: System shall publish JobAssigned event on assignment
- **Priority**: P0 (Critical)
- **Event Payload**:
  - jobId, contractorId, assignmentId, scheduledTimeSlot, timestamp
- **Acceptance Criteria**:
  - Published via message bus (SNS/SQS)
  - SignalR notification to dispatcher UI
  - SignalR notification to contractor (if online)
  - Idempotent event handling
  - Delivery guarantee: at-least-once

**FR-012: Schedule Updated Event**
- **Description**: System shall publish ScheduleUpdated event
- **Priority**: P1 (High)
- **Event Payload**:
  - contractorId, updatedFields, previousValues, timestamp
- **Acceptance Criteria**:
  - Published on contractor schedule changes
  - Triggers availability recalculation
  - Updates cached availability data
  - Real-time UI updates via SignalR

**FR-013: Contractor Rated Event**
- **Description**: System shall publish ContractorRated event
- **Priority**: P1 (High)
- **Event Payload**:
  - contractorId, jobId, rating, previousRating, timestamp
- **Acceptance Criteria**:
  - Published on rating updates
  - Recalculates contractor average rating
  - Updates contractor profile
  - Triggers re-ranking if active recommendations exist

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements
- **NFR-001**: API response time < 500ms for 95th percentile
- **NFR-002**: Database queries < 100ms for 95th percentile
- **NFR-003**: Real-time event delivery < 2 seconds
- **NFR-004**: System supports 1000 concurrent users
- **NFR-005**: Handles 10,000 contractors with sub-second search

### 6.2 Availability & Reliability
- **NFR-006**: System uptime 99.5% (43.8 hours downtime/year)
- **NFR-007**: Graceful degradation when external APIs fail
- **NFR-008**: Automatic failover for database connections
- **NFR-009**: Zero data loss during failures

### 6.3 Security Requirements
- **NFR-010**: All API endpoints require authentication
- **NFR-011**: Role-based access control (RBAC) implemented
- **NFR-012**: All data encrypted in transit (TLS 1.3)
- **NFR-013**: Sensitive data encrypted at rest
- **NFR-014**: Audit logging for all data modifications
- **NFR-015**: API rate limiting: 100 requests/minute per user

### 6.4 Scalability Requirements
- **NFR-016**: Horizontal scaling for API servers
- **NFR-017**: Database read replicas for query scaling
- **NFR-018**: Caching layer for frequently accessed data
- **NFR-019**: Message queue handles 10,000 events/minute

### 6.5 Maintainability Requirements
- **NFR-020**: Code coverage minimum 80%
- **NFR-021**: All public APIs documented with OpenAPI/Swagger
- **NFR-022**: Comprehensive logging with correlation IDs
- **NFR-023**: Monitoring and alerting for critical metrics
- **NFR-024**: Infrastructure as code (Terraform/CloudFormation)

---

## 7. Integration Requirements

### 7.1 External API Integrations

**Google Maps Distance Matrix API**
- **Purpose**: Calculate distance and travel time between locations
- **SLA**: 99.9% uptime
- **Rate Limits**: 100 requests/second
- **Fallback**: OpenRouteService API
- **Error Handling**: Cached estimates, manual override option

**OpenAI API (Optional)**
- **Purpose**: Generate human-readable ranking explanations
- **Model**: GPT-4 or GPT-3.5-turbo
- **Use Case**: "Contractor X was chosen due to 4.8 rating and proximity to job site"
- **Rate Limits**: 60 requests/minute
- **Fallback**: Template-based explanations

### 7.2 Internal Service Integration

**Authentication Service**
- JWT token validation
- Role and permission verification
- Token refresh mechanism

**Notification Service**
- SMS notifications for contractors
- Email notifications for assignment confirmations
- Push notifications via mobile app

---

## 8. Data Management

### 8.1 Data Retention
- Active jobs: 2 years
- Completed jobs: 7 years
- Contractor profiles: Indefinitely (until deleted)
- Audit logs: 3 years
- Event logs: 90 days

### 8.2 Backup & Recovery
- Database backups: Daily full, hourly incremental
- Point-in-time recovery: 30 days
- Backup retention: 90 days
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour

### 8.3 Data Privacy
- PII data identified and classified
- GDPR compliance for data deletion requests
- SOC 2 compliance for data handling
- Data anonymization for analytics

---

## 9. Testing Requirements

### 9.1 Unit Testing
- All domain logic unit tested
- Minimum 80% code coverage
- Tests run in CI/CD pipeline
- Fast execution: < 2 minutes total

### 9.2 Integration Testing
- End-to-end workflow testing
- Database integration tests
- External API mock testing
- Message bus integration tests

### 9.3 Performance Testing
- Load testing: 1000 concurrent users
- Stress testing: 3x normal load
- Endurance testing: 24-hour sustained load
- API response time validation

### 9.4 User Acceptance Testing
- Dispatcher workflow testing
- Contractor assignment scenarios
- Edge case validation
- Real-world data testing

---

## 10. Deployment & DevOps

### 10.1 Environments
- **Development**: Local development, frequent deployments
- **Staging**: Production mirror, pre-release validation
- **Production**: Live system, controlled deployments

### 10.2 CI/CD Pipeline
- Automated builds on commit
- Automated testing (unit, integration)
- Code quality checks (linting, static analysis)
- Security scanning (dependency vulnerabilities)
- Automated deployment to staging
- Manual approval for production deployment

### 10.3 Monitoring & Observability
- Application Performance Monitoring (APM)
- Infrastructure monitoring (CPU, memory, disk)
- Custom business metrics dashboards
- Distributed tracing for request flows
- Log aggregation and analysis

---

## 11. Project Constraints & Assumptions

### 11.1 Constraints
- **Timeline**: 1-week development target
- **Budget**: AWS free tier where possible
- **Technology**: .NET 8 mandatory, AWS mandatory
- **Team**: Development team size and composition

### 11.2 Assumptions
- Contractors have smartphones for notifications
- Internet connectivity available for real-time updates
- Google Maps API credits available
- Initial data set: < 500 contractors, < 1000 jobs
- Single geographic region for initial launch

---

## 12. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| External API downtime | Medium | High | Implement fallback APIs, caching |
| Database performance degradation | Low | High | Query optimization, read replicas |
| SignalR connection failures | Medium | Medium | Polling fallback, reconnection logic |
| Algorithm accuracy concerns | Medium | Medium | A/B testing, manual override capability |
| Scope creep | High | High | Strict change control, prioritization |

---

## 13. Future Enhancements (Out of Scope v1.0)

- Machine learning model for predictive scoring
- Mobile contractor app for iOS/Android
- Advanced scheduling optimization (multi-day jobs)
- Customer self-service portal
- Automated job estimation and pricing
- Integration with accounting systems
- Advanced analytics and reporting dashboard
- Multi-tenant architecture for white-labeling

---

## 14. Glossary

- **Contractor**: Service provider who performs flooring jobs
- **Dispatcher**: Internal user who assigns contractors to jobs
- **Job**: Work order requiring contractor assignment
- **Assignment**: Link between job and contractor with scheduled time
- **Time Slot**: Specific date/time range for job execution
- **Ranking**: Ordered list of contractors by fitness score
- **Scoring**: Algorithmic calculation of contractor suitability

---

## 15. References & Related Documents

- Frontend Requirements Document: `PRD-Frontend.md`
- Backend Requirements Document: `PRD-Backend.md`
- API Specification: `API-Specification.md`
- Database Schema: `Database-Schema.md`
- Technical Writeup: `Technical-Architecture.md`

---

**Document Control**
- **Author**: Mary, Business Analyst
- **Reviewers**: Development Team, Product Owner
- **Approval**: Pending
- **Next Review**: Post-implementation
