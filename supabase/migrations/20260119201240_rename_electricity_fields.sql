-- Rename electricity_day to electricity_high and electricity_night to electricity_low
ALTER TABLE energy_readings RENAME COLUMN electricity_day TO electricity_high;
ALTER TABLE energy_readings RENAME COLUMN electricity_night TO electricity_low;