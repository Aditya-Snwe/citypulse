import { supabase, isSupabaseConfigured } from './supabase'
import type { Database, DbIssueCategory, DbIssueType, DbSeverity, DbVoteType } from '../types/database'
import type { GeoPoint, Report } from '../types/report'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserAlertPreferences = Database['public']['Tables']['user_alert_preferences']['Row']
export type SavedAlertLocation = Database['public']['Tables']['saved_alert_locations']['Row']
export type NotificationItem = Database['public']['Tables']['notifications']['Row']

export const dbService = {
  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('Could not fetch profile:', error.message)
      return null
    }
    return data
  },

  async updateProfile(userId: string, updates: { full_name?: string; area_label?: string | null }) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') }
    return await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
  },

  // Reports
  async fetchReports(): Promise<Report[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Could not fetch reports from Supabase:', error.message)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      category: row.category,
      description: row.description,
      locationLabel: row.location_label,
      latitude: row.latitude,
      longitude: row.longitude,
      severity: row.severity,
      status: row.status,
      reportedAt: row.created_at,
      confirmations: row.confirmations,
      image: row.image_url,
      timeline: Array.isArray(row.timeline) ? (row.timeline as unknown as Report['timeline']) : undefined,
    }))

  },

  async createReport(input: {
    userId?: string
    type: DbIssueType
    category: DbIssueCategory
    description: string
    locationLabel: string
    point: GeoPoint
    severity: DbSeverity
    imageUrl: string | null
  }) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') }

    return await supabase
      .from('reports')
      .insert({
        user_id: input.userId,
        type: input.type,
        category: input.category,
        description: input.description,
        location_label: input.locationLabel,
        latitude: input.point.lat,
        longitude: input.point.lng,
        severity: input.severity,
        status: 'Submitted',
        confirmations: 1,
        image_url: input.imageUrl,
      })
      .select()
      .single()
  },

  // Storage: Upload report evidence image
  async uploadReportPhoto(
    file: File,
    userId: string,
  ): Promise<{ publicUrl: string; filePath: string } | null> {
    if (!isSupabaseConfigured) return null

    // Allowed mime types & 5MB size check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPG, PNG, WEBP, or HEIC images are allowed.')
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be 5MB or less.')
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('report-evidence')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.warn('Storage upload error:', uploadError.message)
      throw uploadError
    }

    const { data } = supabase.storage.from('report-evidence').getPublicUrl(filePath)
    return { publicUrl: data.publicUrl, filePath }
  },

  async deleteReportPhoto(filePath: string): Promise<void> {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.storage.from('report-evidence').remove([filePath])
    if (error) {
      console.warn('Failed to clean up orphaned image:', error.message)
    }
  },


  // Voting
  async voteOnReport(reportId: string, vote: DbVoteType) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') }
    return await supabase.rpc('record_report_vote', {
      p_report_id: reportId,
      p_vote: vote,
    })
  },

  async fetchUserVotes(userId: string): Promise<Record<string, DbVoteType>> {
    if (!isSupabaseConfigured) return {}
    const { data, error } = await supabase
      .from('report_votes')
      .select('report_id, vote')
      .eq('user_id', userId)

    if (error) {
      console.warn('Could not fetch user votes:', error.message)
      return {}
    }

    const voteMap: Record<string, DbVoteType> = {}
    for (const row of data || []) {
      voteMap[row.report_id] = row.vote
    }
    return voteMap
  },


  // Notifications
  async fetchNotifications(userId: string, limit = 50): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Could not fetch notifications:', error.message)
      return []
    }
    return data || []
  },

  async markNotificationRead(id: string) {
    if (!isSupabaseConfigured) return
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  },

  async markAllNotificationsRead(userId: string) {
    if (!isSupabaseConfigured) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
  },

  async getUnreadNotificationCount(userId: string): Promise<number> {
    if (!isSupabaseConfigured) return 0
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.warn('Could not fetch unread count:', error.message)
      return 0
    }
    return count || 0
  },

  // User Alert Preferences
  async getAlertPreferences(userId: string): Promise<UserAlertPreferences | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase
      .from('user_alert_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  },

  async updateAlertPreferences(
    userId: string,
    updates: Partial<Omit<UserAlertPreferences, 'user_id' | 'created_at' | 'updated_at'>>,
  ) {
    if (!isSupabaseConfigured) return
    await supabase
      .from('user_alert_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  },

  // Saved Alert Locations
  async getSavedLocations(userId: string): Promise<SavedAlertLocation[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('saved_alert_locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) return []
    return data || []
  },
}
