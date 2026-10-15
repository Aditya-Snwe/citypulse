export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DbSeverity = 'Low' | 'Medium' | 'High'

export type DbReportStatus =
  | 'Submitted'
  | 'In Progress'
  | 'Community Confirmed'
  | 'Community Monitoring'
  | 'Resolved'

export type DbIssueType =
  | 'Pothole'
  | 'Road Damage'
  | 'Garbage'
  | 'Water Leakage'
  | 'Waterlogging'
  | 'Broken Streetlight'
  | 'Fallen Tree'
  | 'Other'

export type DbIssueCategory =
  | 'Road Infrastructure'
  | 'Waste'
  | 'Water'
  | 'Electricity'
  | 'Other'

export type DbVoteType = 'present' | 'resolved'

export type DbNotificationType = 'nearby_alert' | 'status_update' | 'verification_milestone'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          area_label: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          area_label?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          area_label?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          user_id: string | null
          type: DbIssueType
          category: DbIssueCategory
          description: string
          location_label: string
          latitude: number
          longitude: number
          severity: DbSeverity
          status: DbReportStatus
          confirmations: number
          image_url: string | null
          timeline: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: DbIssueType
          category: DbIssueCategory
          description: string
          location_label: string
          latitude: number
          longitude: number
          severity?: DbSeverity
          status?: DbReportStatus
          confirmations?: number
          image_url?: string | null
          timeline?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: DbIssueType
          category?: DbIssueCategory
          description?: string
          location_label?: string
          latitude?: number
          longitude?: number
          severity?: DbSeverity
          status?: DbReportStatus
          confirmations?: number
          image_url?: string | null
          timeline?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reports_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      report_votes: {
        Row: {
          id: string
          report_id: string
          user_id: string
          vote: DbVoteType
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          user_id: string
          vote: DbVoteType
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          user_id?: string
          vote?: DbVoteType
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'report_votes_report_id_fkey'
            columns: ['report_id']
            referencedRelation: 'reports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'report_votes_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          report_id: string | null
          title: string
          message: string
          notification_type: DbNotificationType
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_id?: string | null
          title: string
          message: string
          notification_type?: DbNotificationType
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_id?: string | null
          title?: string
          message?: string
          notification_type?: DbNotificationType
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_report_id_fkey'
            columns: ['report_id']
            referencedRelation: 'reports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      user_alert_preferences: {
        Row: {
          user_id: string
          radius_meters: number
          high_severity_only: boolean
          enabled_categories: DbIssueCategory[]
          in_app_enabled: boolean
          push_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          radius_meters?: number
          high_severity_only?: boolean
          enabled_categories?: DbIssueCategory[]
          in_app_enabled?: boolean
          push_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          radius_meters?: number
          high_severity_only?: boolean
          enabled_categories?: DbIssueCategory[]
          in_app_enabled?: boolean
          push_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_alert_preferences_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      saved_alert_locations: {
        Row: {
          id: string
          user_id: string
          label: string
          latitude: number
          longitude: number
          radius_meters: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          latitude: number
          longitude: number
          radius_meters?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          latitude?: number
          longitude?: number
          radius_meters?: number
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_alert_locations_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      browser_push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth_key: string
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth_key: string
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth_key?: string
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'browser_push_subscriptions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_report_vote: {
        Args: {
          p_report_id: string
          p_vote: DbVoteType
        }
        Returns: {
          report_id: string
          new_confirmations: number
          new_positive_votes: number
          new_negative_votes: number
          new_status: DbReportStatus
          user_vote: DbVoteType
        }[]
      }
      get_eligible_push_subscriptions: {
        Args: {
          p_report_id: string
        }
        Returns: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth_key: string
        }[]
      }
    }

    Enums: {
      issue_type: DbIssueType
      issue_category: DbIssueCategory
      severity_level: DbSeverity
      report_status: DbReportStatus
      vote_type: DbVoteType
      notification_type: DbNotificationType
    }
  }
}
