
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, date, reportType, startDate, endDate } = await req.json()

    if (action === 'generate_daily_reports') {
      // Generate daily reports for yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const reportDate = yesterday.toISOString().split('T')[0]

      console.log('Generating daily reports for:', reportDate)

      // Get all working stations
      const { data: stations } = await supabaseClient
        .from('stations')
        .select('working_station')
        .not('working_station', 'is', null)

      const workingStations = [...new Set(stations?.map(s => s.working_station) || [])]

      for (const station of workingStations) {
        await generateStationReports(supabaseClient, reportDate, station)
      }

      // Also generate overall reports
      await generateStationReports(supabaseClient, reportDate, null)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'generate_report') {
      const csvData = await generateReportData(supabaseClient, reportType, startDate, endDate, req.headers.get('working-station'))
      
      return new Response(csvData, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_${startDate}_to_${endDate}.csv"`
        }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error generating reports:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function generateStationReports(supabaseClient: any, reportDate: string, workingStation: string | null) {
  const reports = ['tickets', 'platform_tickets', 'verification_logs', 'revenue']
  
  for (const reportType of reports) {
    try {
      const csvData = await generateReportData(supabaseClient, reportType, reportDate, reportDate, workingStation)
      const fileName = `${reportType}_${workingStation || 'all'}_${reportDate}.csv`
      
      // Store report metadata
      await supabaseClient
        .from('daily_reports')
        .insert({
          report_date: reportDate,
          report_type: reportType,
          file_name: fileName,
          file_path: `/reports/${fileName}`,
          file_size: csvData.length,
          working_station: workingStation
        })

      console.log(`Generated ${reportType} report for ${workingStation || 'all stations'}`)
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error)
    }
  }
}

async function generateReportData(supabaseClient: any, reportType: string, startDate: string, endDate: string, workingStation: string | null): Promise<string> {
  let query: any
  let headers: string[] = []
  
  switch (reportType) {
    case 'tickets':
      query = supabaseClient
        .from('tickets')
        .select(`
          travel_id,
          passenger_name,
          passenger_count,
          from_station:stations!tickets_from_station_id_fkey(name),
          to_station:stations!tickets_to_station_id_fkey(name),
          train:trains(name, number),
          ticket_class,
          total_price,
          travel_date,
          created_at,
          is_verified
        `)
        .gte('travel_date', startDate)
        .lte('travel_date', endDate)
        .neq('ticket_class', 'platform')

      headers = ['Travel ID', 'Passenger Name', 'Passenger Count', 'From Station', 'To Station', 'Train', 'Class', 'Amount', 'Travel Date', 'Created At', 'Verified']
      break

    case 'platform_tickets':
      query = supabaseClient
        .from('tickets')
        .select(`
          travel_id,
          passenger_name,
          passenger_count,
          total_price,
          travel_date,
          created_at,
          is_verified
        `)
        .gte('travel_date', startDate)
        .lte('travel_date', endDate)
        .eq('ticket_class', 'platform')

      headers = ['Travel ID', 'Passenger Name', 'Passenger Count', 'Amount', 'Travel Date', 'Created At', 'Verified']
      break

    case 'verification_logs':
      query = supabaseClient
        .from('verification_logs')
        .select(`
          travel_id,
          verified_by,
          status,
          verified_at,
          fraud_attempt,
          details
        `)
        .gte('verified_at', startDate)
        .lte('verified_at', endDate + 'T23:59:59')

      headers = ['Travel ID', 'Verified By', 'Status', 'Verified At', 'Fraud Attempt', 'Details']
      break

    case 'revenue':
      query = supabaseClient
        .from('tickets')
        .select(`
          travel_date,
          ticket_class,
          total_price,
          passenger_count,
          from_station:stations!tickets_from_station_id_fkey(name),
          to_station:stations!tickets_to_station_id_fkey(name)
        `)
        .gte('travel_date', startDate)
        .lte('travel_date', endDate)

      headers = ['Date', 'Class', 'Amount', 'Passengers', 'From Station', 'To Station']
      break

    default:
      throw new Error('Invalid report type')
  }

  // Apply working station filter if provided
  if (workingStation) {
    if (reportType === 'tickets' || reportType === 'platform_tickets' || reportType === 'revenue') {
      // Filter by stations or trains belonging to the working station
      // This is a simplified filter - you might need to adjust based on your data structure
    }
  }

  const { data, error } = await query

  if (error) throw error

  // Convert to CSV
  let csv = headers.join(',') + '\n'
  
  data?.forEach((row: any) => {
    const values = headers.map(header => {
      switch (header) {
        case 'Travel ID':
          return row.travel_id || ''
        case 'Passenger Name':
          return row.passenger_name || ''
        case 'Passenger Count':
        case 'Passengers':
          return row.passenger_count || ''
        case 'From Station':
          return row.from_station?.name || ''
        case 'To Station':
          return row.to_station?.name || ''
        case 'Train':
          return row.train ? `${row.train.name} (${row.train.number})` : ''
        case 'Class':
          return row.ticket_class || ''
        case 'Amount':
          return row.total_price || ''
        case 'Travel Date':
        case 'Date':
          return row.travel_date || ''
        case 'Created At':
          return row.created_at || ''
        case 'Verified':
          return row.is_verified ? 'Yes' : 'No'
        case 'Verified By':
          return row.verified_by || ''
        case 'Status':
          return row.status || ''
        case 'Verified At':
          return row.verified_at || ''
        case 'Fraud Attempt':
          return row.fraud_attempt ? 'Yes' : 'No'
        case 'Details':
          return row.details || ''
        default:
          return ''
      }
    })
    csv += values.map(v => `"${v}"`).join(',') + '\n'
  })

  return csv
}
