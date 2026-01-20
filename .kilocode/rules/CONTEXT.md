# Energy Tracker

A Next.js application for tracking yearly electricity, gas, and water usage across multiple houses.

## Purpose

This application helps users monitor their energy consumption over time. It provides features to:
- Log electricity usage (separated into high and low tariffs)
- Log gas usage
- Log water usage
- Manage multiple houses/properties
- Set starting meter readings for initial setup
- View monthly and yearly consumption summaries per house
- View overall statistics across all houses

## Key Features

1. **House Management**: Create and manage multiple houses/properties
2. **Start Numbers Setting**: Configure initial meter readings so your first entry makes sense
3. **Monthly Logging**: Record energy readings once per month with:
   - Electricity High Tariff (kWh)
   - Electricity Low Tariff (kWh) - optional
   - Gas (m³)
   - Water (m³) - optional
4. **Monthly Overview**: See consumption breakdown for each month
5. **Yearly Overview**: View annual totals with comparisons
6. **Overall Statistics**: View aggregated usage statistics across all houses
7. **Data Persistence**: All data is stored in Supabase with user authentication

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4
- **TypeScript**: Fully typed
- **Storage**: Supabase for persistence and authentication

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page with state management
│   ├── houses/
│   │   └── [id]/
│   │       └── page.tsx # House-specific energy tracking
│   └── statistics/
│       └── page.tsx     # Overall statistics across all houses
├── components/
│   ├── EnergyInputForm.tsx      # Form for logging readings
│   ├── EnergyOverview.tsx       # Monthly/yearly summaries
│   ├── HouseForm.tsx           # Form for managing houses
│   ├── HouseList.tsx           # List of user's houses
│   └── Navigation.tsx          # Navigation component
└── types/
    └── energy.ts        # TypeScript interfaces
```

## Type Definitions (`src/types/energy.ts`)

- `House`: House/property information
- `EnergyReading`: Individual meter reading entry
- `MonthlySummary`: Aggregated monthly data
- `YearlySummary`: Aggregated yearly data with monthly breakdown

## Usage

1. **Manage Houses**: Create houses/properties to track energy usage separately
2. **Set Start Numbers**: Click "Edit" on the Start Numbers card to configure your initial meter readings
3. **Log Usage**: Fill out the form with the current date and meter values
4. **View Overview**: Scroll down to see monthly breakdowns and yearly summaries
5. **View Statistics**: Navigate to the Statistics page to see overall usage across all houses

## Data Model

### House
- `id`: Unique identifier
- `user_id`: User ID from Supabase
- `name`: House name/description
- `is_default`: Whether this is the user's default house
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Energy Reading
- `id`: Unique identifier
- `date`: ISO date string (YYYY-MM-DD)
- `electricityHigh`: Electricity usage during high tariff (kWh)
- `electricityLow`: Electricity usage during low tariff (kWh) - optional
- `gas`: Gas usage (m³)
- `water`: Water usage (m³) - optional
- `user_id`: User ID from Supabase
- `house_id`: Associated house ID
- `created_at`: Created timestamp
- `updated_at`: Updated timestamp

## Important Notes

- Data is stored in Supabase and persists across sessions for authenticated users
- The application uses cumulative readings (not delta/usage per period)
- Users can track multiple houses separately
- Electricity usage during low tariff is optional and can be left empty
- Water tracking is optional and can be left empty
- Update the content in `.kilocode/rules/CONTEXT.md` if changes affect the content of the file.
- Supabase is NOT installed globally. It is accessible locally via `pnpm supabase`
- Always create a migration, using `pnpm supabase migration add` when you make changes to the database scheme. Then use the Supabase MCP to update the database scheme in the Supabase development environment.
