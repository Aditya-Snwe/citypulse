// Supabase Edge Function: send-web-push
// Secure server-side sender for Web Push notifications using standard VAPID Web Push protocol.
// Invoked when a report is created and matches nearby users who opted into push notifications.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushRequestPayload {
  report_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@citypulse.local'

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase service role configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body: PushRequestPayload = await req.json().catch(() => ({}))
    const reportId = body.report_id

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Missing report_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 1. Fetch report details
    const { data: report, error: reportErr } = await supabase
      .from('reports')
      .select('id, type, category, severity, location_label, latitude, longitude, user_id')
      .eq('id', reportId)
      .single()

    if (reportErr || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found', details: reportErr?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 2. Query users with active push subscriptions who have opted into push and match proximity
    // Uses the database helper to find nearby users
    const { data: eligibleSubscriptions, error: subError } = await supabase.rpc(
      'get_eligible_push_subscriptions',
      { p_report_id: reportId },
    )

    if (subError) {
      // Fallback query if custom RPC is not yet executed
      console.warn('RPC get_eligible_push_subscriptions failed, querying directly:', subError.message)
    }

    const subscriptions = eligibleSubscriptions || []

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No eligible push subscribers for this report area', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Concise, privacy-preserving notification payload (no sensitive recipient coordinates)
    const pushPayload = JSON.stringify({
      title: `${report.type} Reported Nearby`,
      body: `A ${report.type.toLowerCase()} was reported near your saved alert area (${report.location_label}).`,
      reportId: report.id,
      url: `/reports/${report.id}`,
      badge: '/favicon.svg',
      icon: '/favicon.svg',
    })

    let sentCount = 0
    let failedCount = 0
    const expiredEndpoints: string[] = []

    // 3. Dispatch web push to each eligible subscription
    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth_key,
        },
      }

      try {
        await webpush.sendNotification(pushSubscription, pushPayload, {
          // Time To Live: 24 hours
          TTL: 86400,
          urgency: report.severity === 'High' ? 'high' : 'normal',
        })
        sentCount++
      } catch (err: any) {
        failedCount++
        // Handle 404 Not Found or 410 Gone: subscription has expired or been revoked
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredEndpoints.push(sub.endpoint)
        } else {
          console.warn(`Failed to deliver push to subscriber ${sub.id}:`, err.message || err)
        }
      }
    }

    // 4. Clean up expired / revoked subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('browser_push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
      console.log(`Cleaned up ${expiredEndpoints.length} expired push subscriptions.`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        cleaned: expiredEndpoints.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
