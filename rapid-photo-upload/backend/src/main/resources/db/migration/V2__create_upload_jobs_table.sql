-- Migration: Create upload_jobs table
-- Version: 2
-- Description: Creates upload_jobs table for batch upload tracking

CREATE TABLE upload_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    total_photos INTEGER NOT NULL,
    completed_photos INTEGER NOT NULL DEFAULT 0,
    failed_photos INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT upload_jobs_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT upload_jobs_total_photos_positive CHECK (total_photos > 0 AND total_photos <= 100),
    CONSTRAINT upload_jobs_completed_photos_positive CHECK (completed_photos >= 0),
    CONSTRAINT upload_jobs_failed_photos_positive CHECK (failed_photos >= 0),
    CONSTRAINT upload_jobs_status_valid CHECK (status IN ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_FAILED', 'FAILED'))
);

-- Indexes for upload_jobs table
CREATE INDEX idx_upload_jobs_user_id ON upload_jobs(user_id);
CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);
CREATE INDEX idx_upload_jobs_created_at ON upload_jobs(created_at DESC);
CREATE INDEX idx_upload_jobs_user_status ON upload_jobs(user_id, status);

-- Comments for documentation
COMMENT ON TABLE upload_jobs IS 'Batch upload job tracking';
COMMENT ON COLUMN upload_jobs.id IS 'Unique job identifier (UUID)';
COMMENT ON COLUMN upload_jobs.user_id IS 'User who created the job';
COMMENT ON COLUMN upload_jobs.total_photos IS 'Total number of photos in the job (1-100)';
COMMENT ON COLUMN upload_jobs.completed_photos IS 'Number of successfully completed photos';
COMMENT ON COLUMN upload_jobs.failed_photos IS 'Number of failed photos';
COMMENT ON COLUMN upload_jobs.status IS 'Current job status';
COMMENT ON COLUMN upload_jobs.created_at IS 'Job creation timestamp';
COMMENT ON COLUMN upload_jobs.completed_at IS 'Job completion timestamp (null if not completed)';

