-- Create energy_readings table
CREATE TABLE energy_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    electricity_day DECIMAL(10,2),
    electricity_night DECIMAL(10,2),
    gas DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_energy_readings_user_date ON energy_readings(user_id, date);

-- Enable Row Level Security
ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for energy_readings table
CREATE POLICY "Users can view own readings" ON energy_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readings" ON energy_readings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own readings" ON energy_readings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own readings" ON energy_readings FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on energy_readings table
CREATE TRIGGER set_updated_at_energy_readings
    BEFORE UPDATE ON energy_readings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable realtime for energy_readings table
ALTER PUBLICATION supabase_realtime ADD TABLE energy_readings;