import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Not authenticated', { status: 401 })
  }

  const { data: readings, error } = await supabase
    .from('energy_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (error) {
    return new Response('Error fetching readings', { status: 500 })
  }

  const header = 'id,date,electricity_day,electricity_night,gas,user_id,created_at,updated_at\n'
  const rows = readings.map(reading =>
    `${reading.id},${reading.date},${reading.electricity_day},${reading.electricity_night},${reading.gas},${reading.user_id},${reading.created_at},${reading.updated_at}\n`
  ).join('')

  const csvContent = header + rows

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="energy_readings_all.csv"'
    }
  })
}