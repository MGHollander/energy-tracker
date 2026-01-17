# Energy Tracker

A Next.js application for tracking yearly electricity and gas usage.

## Purpose

This application helps users monitor their energy consumption over time. It provides features to:
- Log electricity usage (separated into day and night tariffs)
- Log gas usage
- Set starting meter readings for initial setup
- View monthly and yearly consumption summaries

## Key Features

1. **Start Numbers Setting**: Configure initial meter readings so your first entry makes sense
2. **Monthly Logging**: Record energy readings once per month with:
   - Electricity Day (kWh)
   - Electricity Night (kWh)
   - Gas (m³)
3. **Monthly Overview**: See consumption breakdown for each month
4. **Yearly Overview**: View annual totals with comparisons
5. **Data Persistence**: All data is stored in Supabase with user authentication

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
│   └── page.tsx         # Main page with state management
├── components/
│   ├── EnergyInputForm.tsx      # Form for logging readings
│   ├── EnergyOverview.tsx       # Monthly/yearly summaries
└── types/
    └── energy.ts        # TypeScript interfaces
```

## Type Definitions (`src/types/energy.ts`)

- `EnergyReading`: Individual meter reading entry
- `MonthlySummary`: Aggregated monthly data
- `YearlySummary`: Aggregated yearly data with monthly breakdown

## Usage

1. **Set Start Numbers**: Click "Edit" on the Start Numbers card to configure your initial meter readings
2. **Log Usage**: Fill out the form with the current date and meter values
3. **View Overview**: Scroll down to see monthly breakdowns and yearly summaries

## Data Model

### Energy Reading
- `id`: Unique identifier (date-timestamp)
- `date`: ISO date string (YYYY-MM-DD)
- `electricityDay`: Day electricity reading (kWh)
- `electricityNight`: Night electricity reading (kWh)
- `gas`: Gas reading (m³)

## Important Notes

- Data is stored in Supabase and persists across sessions for authenticated users
- The application uses cumulative readings (not delta/usage per period)
