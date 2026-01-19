-- Migration: Add houses table and house_id to energy_readings
-- This migration adds support for multiple houses per user

-- Create houses table
CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add house_id column to energy_readings
ALTER TABLE energy_readings ADD COLUMN house_id UUID REFERENCES houses(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_houses_user_id ON houses(user_id);
CREATE INDEX idx_energy_readings_house_id ON energy_readings(house_id);
CREATE INDEX idx_energy_readings_house_date ON energy_readings(house_id, date);

-- Enable RLS on houses table
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

-- RLS policies for houses
CREATE POLICY "Users can view their own houses" ON houses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own houses" ON houses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own houses" ON houses
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own houses" ON houses
    FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for energy_readings to use house_id
-- First, drop existing policies (assuming they exist based on user_id)
DROP POLICY IF EXISTS "Users can view their own readings" ON energy_readings;
DROP POLICY IF EXISTS "Users can insert their own readings" ON energy_readings;
DROP POLICY IF EXISTS "Users can update their own readings" ON energy_readings;
DROP POLICY IF EXISTS "Users can delete their own readings" ON energy_readings;

-- New policies based on house ownership
CREATE POLICY "Users can view readings for their houses" ON energy_readings
    FOR SELECT USING (
        house_id IN (
            SELECT id FROM houses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert readings for their houses" ON energy_readings
    FOR INSERT WITH CHECK (
        house_id IN (
            SELECT id FROM houses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update readings for their houses" ON energy_readings
    FOR UPDATE USING (
        house_id IN (
            SELECT id FROM houses WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        house_id IN (
            SELECT id FROM houses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete readings for their houses" ON energy_readings
    FOR DELETE USING (
        house_id IN (
            SELECT id FROM houses WHERE user_id = auth.uid()
        )
    );

-- Migration logic for existing data
-- Create a default house for each existing user
INSERT INTO houses (user_id, name)
SELECT id, 'Default House' FROM auth.users;

-- Assign existing readings to the default house for each user
UPDATE energy_readings
SET house_id = (
    SELECT h.id
    FROM houses h
    WHERE h.user_id = energy_readings.user_id
    AND h.name = 'Default House'
    LIMIT 1
);

-- Make house_id NOT NULL after migration (optional, depending on requirements)
-- ALTER TABLE energy_readings ALTER COLUMN house_id SET NOT NULL;

-- Update trigger for updated_at on houses
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for houses table
ALTER PUBLICATION supabase_realtime ADD TABLE houses;