import fs from 'fs'
import path from 'path'

export async function GET() {
  const csvPath = path.join(process.cwd(), 'export', 'energy_reading.csv')

  if (!fs.existsSync(csvPath)) {
    return new Response('Export file does not exist', { status: 404 })
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="energy_readings_current.csv"'
    }
  })
}