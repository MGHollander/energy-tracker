'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

export async function exportAllReadingsOverwrite() {
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

  const { data: readings, error } = await supabase
    .from('energy_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (error) throw error

  const csvPath = path.join(process.cwd(), 'export', 'energy_reading.csv')
  const header = 'id,date,electricity_day,electricity_night,gas,user_id,created_at,updated_at\n'
  const rows = readings.map(reading =>
    `${reading.id},${reading.date},${reading.electricity_day},${reading.electricity_night},${reading.gas},${reading.user_id},${reading.created_at},${reading.updated_at}\n`
  ).join('')

  fs.writeFileSync(csvPath, header + rows)

  return { success: true }
}

export async function exportAllReadingsDownload() {
  console.log('Starting exportAllReadingsDownload')
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

  console.log('Created supabase client')
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Got user:', user ? 'authenticated' : 'not authenticated')
  if (!user) throw new Error('Not authenticated')

  console.log('Fetching readings')
  const { data: readings, error } = await supabase
    .from('energy_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching readings:', error)
    throw error
  }
  console.log('Fetched readings:', readings.length)

  const header = 'id,date,electricity_day,electricity_night,gas,user_id,created_at,updated_at\n'
  const rows = readings.map(reading =>
    `${reading.id},${reading.date},${reading.electricity_day},${reading.electricity_night},${reading.gas},${reading.user_id},${reading.created_at},${reading.updated_at}\n`
  ).join('')

  const csvContent = header + rows
  console.log('Generated CSV content length:', csvContent.length)

  console.log('Returning Response')
  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="energy_readings_all.csv"'
    }
  })
}

export async function downloadCurrentExport() {
  console.log('Starting downloadCurrentExport')
  const csvPath = path.join(process.cwd(), 'export', 'energy_reading.csv')
  console.log('CSV path:', csvPath)

  if (!fs.existsSync(csvPath)) {
    console.error('Export file does not exist')
    throw new Error('Export file does not exist')
  }
  console.log('File exists')

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  console.log('Read CSV content length:', csvContent.length)

  console.log('Returning Response')
  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="energy_readings_current.csv"'
    }
  })
}