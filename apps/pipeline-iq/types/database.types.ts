export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          contact_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          organization_id: string | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          contact_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          organization_id?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          contact_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          organization_id?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          annual_project_volume: number | null
          city: string | null
          company_name: string
          company_type: string | null
          created_at: string | null
          customer_tier: string | null
          cw_company_id: string | null
          employee_count_range: string | null
          id: string
          is_target_customer: boolean | null
          last_contacted: string | null
          organization_id: string | null
          phone: string | null
          relationship_status: string | null
          revenue_range: string | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_project_volume?: number | null
          city?: string | null
          company_name: string
          company_type?: string | null
          created_at?: string | null
          customer_tier?: string | null
          cw_company_id?: string | null
          employee_count_range?: string | null
          id?: string
          is_target_customer?: boolean | null
          last_contacted?: string | null
          organization_id?: string | null
          phone?: string | null
          relationship_status?: string | null
          revenue_range?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_project_volume?: number | null
          city?: string | null
          company_name?: string
          company_type?: string | null
          created_at?: string | null
          customer_tier?: string | null
          cw_company_id?: string | null
          employee_count_range?: string | null
          id?: string
          is_target_customer?: boolean | null
          last_contacted?: string | null
          organization_id?: string | null
          phone?: string | null
          relationship_status?: string | null
          revenue_range?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_count: number | null
          created_at: string | null
          cw_contact_id: string | null
          decision_level: string | null
          email: string | null
          email_verified: boolean | null
          first_name: string
          id: string
          last_contacted: string | null
          last_name: string
          linkedin_url: string | null
          mobile: string | null
          organization_id: string | null
          phone: string | null
          phone_verified: boolean | null
          response_status: string | null
          role_category: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          cw_contact_id?: string | null
          decision_level?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name: string
          id?: string
          last_contacted?: string | null
          last_name: string
          linkedin_url?: string | null
          mobile?: string | null
          organization_id?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          response_status?: string | null
          role_category?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          cw_contact_id?: string | null
          decision_level?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string
          id?: string
          last_contacted?: string | null
          last_name?: string
          linkedin_url?: string | null
          mobile?: string | null
          organization_id?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          response_status?: string | null
          role_category?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          performance_score: number | null
          subject: string
          total_clicked: number | null
          total_opened: number | null
          total_responded: number | null
          total_sent: number | null
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          performance_score?: number | null
          subject: string
          total_clicked?: number | null
          total_opened?: number | null
          total_responded?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          performance_score?: number | null
          subject?: string
          total_clicked?: number | null
          total_opened?: number | null
          total_responded?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      high_priority_projects: {
        Row: {
          address: string | null
          assigned_to: string | null
          bid_date: string | null
          city: string
          companies: Json | null
          competitor_mentioned: string | null
          county: string | null
          created_at: string | null
          cw_project_id: string
          data_source: string | null
          decision_makers: number | null
          decision_timeline: string | null
          engagement_score: number | null
          estimated_completion_date: string | null
          estimated_start_date: string | null
          groove_fit_score: number | null
          id: string
          last_updated: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          organization_id: string | null
          outreach_status: string | null
          priority_level: string | null
          project_name: string
          project_size_sqft: number | null
          project_stage: string | null
          project_type: string[] | null
          project_value: number | null
          raw_data: Json | null
          scraped_at: string | null
          services_needed: string[] | null
          state: string
          timing_score: number | null
          total_score: number | null
          units_count: number | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          bid_date?: string | null
          city: string
          companies?: Json | null
          competitor_mentioned?: string | null
          county?: string | null
          created_at?: string | null
          cw_project_id: string
          data_source?: string | null
          decision_makers?: number | null
          decision_timeline?: string | null
          engagement_score?: number | null
          estimated_completion_date?: string | null
          estimated_start_date?: string | null
          groove_fit_score?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          outreach_status?: string | null
          priority_level?: string | null
          project_name: string
          project_size_sqft?: number | null
          project_stage?: string | null
          project_type?: string[] | null
          project_value?: number | null
          raw_data?: Json | null
          scraped_at?: string | null
          services_needed?: string[] | null
          state: string
          timing_score?: number | null
          total_score?: number | null
          units_count?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          bid_date?: string | null
          city?: string
          companies?: Json | null
          competitor_mentioned?: string | null
          county?: string | null
          created_at?: string | null
          cw_project_id?: string
          data_source?: string | null
          decision_makers?: number | null
          decision_timeline?: string | null
          engagement_score?: number | null
          estimated_completion_date?: string | null
          estimated_start_date?: string | null
          groove_fit_score?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          outreach_status?: string | null
          priority_level?: string | null
          project_name?: string
          project_size_sqft?: number | null
          project_stage?: string | null
          project_type?: string[] | null
          project_value?: number | null
          raw_data?: Json | null
          scraped_at?: string | null
          services_needed?: string[] | null
          state?: string
          timing_score?: number | null
          total_score?: number | null
          units_count?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "high_priority_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          custom_branding: Json | null
          id: string
          license_count: number | null
          licenses_used: number | null
          max_campaigns_per_month: number | null
          max_contacts_per_month: number | null
          max_projects_tracked: number | null
          name: string
          settings: Json | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subdomain: string | null
          subscription_ends_at: string | null
          subscription_plan: string | null
          subscription_plan_id: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          custom_branding?: Json | null
          id?: string
          license_count?: number | null
          licenses_used?: number | null
          max_campaigns_per_month?: number | null
          max_contacts_per_month?: number | null
          max_projects_tracked?: number | null
          name: string
          settings?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subdomain?: string | null
          subscription_ends_at?: string | null
          subscription_plan?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          custom_branding?: Json | null
          id?: string
          license_count?: number | null
          licenses_used?: number | null
          max_campaigns_per_month?: number | null
          max_contacts_per_month?: number | null
          max_projects_tracked?: number | null
          name?: string
          settings?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subdomain?: string | null
          subscription_ends_at?: string | null
          subscription_plan?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          campaign_id: string | null
          clicked_count: number | null
          contact_id: string | null
          created_at: string | null
          email_message_id: string | null
          id: string
          metadata: Record<string, unknown> | null
          opened_at: string | null
          opened_count: number | null
          clicked_at: string | null
          status: string | null
          organization_id: string | null
          project_id: string | null
          response_text: string | null
          sentiment: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          campaign_id?: string | null
          clicked_count?: number | null
          contact_id?: string | null
          created_at?: string | null
          email_message_id?: string | null
          id?: string
          metadata?: Record<string, unknown> | null
          opened_at?: string | null
          opened_count?: number | null
          clicked_at?: string | null
          status?: string | null
          organization_id?: string | null
          project_id?: string | null
          response_text?: string | null
          sentiment?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          campaign_id?: string | null
          clicked_count?: number | null
          contact_id?: string | null
          created_at?: string | null
          email_message_id?: string | null
          id?: string
          metadata?: Record<string, unknown> | null
          opened_at?: string | null
          opened_count?: number | null
          clicked_at?: string | null
          status?: string | null
          organization_id?: string | null
          project_id?: string | null
          response_text?: string | null
          sentiment?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_activities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "outreach_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "high_priority_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_element_clicks: {
        Row: {
          id: string
          created_at: string | null
          clicked_at: string | null
          organization_id: string | null
          activity_id: string | null
          contact_id: string | null
          element_id: string
          element_type: string
          element_label: string | null
          element_position: number | null
          element_url: string | null
          vertical: string | null
          email_variant: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          clicked_at?: string | null
          organization_id?: string | null
          activity_id?: string | null
          contact_id?: string | null
          element_id: string
          element_type: string
          element_label?: string | null
          element_position?: number | null
          element_url?: string | null
          vertical?: string | null
          email_variant?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          clicked_at?: string | null
          organization_id?: string | null
          activity_id?: string | null
          contact_id?: string | null
          element_id?: string
          element_type?: string
          element_label?: string | null
          element_position?: number | null
          element_url?: string | null
          vertical?: string | null
          email_variant?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_element_clicks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "outreach_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_element_clicks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_element_clicks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_campaigns: {
        Row: {
          campaign_name: string
          campaign_type: string | null
          created_at: string | null
          created_by: string
          email_template_id: string | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          id: string
          organization_id: string | null
          responses_received: number | null
          scheduled_date: string | null
          status: string | null
          target_project_stages: string[] | null
          target_project_types: string[] | null
          target_states: string[] | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_name: string
          campaign_type?: string | null
          created_at?: string | null
          created_by: string
          email_template_id?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          organization_id?: string | null
          responses_received?: number | null
          scheduled_date?: string | null
          status?: string | null
          target_project_stages?: string[] | null
          target_project_types?: string[] | null
          target_states?: string[] | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string
          campaign_type?: string | null
          created_at?: string | null
          created_by?: string
          email_template_id?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          organization_id?: string | null
          responses_received?: number | null
          scheduled_date?: string | null
          status?: string | null
          target_project_stages?: string[] | null
          target_project_types?: string[] | null
          target_states?: string[] | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_logs: {
        Row: {
          id: string
          source: string
          projects_found: number | null
          projects_inserted: number | null
          projects_updated: number | null
          status: string
          error_message: string | null
          organization_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          source: string
          projects_found?: number | null
          projects_inserted?: number | null
          projects_updated?: number | null
          status: string
          error_message?: string | null
          organization_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          source?: string
          projects_found?: number | null
          projects_inserted?: number | null
          projects_updated?: number | null
          status?: string
          error_message?: string | null
          organization_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      project_stakeholders: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          project_id: string | null
          role_in_project: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          project_id?: string | null
          role_in_project?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          project_id?: string | null
          role_in_project?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_stakeholders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stakeholders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stakeholders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          assigned_to: string | null
          bid_date: string | null
          city: string | null
          competitor_mentioned: string[] | null
          county: string | null
          created_at: string | null
          cw_project_id: string
          data_source: string | null
          decision_timeline: string | null
          engagement_score: number | null
          estimated_completion_date: string | null
          estimated_start_date: string | null
          groove_fit_score: number | null
          id: string
          last_updated: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          organization_id: string | null
          outreach_status: string | null
          priority_level: string | null
          project_name: string
          project_size_sqft: number | null
          project_stage: string
          project_type: string[] | null
          project_value: number | null
          raw_data: Json | null
          scraped_at: string | null
          services_needed: string[] | null
          state: string | null
          timing_score: number | null
          total_score: number | null
          units_count: number | null
          updated_at: string | null
          zip: string | null
          next_contact_date: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          bid_date?: string | null
          city?: string | null
          competitor_mentioned?: string[] | null
          county?: string | null
          created_at?: string | null
          cw_project_id: string
          data_source?: string | null
          decision_timeline?: string | null
          engagement_score?: number | null
          estimated_completion_date?: string | null
          estimated_start_date?: string | null
          groove_fit_score?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          outreach_status?: string | null
          priority_level?: string | null
          project_name: string
          project_size_sqft?: number | null
          project_stage?: string
          project_type?: string[] | null
          project_value?: number | null
          raw_data?: Json | null
          scraped_at?: string | null
          services_needed?: string[] | null
          state?: string | null
          timing_score?: number | null
          total_score?: number | null
          units_count?: number | null
          updated_at?: string | null
          zip?: string | null
          next_contact_date?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          bid_date?: string | null
          city?: string | null
          competitor_mentioned?: string[] | null
          county?: string | null
          created_at?: string | null
          cw_project_id?: string
          data_source?: string | null
          decision_timeline?: string | null
          engagement_score?: number | null
          estimated_completion_date?: string | null
          estimated_start_date?: string | null
          groove_fit_score?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          outreach_status?: string | null
          priority_level?: string | null
          project_name?: string
          project_size_sqft?: number | null
          project_stage?: string
          project_type?: string[] | null
          project_value?: number | null
          raw_data?: Json | null
          scraped_at?: string | null
          services_needed?: string[] | null
          state?: string | null
          timing_score?: number | null
          total_score?: number | null
          units_count?: number | null
          updated_at?: string | null
          zip?: string | null
          next_contact_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          features: Json
          id: string
          is_active: boolean | null
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number | null
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: Json
          id: string
          is_active?: boolean | null
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          cost_cents: number | null
          count: number | null
          created_at: string | null
          feature_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          cost_cents?: number | null
          count?: number | null
          created_at?: string | null
          feature_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          cost_cents?: number | null
          count?: number | null
          created_at?: string | null
          feature_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          is_god_mode: boolean | null
          last_login: string | null
          license_assigned_at: string | null
          login_count: number | null
          mobile: string | null
          organization_id: string | null
          phone: string | null
          role: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_god_mode?: boolean | null
          last_login?: string | null
          license_assigned_at?: string | null
          login_count?: number | null
          mobile?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_god_mode?: boolean | null
          last_login?: string | null
          license_assigned_at?: string | null
          login_count?: number | null
          mobile?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_subscription_stats: {
        Row: {
          avg_price_cents: number | null
          customer_count: number | null
          display_name: string | null
          plan_name: string | null
          total_mrr_cents: number | null
        }
        Relationships: []
      }
      current_month_usage: {
        Row: {
          feature_type: string | null
          organization_id: string | null
          total_cost: number | null
          usage_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_usage: {
        Row: {
          feature_type: string | null
          month: string | null
          organization_id: string | null
          total_cost_cents: number | null
          total_usage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_metrics: {
        Row: {
          avg_score: number | null
          avg_total_score: number | null
          organization_id: string | null
          project_count: number | null
          project_stage: string | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "high_priority_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_feature_access: {
        Args: { p_feature_type: string; p_organization_id: string }
        Returns: {
          allowed: boolean
          current_usage: number
          limit_value: number
          reason: string
        }[]
      }
      track_usage: {
        Args: {
          p_cost_cents?: number
          p_count?: number
          p_feature_type: string
          p_metadata?: Json
          p_organization_id: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
