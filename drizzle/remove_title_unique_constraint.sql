-- Migration: Remove unique constraint on title column
-- Date: 2025-09-24
-- Reason: Allow multiple movies with same title (different years, versions, etc.)
-- Only external_id should remain unique as primary identifier

BEGIN;

-- Drop the unique index on title
DROP INDEX IF EXISTS movies_title_idx;

-- Verify the change
-- The external_id index should still exist
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'movies';

COMMIT;