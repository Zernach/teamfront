# SmartScheduler - Database Schema Document

**Version:** 1.0
**Date:** 2025-11-08
**Database:** PostgreSQL 15+
**ORM:** Entity Framework Core 8.0
**Related Documents:** PRD-Master.md, PRD-Backend.md, API-Specification.md

---

## Table of Contents
1. [Overview](#1-overview)
2. [Database Configuration](#2-database-configuration)
3. [Schema Design](#3-schema-design)
4. [Table Specifications](#4-table-specifications)
5. [Indexes](#5-indexes)
6. [Constraints](#6-constraints)
7. [Views](#7-views)
8. [Functions & Stored Procedures](#8-functions--stored-procedures)
9. [Migration Strategy](#9-migration-strategy)
10. [Performance Optimization](#10-performance-optimization)
11. [Backup & Recovery](#11-backup--recovery)

---

## 1. Overview

### 1.1 Database Architecture
- **Database Type**: Relational (PostgreSQL)
- **Naming Convention**: snake_case for all database objects
- **Schema**: Single schema (`public`)
- **Character Set**: UTF-8
- **Collation**: en_US.UTF-8
- **Timezone**: UTC

### 1.2 Design Principles
- Normalized to 3NF (Third Normal Form)
- Value objects stored as owned entities
- Soft deletes for critical entities
- Audit columns on all tables (created_at, updated_at)
- GUID primary keys for distributed system compatibility
- Optimistic concurrency control via row versioning

---

## 2. Database Configuration

### 2.1 Connection String

**Development:**
```
Host=localhost;Port=5432;Database=smartscheduler_dev;Username=dev_user;Password=dev_password;Include Error Detail=true
```

**Production:**
```
Host=prod-db.amazonaws.com;Port=5432;Database=smartscheduler;Username=app_user;Password={encrypted};Pooling=true;Minimum Pool Size=5;Maximum Pool Size=20;Connection Lifetime=300
```

### 2.2 PostgreSQL Extensions

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for spatial data (location coordinates)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 2.3 Database Parameters

```sql
-- Performance tuning
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET maintenance_work_mem = '64MB';
SET checkpoint_completion_target = 0.9;
SET wal_buffers = '16MB';
SET default_statistics_target = 100;
SET random_page_cost = 1.1;
SET effective_io_concurrency = 200;
SET work_mem = '4MB';
SET min_wal_size = '1GB';
SET max_wal_size = '4GB';
```

---

## 3. Schema Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONTRACTORS                             │
│─────────────────────────────────────────────────────────────────│
│ PK │ id (uuid)                                                  │
│    │ name (varchar)                                             │
│    │ type (int)                                                 │
│    │ rating (decimal)                                           │
│    │ status (int)                                               │
│    │ phone_number (varchar)                                     │
│    │ email (varchar) UNIQUE                                     │
│    │ base_location_latitude (decimal)                           │
│    │ base_location_longitude (decimal)                          │
│    │ base_location_address (varchar)                            │
│    │ base_location_city (varchar)                               │
│    │ base_location_state (varchar)                              │
│    │ base_location_zip_code (varchar)                           │
│    │ skills (jsonb)                                             │
│    │ created_at (timestamp)                                     │
│    │ updated_at (timestamp)                                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ 1:N
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONTRACTOR_WORKING_HOURS                       │
│─────────────────────────────────────────────────────────────────│
│ PK │ id (int)                                                   │
│ FK │ contractor_id (uuid)                                       │
│    │ day_of_week (int)                                          │
│    │ start_time (time)                                          │
│    │ end_time (time)                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                            JOBS                                 │
│─────────────────────────────────────────────────────────────────│
│ PK │ id (uuid)                                                  │
│    │ job_number (varchar) UNIQUE                                │
│    │ type (int)                                                 │
│    │ status (int)                                               │
│    │ desired_date (timestamp)                                   │
│    │ duration (interval)                                        │
│    │ priority (int)                                             │
│    │ location_latitude (decimal)                                │
│    │ location_longitude (decimal)                               │
│    │ location_address (varchar)                                 │
│    │ location_city (varchar)                                    │
│    │ location_state (varchar)                                   │
│    │ location_zip_code (varchar)                                │
│    │ special_requirements (jsonb)                               │
│ FK │ assigned_contractor_id (uuid) NULL                         │
│    │ created_at (timestamp)                                     │
│    │ updated_at (timestamp)                                     │
└─────────────────────────────────────────────────────────────────┘
         │                                │
         │ 1:1                            │ N:1
         ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ASSIGNMENTS                              │
│─────────────────────────────────────────────────────────────────│
│ PK │ id (uuid)                                                  │
│ FK │ job_id (uuid)                                              │
│ FK │ contractor_id (uuid)                                       │
│    │ status (int)                                               │
│    │ score (decimal)                                            │
│    │ scheduled_start_time (timestamp)                           │
│    │ scheduled_end_time (timestamp)                             │
│    │ scheduled_duration (interval)                              │
│    │ score_availability_score (decimal)                         │
│    │ score_rating_score (decimal)                               │
│    │ score_distance_score (decimal)                             │
│    │ score_availability_weight (decimal)                        │
│    │ score_rating_weight (decimal)                              │
│    │ score_distance_weight (decimal)                            │
│    │ score_explanation (text) NULL                              │
│    │ confirmed_at (timestamp) NULL                              │
│    │ started_at (timestamp) NULL                                │
│    │ completed_at (timestamp) NULL                              │
│    │ cancellation_reason (text) NULL                            │
│    │ created_at (timestamp)                                     │
│    │ updated_at (timestamp)                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Table Specifications

### 4.1 Contractors Table

```sql
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type INT NOT NULL,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    status INT NOT NULL DEFAULT 1,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,

    -- Base Location (Value Object - Owned Entity)
    base_location_latitude DECIMAL(10,7) NOT NULL,
    base_location_longitude DECIMAL(10,7) NOT NULL,
    base_location_address VARCHAR(255) NOT NULL,
    base_location_city VARCHAR(100) NOT NULL,
    base_location_state VARCHAR(2) NOT NULL,
    base_location_zip_code VARCHAR(10) NOT NULL,

    -- Skills stored as JSON array
    skills JSONB DEFAULT '[]'::jsonb,

    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_contractor_name_length CHECK (LENGTH(name) >= 2),
    CONSTRAINT chk_contractor_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_latitude CHECK (base_location_latitude >= -90 AND base_location_latitude <= 90),
    CONSTRAINT chk_longitude CHECK (base_location_longitude >= -180 AND base_location_longitude <= 180)
);

-- Indexes
CREATE INDEX idx_contractors_type ON contractors(type);
CREATE INDEX idx_contractors_status ON contractors(status);
CREATE INDEX idx_contractors_rating ON contractors(rating DESC);
CREATE INDEX idx_contractors_email ON contractors(email);
CREATE INDEX idx_contractors_location ON contractors USING GIST (
    ST_MakePoint(base_location_longitude, base_location_latitude)
);

-- Full-text search index
CREATE INDEX idx_contractors_name_trgm ON contractors USING GIN (name gin_trgm_ops);

-- Comments
COMMENT ON TABLE contractors IS 'Stores contractor profiles and their base information';
COMMENT ON COLUMN contractors.type IS '1=Flooring, 2=Tile, 3=Carpet, 4=Multi';
COMMENT ON COLUMN contractors.status IS '1=Active, 2=Inactive, 3=OnLeave';
COMMENT ON COLUMN contractors.rating IS 'Average rating from 0.00 to 5.00';
COMMENT ON COLUMN contractors.skills IS 'JSON array of skill names';
```

### 4.2 Contractor Working Hours Table

```sql
CREATE TABLE contractor_working_hours (
    id SERIAL PRIMARY KEY,
    contractor_id UUID NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Foreign key
    CONSTRAINT fk_working_hours_contractor
        FOREIGN KEY (contractor_id)
        REFERENCES contractors(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_working_hours_time_order CHECK (end_time > start_time),
    CONSTRAINT chk_working_hours_max_duration CHECK (
        (end_time - start_time) <= INTERVAL '16 hours'
    ),

    -- Prevent duplicate entries for same contractor + day
    CONSTRAINT uq_contractor_day UNIQUE (contractor_id, day_of_week)
);

-- Indexes
CREATE INDEX idx_working_hours_contractor ON contractor_working_hours(contractor_id);
CREATE INDEX idx_working_hours_day ON contractor_working_hours(day_of_week);

-- Comments
COMMENT ON TABLE contractor_working_hours IS 'Defines contractor availability by day of week';
COMMENT ON COLUMN contractor_working_hours.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
```

### 4.3 Jobs Table

```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(50) NOT NULL UNIQUE,
    type INT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    desired_date TIMESTAMP NOT NULL,
    duration INTERVAL NOT NULL,
    priority INT NOT NULL DEFAULT 2,

    -- Location (Value Object - Owned Entity)
    location_latitude DECIMAL(10,7) NOT NULL,
    location_longitude DECIMAL(10,7) NOT NULL,
    location_address VARCHAR(255) NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(2) NOT NULL,
    location_zip_code VARCHAR(10) NOT NULL,

    -- Special requirements stored as JSON array
    special_requirements JSONB DEFAULT '[]'::jsonb,

    -- Assignment reference
    assigned_contractor_id UUID NULL,

    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_jobs_contractor
        FOREIGN KEY (assigned_contractor_id)
        REFERENCES contractors(id)
        ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT chk_job_desired_date_future CHECK (desired_date >= created_at),
    CONSTRAINT chk_job_duration CHECK (
        duration >= INTERVAL '30 minutes' AND
        duration <= INTERVAL '8 hours'
    ),
    CONSTRAINT chk_latitude CHECK (location_latitude >= -90 AND location_latitude <= 90),
    CONSTRAINT chk_longitude CHECK (location_longitude >= -180 AND location_longitude <= 180)
);

-- Indexes
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_desired_date ON jobs(desired_date);
CREATE INDEX idx_jobs_priority ON jobs(priority);
CREATE INDEX idx_jobs_contractor ON jobs(assigned_contractor_id);
CREATE UNIQUE INDEX idx_jobs_number ON jobs(job_number);
CREATE INDEX idx_jobs_location ON jobs USING GIST (
    ST_MakePoint(location_longitude, location_latitude)
);

-- Composite index for common queries
CREATE INDEX idx_jobs_status_type_date ON jobs(status, type, desired_date);

-- Comments
COMMENT ON TABLE jobs IS 'Stores job requests and their details';
COMMENT ON COLUMN jobs.type IS '1=Flooring, 2=Tile, 3=Carpet';
COMMENT ON COLUMN jobs.status IS '1=Open, 2=Assigned, 3=InProgress, 4=Completed, 5=Cancelled';
COMMENT ON COLUMN jobs.priority IS '1=Low, 2=Medium, 3=High, 4=Urgent';
COMMENT ON COLUMN jobs.job_number IS 'Unique job identifier (e.g., JOB-20251108-ABC123)';
```

### 4.4 Assignments Table

```sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL,
    contractor_id UUID NOT NULL,
    status INT NOT NULL DEFAULT 1,
    score DECIMAL(5,4) NOT NULL CHECK (score >= 0 AND score <= 1),

    -- Scheduled Time Slot (Value Object)
    scheduled_start_time TIMESTAMP NOT NULL,
    scheduled_end_time TIMESTAMP NOT NULL,
    scheduled_duration INTERVAL NOT NULL,

    -- Score Breakdown (Value Object - Owned Entity)
    score_availability_score DECIMAL(5,4) NOT NULL,
    score_rating_score DECIMAL(5,4) NOT NULL,
    score_distance_score DECIMAL(5,4) NOT NULL,
    score_availability_weight DECIMAL(3,2) NOT NULL,
    score_rating_weight DECIMAL(3,2) NOT NULL,
    score_distance_weight DECIMAL(3,2) NOT NULL,
    score_explanation TEXT NULL,

    -- Status timestamps
    confirmed_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,

    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_assignments_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignments_contractor
        FOREIGN KEY (contractor_id)
        REFERENCES contractors(id)
        ON DELETE RESTRICT,

    -- Constraints
    CONSTRAINT chk_assignment_time_slot CHECK (scheduled_end_time > scheduled_start_time),
    CONSTRAINT chk_assignment_scores CHECK (
        score_availability_score >= 0 AND score_availability_score <= 1 AND
        score_rating_score >= 0 AND score_rating_score <= 1 AND
        score_distance_score >= 0 AND score_distance_score <= 1
    ),
    CONSTRAINT chk_assignment_weights CHECK (
        score_availability_weight >= 0 AND score_availability_weight <= 1 AND
        score_rating_weight >= 0 AND score_rating_weight <= 1 AND
        score_distance_weight >= 0 AND score_distance_weight <= 1
    ),

    -- One assignment per job
    CONSTRAINT uq_assignment_job UNIQUE (job_id)
);

-- Indexes
CREATE INDEX idx_assignments_job ON assignments(job_id);
CREATE INDEX idx_assignments_contractor ON assignments(contractor_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_score ON assignments(score DESC);
CREATE INDEX idx_assignments_scheduled_start ON assignments(scheduled_start_time);

-- Composite index for contractor schedule queries
CREATE INDEX idx_assignments_contractor_date ON assignments(
    contractor_id,
    scheduled_start_time,
    scheduled_end_time
) WHERE status NOT IN (5); -- Exclude cancelled assignments

-- Comments
COMMENT ON TABLE assignments IS 'Links jobs to contractors with scheduling details and scoring';
COMMENT ON COLUMN assignments.status IS '1=Pending, 2=Confirmed, 3=InProgress, 4=Completed, 5=Cancelled';
COMMENT ON COLUMN assignments.score IS 'Overall weighted score (0.0000 to 1.0000)';
```

### 4.5 Users Table (Authentication)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role INT NOT NULL,
    status INT NOT NULL DEFAULT 1,

    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Comments
COMMENT ON TABLE users IS 'Application users (dispatchers, managers, admins)';
COMMENT ON COLUMN users.role IS '1=Dispatcher, 2=Manager, 3=Admin';
COMMENT ON COLUMN users.status IS '1=Active, 2=Inactive, 3=Locked';
```

### 4.6 Audit Log Table (Optional but Recommended)

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    user_id UUID NULL,
    changes JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address INET NULL
);

-- Indexes
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- Comments
COMMENT ON TABLE audit_logs IS 'Tracks all data modifications for compliance and debugging';
COMMENT ON COLUMN audit_logs.action IS 'INSERT, UPDATE, DELETE';
```

---

## 5. Indexes

### 5.1 Primary Key Indexes
All tables have clustered primary key indexes on `id` column (UUID).

### 5.2 Foreign Key Indexes
```sql
-- Contractor working hours
CREATE INDEX idx_working_hours_contractor ON contractor_working_hours(contractor_id);

-- Jobs
CREATE INDEX idx_jobs_contractor ON jobs(assigned_contractor_id);

-- Assignments
CREATE INDEX idx_assignments_job ON assignments(job_id);
CREATE INDEX idx_assignments_contractor ON assignments(contractor_id);
```

### 5.3 Query Optimization Indexes

**Contractor Search and Filtering:**
```sql
CREATE INDEX idx_contractors_type ON contractors(type);
CREATE INDEX idx_contractors_status ON contractors(status);
CREATE INDEX idx_contractors_rating ON contractors(rating DESC);
CREATE INDEX idx_contractors_name_trgm ON contractors USING GIN (name gin_trgm_ops);
```

**Job Search and Filtering:**
```sql
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_desired_date ON jobs(desired_date);
CREATE INDEX idx_jobs_status_type_date ON jobs(status, type, desired_date);
```

**Spatial Indexes (Proximity Search):**
```sql
CREATE INDEX idx_contractors_location ON contractors USING GIST (
    ST_MakePoint(base_location_longitude, base_location_latitude)
);

CREATE INDEX idx_jobs_location ON jobs USING GIST (
    ST_MakePoint(location_longitude, location_latitude)
);
```

**Assignment Scheduling Queries:**
```sql
CREATE INDEX idx_assignments_contractor_date ON assignments(
    contractor_id,
    scheduled_start_time,
    scheduled_end_time
) WHERE status NOT IN (5); -- Partial index excluding cancelled
```

### 5.4 Index Maintenance

```sql
-- Rebuild indexes monthly (during maintenance window)
REINDEX TABLE contractors;
REINDEX TABLE jobs;
REINDEX TABLE assignments;

-- Analyze tables for query planner optimization
ANALYZE contractors;
ANALYZE jobs;
ANALYZE assignments;
```

---

## 6. Constraints

### 6.1 Primary Keys
All tables use UUID primary keys for global uniqueness and distributed system compatibility.

### 6.2 Foreign Keys

```sql
-- Contractor working hours → Contractors
ALTER TABLE contractor_working_hours
ADD CONSTRAINT fk_working_hours_contractor
FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE;

-- Jobs → Contractors (optional reference)
ALTER TABLE jobs
ADD CONSTRAINT fk_jobs_contractor
FOREIGN KEY (assigned_contractor_id) REFERENCES contractors(id) ON DELETE SET NULL;

-- Assignments → Jobs
ALTER TABLE assignments
ADD CONSTRAINT fk_assignments_job
FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

-- Assignments → Contractors
ALTER TABLE assignments
ADD CONSTRAINT fk_assignments_contractor
FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE RESTRICT;
```

### 6.3 Unique Constraints

```sql
-- Contractors: unique email
ALTER TABLE contractors ADD CONSTRAINT uq_contractors_email UNIQUE (email);

-- Jobs: unique job number
ALTER TABLE jobs ADD CONSTRAINT uq_jobs_number UNIQUE (job_number);

-- Assignments: one assignment per job
ALTER TABLE assignments ADD CONSTRAINT uq_assignment_job UNIQUE (job_id);

-- Working hours: one entry per contractor per day
ALTER TABLE contractor_working_hours
ADD CONSTRAINT uq_contractor_day UNIQUE (contractor_id, day_of_week);

-- Users: unique email
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
```

### 6.4 Check Constraints

**Contractors:**
```sql
ALTER TABLE contractors ADD CONSTRAINT chk_contractor_rating
    CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE contractors ADD CONSTRAINT chk_contractor_name_length
    CHECK (LENGTH(name) >= 2);
ALTER TABLE contractors ADD CONSTRAINT chk_latitude
    CHECK (base_location_latitude >= -90 AND base_location_latitude <= 90);
ALTER TABLE contractors ADD CONSTRAINT chk_longitude
    CHECK (base_location_longitude >= -180 AND base_location_longitude <= 180);
```

**Working Hours:**
```sql
ALTER TABLE contractor_working_hours ADD CONSTRAINT chk_day_of_week
    CHECK (day_of_week >= 0 AND day_of_week <= 6);
ALTER TABLE contractor_working_hours ADD CONSTRAINT chk_time_order
    CHECK (end_time > start_time);
ALTER TABLE contractor_working_hours ADD CONSTRAINT chk_max_duration
    CHECK ((end_time - start_time) <= INTERVAL '16 hours');
```

**Jobs:**
```sql
ALTER TABLE jobs ADD CONSTRAINT chk_job_duration
    CHECK (duration >= INTERVAL '30 minutes' AND duration <= INTERVAL '8 hours');
```

**Assignments:**
```sql
ALTER TABLE assignments ADD CONSTRAINT chk_assignment_score
    CHECK (score >= 0 AND score <= 1);
ALTER TABLE assignments ADD CONSTRAINT chk_assignment_time_slot
    CHECK (scheduled_end_time > scheduled_start_time);
```

---

## 7. Views

### 7.1 Active Contractors View

```sql
CREATE OR REPLACE VIEW v_active_contractors AS
SELECT
    c.id,
    c.name,
    c.type,
    c.rating,
    c.base_location_city AS city,
    c.base_location_state AS state,
    c.phone_number,
    c.email,
    COUNT(a.id) FILTER (WHERE a.status IN (2, 3)) AS active_assignments,
    AVG(a.score) AS avg_assignment_score
FROM contractors c
LEFT JOIN assignments a ON c.id = a.contractor_id
WHERE c.status = 1
GROUP BY c.id;

COMMENT ON VIEW v_active_contractors IS 'Active contractors with assignment statistics';
```

### 7.2 Open Jobs View

```sql
CREATE OR REPLACE VIEW v_open_jobs AS
SELECT
    j.id,
    j.job_number,
    j.type,
    j.desired_date,
    j.location_city,
    j.location_state,
    j.priority,
    EXTRACT(EPOCH FROM (j.desired_date - CURRENT_TIMESTAMP)) / 3600 AS hours_until_desired_date
FROM jobs j
WHERE j.status = 1 -- Open
  AND j.desired_date >= CURRENT_TIMESTAMP
ORDER BY j.priority DESC, j.desired_date ASC;

COMMENT ON VIEW v_open_jobs IS 'Open jobs ordered by priority and desired date';
```

### 7.3 Contractor Schedule View

```sql
CREATE OR REPLACE VIEW v_contractor_schedules AS
SELECT
    c.id AS contractor_id,
    c.name AS contractor_name,
    a.scheduled_start_time,
    a.scheduled_end_time,
    a.status AS assignment_status,
    j.job_number,
    j.location_address,
    j.location_city
FROM contractors c
JOIN assignments a ON c.id = a.contractor_id
JOIN jobs j ON a.job_id = j.id
WHERE a.status IN (2, 3) -- Confirmed or InProgress
  AND a.scheduled_start_time >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND a.scheduled_start_time <= CURRENT_TIMESTAMP + INTERVAL '30 days'
ORDER BY c.name, a.scheduled_start_time;

COMMENT ON VIEW v_contractor_schedules IS 'Contractor schedules for next 30 days';
```

---

## 8. Functions & Stored Procedures

### 8.1 Calculate Distance Function

```sql
CREATE OR REPLACE FUNCTION calculate_distance_miles(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius_miles CONSTANT DECIMAL := 3959;
    delta_lat DECIMAL;
    delta_lon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    delta_lat := RADIANS(lat2 - lat1);
    delta_lon := RADIANS(lon2 - lon1);

    a := SIN(delta_lat / 2) * SIN(delta_lat / 2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(delta_lon / 2) * SIN(delta_lon / 2);

    c := 2 * ATAN2(SQRT(a), SQRT(1 - a));

    RETURN earth_radius_miles * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_distance_miles IS 'Calculates distance between two lat/lon points using Haversine formula';
```

### 8.2 Check Contractor Availability Function

```sql
CREATE OR REPLACE FUNCTION is_contractor_available(
    p_contractor_id UUID,
    p_start_time TIMESTAMP,
    p_end_time TIMESTAMP
) RETURNS BOOLEAN AS $$
DECLARE
    overlap_count INT;
    day_of_week INT;
    working_hours_count INT;
BEGIN
    -- Check if contractor has working hours for this day
    day_of_week := EXTRACT(DOW FROM p_start_time);

    SELECT COUNT(*) INTO working_hours_count
    FROM contractor_working_hours
    WHERE contractor_id = p_contractor_id
      AND day_of_week = day_of_week
      AND p_start_time::TIME >= start_time
      AND p_end_time::TIME <= end_time;

    IF working_hours_count = 0 THEN
        RETURN FALSE;
    END IF;

    -- Check for overlapping assignments
    SELECT COUNT(*) INTO overlap_count
    FROM assignments
    WHERE contractor_id = p_contractor_id
      AND status IN (2, 3) -- Confirmed or InProgress
      AND (
          (scheduled_start_time <= p_start_time AND scheduled_end_time > p_start_time)
          OR
          (scheduled_start_time < p_end_time AND scheduled_end_time >= p_end_time)
          OR
          (scheduled_start_time >= p_start_time AND scheduled_end_time <= p_end_time)
      );

    RETURN overlap_count = 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_contractor_available IS 'Checks if contractor is available for a given time slot';
```

### 8.3 Update Rating Function

```sql
CREATE OR REPLACE FUNCTION update_contractor_rating(
    p_contractor_id UUID,
    p_job_rating DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    current_rating DECIMAL;
    completed_jobs INT;
    new_rating DECIMAL;
BEGIN
    -- Get current rating and completed job count
    SELECT rating INTO current_rating
    FROM contractors
    WHERE id = p_contractor_id;

    SELECT COUNT(*) INTO completed_jobs
    FROM assignments
    WHERE contractor_id = p_contractor_id
      AND status = 4; -- Completed

    -- Calculate new rating (weighted average)
    IF completed_jobs = 0 THEN
        new_rating := p_job_rating;
    ELSE
        new_rating := ((current_rating * completed_jobs) + p_job_rating) / (completed_jobs + 1);
    END IF;

    -- Update contractor rating
    UPDATE contractors
    SET rating = new_rating,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_contractor_id;

    RETURN new_rating;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_contractor_rating IS 'Updates contractor rating based on new job completion';
```

### 8.4 Auto-Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER trg_contractors_updated_at
    BEFORE UPDATE ON contractors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 9. Migration Strategy

### 9.1 EF Core Migrations

**Initial Migration:**
```bash
dotnet ef migrations add InitialCreate --project SmartScheduler.Infrastructure --startup-project SmartScheduler.API

dotnet ef database update --project SmartScheduler.Infrastructure --startup-project SmartScheduler.API
```

**Adding New Migration:**
```bash
dotnet ef migrations add AddAuditLogs --project SmartScheduler.Infrastructure --startup-project SmartScheduler.API
```

### 9.2 Migration Best Practices

1. **Version Control**: All migrations committed to source control
2. **Idempotent Scripts**: Migrations can be run multiple times safely
3. **Rollback Strategy**: Each migration has a `Down()` method for rollback
4. **Data Migrations**: Separate data migrations from schema migrations
5. **Testing**: Test migrations on staging before production

### 9.3 Seed Data

```csharp
public class ApplicationDbContextSeed
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Seed users
        if (!context.Users.Any())
        {
            context.Users.AddRange(
                new User { Email = "dispatcher@example.com", Role = UserRole.Dispatcher },
                new User { Email = "manager@example.com", Role = UserRole.Manager },
                new User { Email = "admin@example.com", Role = UserRole.Admin }
            );
        }

        // Seed contractors (for development/testing)
        if (!context.Contractors.Any())
        {
            // Add sample contractors
        }

        await context.SaveChangesAsync();
    }
}
```

---

## 10. Performance Optimization

### 10.1 Query Optimization

**Use Covering Indexes:**
```sql
-- Index covers all columns needed for contractor search
CREATE INDEX idx_contractors_search ON contractors(
    type, status, rating DESC
) INCLUDE (name, email, phone_number);
```

**Materialized Views for Reports:**
```sql
CREATE MATERIALIZED VIEW mv_contractor_statistics AS
SELECT
    c.id,
    c.name,
    c.type,
    c.rating,
    COUNT(a.id) AS total_assignments,
    COUNT(a.id) FILTER (WHERE a.status = 4) AS completed_assignments,
    AVG(a.score) AS avg_score,
    MAX(a.completed_at) AS last_job_date
FROM contractors c
LEFT JOIN assignments a ON c.id = a.contractor_id
GROUP BY c.id;

-- Refresh materialized view (run nightly)
REFRESH MATERIALIZED VIEW mv_contractor_statistics;
```

**Partitioning Large Tables:**
```sql
-- Partition assignments by year (if table grows very large)
CREATE TABLE assignments_2025 PARTITION OF assignments
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE assignments_2026 PARTITION OF assignments
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### 10.2 Connection Pooling

**Application Configuration:**
```csharp
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);

        npgsqlOptions.CommandTimeout(30);
        npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory");
    });

    // Enable query splitting for large result sets
    options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
});
```

### 10.3 Caching Strategy

**Redis Cache for Frequent Queries:**
- Contractor list (5 minute TTL)
- Job recommendations (2 minute TTL)
- Contractor availability (1 minute TTL)

---

## 11. Backup & Recovery

### 11.1 Backup Strategy

**Daily Full Backups:**
```bash
pg_dump -h localhost -U postgres -F c -b -v -f backup_$(date +%Y%m%d).dump smartscheduler
```

**Hourly Transaction Log Archiving:**
```sql
-- Enable WAL archiving in postgresql.conf
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
wal_level = replica
```

**AWS RDS Automated Backups:**
- Retention: 7 days
- Backup window: 03:00-04:00 UTC
- Point-in-time recovery enabled

### 11.2 Restore Procedure

**Full Restore:**
```bash
pg_restore -h localhost -U postgres -d smartscheduler -v backup_20251108.dump
```

**Point-in-Time Recovery:**
```sql
-- Using WAL files to restore to specific timestamp
pg_restore --target-time '2025-11-08 15:30:00'
```

---

## Appendix A: Sample Queries

### A.1 Find Available Contractors for Job

```sql
WITH eligible_contractors AS (
    SELECT c.*
    FROM contractors c
    WHERE c.type IN (
        CASE
            WHEN :job_type = 1 THEN ARRAY[1, 4] -- Flooring or Multi
            WHEN :job_type = 2 THEN ARRAY[2, 4] -- Tile or Multi
            WHEN :job_type = 3 THEN ARRAY[3, 4] -- Carpet or Multi
        END
    )
    AND c.status = 1 -- Active
),
contractor_distances AS (
    SELECT
        ec.*,
        calculate_distance_miles(
            ec.base_location_latitude,
            ec.base_location_longitude,
            :job_latitude,
            :job_longitude
        ) AS distance
    FROM eligible_contractors ec
),
available_contractors AS (
    SELECT cd.*
    FROM contractor_distances cd
    WHERE is_contractor_available(
        cd.id,
        :desired_start_time,
        :desired_end_time
    ) = TRUE
)
SELECT * FROM available_contractors
ORDER BY distance ASC;
```

### A.2 Contractor Schedule for Date Range

```sql
SELECT
    c.name AS contractor_name,
    DATE(a.scheduled_start_time) AS date,
    a.scheduled_start_time,
    a.scheduled_end_time,
    j.job_number,
    j.location_address
FROM assignments a
JOIN contractors c ON a.contractor_id = c.id
JOIN jobs j ON a.job_id = j.id
WHERE c.id = :contractor_id
  AND a.scheduled_start_time >= :start_date
  AND a.scheduled_end_time <= :end_date
  AND a.status IN (2, 3) -- Confirmed or InProgress
ORDER BY a.scheduled_start_time;
```

---

**Document Control**
- **Version**: 1.0
- **Author**: Mary, Business Analyst
- **Date**: 2025-11-08
- **Status**: Draft
