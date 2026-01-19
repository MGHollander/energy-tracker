-- Add is_default column to houses table
ALTER TABLE houses ADD COLUMN is_default BOOLEAN DEFAULT FALSE;