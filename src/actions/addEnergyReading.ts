'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { EnergyReadingInput } from '../types/energy'
import fs from 'fs'
import path from 'path'

export async function addEnergyReading(reading: EnergyReadingInput) {
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
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('energy_readings')
    .insert({
      user_id: user.id,
      date: reading.date,
      electricity_day: reading.electricityDay,
      electricity_night: reading.electricityNight,
      gas: reading.gas,
      house_id: reading.house_id,
    })
    .select()
    .single()

  if (error) throw error

  // Append to CSV
  const csvPath = path.join(process.cwd(), 'export', 'energy_reading.csv')
  const row = `${data.id},${data.date},${data.electricity_day},${data.electricity_night},${data.gas},${data.house_id},${data.user_id},${data.created_at},${data.updated_at}\n`

  if (!fs.existsSync(csvPath)) {
    const header = 'id,date,electricity_day,electricity_night,gas,house_id,user_id,created_at,updated_at\n'
    fs.writeFileSync(csvPath, header)
  }

  fs.appendFileSync(csvPath, row)

  return data
}