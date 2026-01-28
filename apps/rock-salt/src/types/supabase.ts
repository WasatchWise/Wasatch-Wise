export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      article_sections: {
        Row: {
          article_id: string
          body: string | null
          created_at: string
          heading: string | null
          id: string
          media_caption: string | null
          media_url: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          article_id: string
          body?: string | null
          created_at?: string
          heading?: string | null
          id?: string
          media_caption?: string | null
          media_url?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          article_id?: string
          body?: string | null
          created_at?: string
          heading?: string | null
          id?: string
          media_caption?: string | null
          media_url?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_sections_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          article_type: string | null
          author_name: string | null
          content: string | null
          created_at: string
          hero_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          article_type?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          article_type?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      band_genres: {
        Row: {
          band_id: string
          genre_id: string
        }
        Insert: {
          band_id: string
          genre_id: string
        }
        Update: {
          band_id?: string
          genre_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_genres_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      band_links: {
        Row: {
          band_id: string
          created_at: string
          id: string
          kind: string | null
          label: string
          sort_order: number | null
          url: string
        }
        Insert: {
          band_id: string
          created_at?: string
          id?: string
          kind?: string | null
          label: string
          sort_order?: number | null
          url: string
        }
        Update: {
          band_id?: string
          created_at?: string
          id?: string
          kind?: string | null
          label?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_links_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      band_members: {
        Row: {
          band_id: string
          created_at: string
          instrument: string | null
          musician_id: string
          role: string | null
          tenure_end: number | null
          tenure_start: number | null
          updated_at: string
        }
        Insert: {
          band_id: string
          created_at?: string
          instrument?: string | null
          musician_id: string
          role?: string | null
          tenure_end?: number | null
          tenure_start?: number | null
          updated_at?: string
        }
        Update: {
          band_id?: string
          created_at?: string
          instrument?: string | null
          musician_id?: string
          role?: string | null
          tenure_end?: number | null
          tenure_start?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_members_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_members_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      band_photos: {
        Row: {
          band_id: string
          caption: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          photo_order: number | null
          source: string | null
          source_attribution: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          band_id: string
          caption?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_order?: number | null
          source?: string | null
          source_attribution?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          band_id?: string
          caption?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_order?: number | null
          source?: string | null
          source_attribution?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_photos_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      band_tracks: {
        Row: {
          band_id: string
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          id: string
          is_featured: boolean | null
          play_count: number | null
          title: string
          track_order: number | null
          track_type: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          band_id: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          is_featured?: boolean | null
          play_count?: number | null
          title: string
          track_order?: number | null
          track_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          band_id?: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_featured?: boolean | null
          play_count?: number | null
          title?: string
          track_order?: number | null
          track_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "band_tracks_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      bands: {
        Row: {
          bandcamp_url: string | null
          bio: string | null
          claimed_at: string | null
          claimed_by: string | null
          country: string | null
          created_at: string
          custom_html: string | null
          description: string | null
          disbanded_year: number | null
          facebook_url: string | null
          featured: boolean | null
          formed_year: number | null
          hero_image_url: string | null
          history: string | null
          id: string
          image_url: string | null
          instagram_handle: string | null
          name: string
          notes: string | null
          origin_city: string | null
          press_contact: string | null
          slug: string
          spotify_url: string | null
          state: string | null
          status: string | null
          updated_at: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          bandcamp_url?: string | null
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          country?: string | null
          created_at?: string
          custom_html?: string | null
          description?: string | null
          disbanded_year?: number | null
          facebook_url?: string | null
          featured?: boolean | null
          formed_year?: number | null
          hero_image_url?: string | null
          history?: string | null
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          name: string
          notes?: string | null
          origin_city?: string | null
          press_contact?: string | null
          slug: string
          spotify_url?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          bandcamp_url?: string | null
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          country?: string | null
          created_at?: string
          custom_html?: string | null
          description?: string | null
          disbanded_year?: number | null
          facebook_url?: string | null
          featured?: boolean | null
          formed_year?: number | null
          hero_image_url?: string | null
          history?: string | null
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          name?: string
          notes?: string | null
          origin_city?: string | null
          press_contact?: string | null
          slug?: string
          spotify_url?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      community_spotlights: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          image_url: string | null
          link_label: string | null
          link_url: string | null
          priority: number | null
          published_at: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          link_label?: string | null
          link_url?: string | null
          priority?: number | null
          published_at?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          link_label?: string | null
          link_url?: string | null
          priority?: number | null
          published_at?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      episode_links: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          kind: string | null
          label: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          kind?: string | null
          label: string
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          kind?: string | null
          label?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_links_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_segments: {
        Row: {
          created_at: string
          description: string | null
          ends_at_seconds: number | null
          episode_id: string
          id: string
          sort_order: number | null
          starts_at_seconds: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at_seconds?: number | null
          episode_id: string
          id?: string
          sort_order?: number | null
          starts_at_seconds?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at_seconds?: number | null
          episode_id?: string
          id?: string
          sort_order?: number | null
          starts_at_seconds?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_segments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          audio_url: string | null
          created_at: string
          date: string | null
          description: string | null
          duration_seconds: number | null
          episode_number: number | null
          episode_type: string | null
          featured: boolean | null
          id: string
          season_number: number | null
          show_notes: string | null
          slug: string | null
          spotify_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          episode_type?: string | null
          featured?: boolean | null
          id?: string
          season_number?: number | null
          show_notes?: string | null
          slug?: string | null
          spotify_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          episode_type?: string | null
          featured?: boolean | null
          id?: string
          season_number?: number | null
          show_notes?: string | null
          slug?: string | null
          spotify_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      event_bands: {
        Row: {
          band_id: string
          event_id: string
          is_headliner: boolean | null
          notes: string | null
          slot_order: number | null
        }
        Insert: {
          band_id: string
          event_id: string
          is_headliner?: boolean | null
          notes?: string | null
          slot_order?: number | null
        }
        Update: {
          band_id?: string
          event_id?: string
          is_headliner?: boolean | null
          notes?: string | null
          slot_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_bands_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_bands_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_submission_bands: {
        Row: {
          band_id: string | null
          band_name: string
          created_at: string | null
          event_submission_id: string
          id: string
          is_headliner: boolean | null
          slot_order: number | null
        }
        Insert: {
          band_id?: string | null
          band_name: string
          created_at?: string | null
          event_submission_id: string
          id?: string
          is_headliner?: boolean | null
          slot_order?: number | null
        }
        Update: {
          band_id?: string | null
          band_name?: string
          created_at?: string | null
          event_submission_id?: string
          id?: string
          is_headliner?: boolean | null
          slot_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_submission_bands_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_submission_bands_event_submission_id_fkey"
            columns: ["event_submission_id"]
            isOneToOne: false
            referencedRelation: "event_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_submissions: {
        Row: {
          additional_notes: string | null
          city: string
          created_at: string | null
          end_time: string | null
          event_description: string
          event_name: string
          event_url: string | null
          expected_attendance: string | null
          flyer_url: string | null
          id: string
          organizer_email: string
          organizer_name: string
          organizer_phone: string | null
          social_media_links: Json | null
          start_time: string
          state: string | null
          status: string
          ticket_price: string | null
          ticket_url: string | null
          updated_at: string | null
          venue_address: string | null
          venue_id: string | null
          venue_name: string
        }
        Insert: {
          additional_notes?: string | null
          city: string
          created_at?: string | null
          end_time?: string | null
          event_description: string
          event_name: string
          event_url?: string | null
          expected_attendance?: string | null
          flyer_url?: string | null
          id?: string
          organizer_email: string
          organizer_name: string
          organizer_phone?: string | null
          social_media_links?: Json | null
          start_time: string
          state?: string | null
          status?: string
          ticket_price?: string | null
          ticket_url?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_id?: string | null
          venue_name: string
        }
        Update: {
          additional_notes?: string | null
          city?: string
          created_at?: string | null
          end_time?: string | null
          event_description?: string
          event_name?: string
          event_url?: string | null
          expected_attendance?: string | null
          flyer_url?: string | null
          id?: string
          organizer_email?: string
          organizer_name?: string
          organizer_phone?: string | null
          social_media_links?: Json | null
          start_time?: string
          state?: string | null
          status?: string
          ticket_price?: string | null
          ticket_url?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_id?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_submissions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          created_at: string
          description: string | null
          door_time: string | null
          end_time: string | null
          facebook_url: string | null
          featured: boolean | null
          headline: string | null
          id: string
          image_url: string | null
          is_all_ages: boolean | null
          name: string | null
          slug: string | null
          start_time: string | null
          state: string | null
          status: string | null
          ticket_currency: string | null
          ticket_price: number | null
          ticket_url: string | null
          title: string
          updated_at: string
          venue_id: string | null
          venue_name: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          description?: string | null
          door_time?: string | null
          end_time?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_all_ages?: boolean | null
          name?: string | null
          slug?: string | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          ticket_currency?: string | null
          ticket_price?: number | null
          ticket_url?: string | null
          title: string
          updated_at?: string
          venue_id?: string | null
          venue_name?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string | null
          door_time?: string | null
          end_time?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_all_ages?: boolean | null
          name?: string | null
          slug?: string | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          ticket_currency?: string | null
          ticket_price?: number | null
          ticket_url?: string | null
          title?: string
          updated_at?: string
          venue_id?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      livestreams: {
        Row: {
          backup_stream_url: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          notes: string | null
          scheduled_for: string | null
          slug: string | null
          status: string | null
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          backup_stream_url?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          scheduled_for?: string | null
          slug?: string | null
          status?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          backup_stream_url?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          scheduled_for?: string | null
          slug?: string | null
          status?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      local_resources: {
        Row: {
          contact_info: string | null
          created_at: string
          email: string | null
          focus_area: string | null
          id: string
          instagram_handle: string | null
          name: string
          notes: string | null
          type: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          email?: string | null
          focus_area?: string | null
          id?: string
          instagram_handle?: string | null
          name: string
          notes?: string | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          email?: string | null
          focus_area?: string | null
          id?: string
          instagram_handle?: string | null
          name?: string
          notes?: string | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      music_submissions: {
        Row: {
          admin_feedback: string | null
          band_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          genre_preferences: string[] | null
          hometown: string | null
          id: string
          internal_notes: string | null
          links: Json | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string
          updated_at: string | null
        }
        Insert: {
          admin_feedback?: string | null
          band_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          genre_preferences?: string[] | null
          hometown?: string | null
          id?: string
          internal_notes?: string | null
          links?: Json | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string | null
        }
        Update: {
          admin_feedback?: string | null
          band_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          genre_preferences?: string[] | null
          hometown?: string | null
          id?: string
          internal_notes?: string | null
          links?: Json | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      musicians: {
        Row: {
          bio: string | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          id: string
          instagram_handle: string | null
          instruments: string[] | null
          disciplines: string[] | null
          location: string | null
          name: string
          seeking_band: boolean | null
          available_for_lessons: boolean | null
          role: string | null
          slug: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          instruments?: string[] | null
          disciplines?: string[] | null
          location?: string | null
          name: string
          seeking_band?: boolean | null
          available_for_lessons?: boolean | null
          role?: string | null
          slug?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          instruments?: string[] | null
          disciplines?: string[] | null
          location?: string | null
          name?: string
          seeking_band?: boolean | null
          available_for_lessons?: boolean | null
          role?: string | null
          slug?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      releases: {
        Row: {
          band_id: string
          bandcamp_url: string | null
          cover_image_url: string | null
          created_at: string
          format: string | null
          id: string
          rarity_notes: string | null
          release_date: string | null
          release_year: number | null
          slug: string | null
          spotify_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          band_id: string
          bandcamp_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          format?: string | null
          id?: string
          rarity_notes?: string | null
          release_date?: string | null
          release_year?: number | null
          slug?: string | null
          spotify_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          band_id?: string
          bandcamp_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          format?: string | null
          id?: string
          rarity_notes?: string | null
          release_date?: string | null
          release_year?: number | null
          slug?: string | null
          spotify_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "releases_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      rock_facts: {
        Row: {
          created_at: string
          fact: string
          id: string
          is_featured: boolean | null
          source_name: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fact: string
          id?: string
          is_featured?: boolean | null
          source_name?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fact?: string
          id?: string
          is_featured?: boolean | null
          source_name?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      trivia_facts: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          prompt: string
          source_name: string | null
          source_url: string | null
          tags: string[] | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          prompt: string
          source_name?: string | null
          source_url?: string | null
          tags?: string[] | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          prompt?: string
          source_name?: string | null
          source_url?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_handle: string | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          slug: string | null
          state: string | null
          status: string | null
          updated_at: string
          website: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_handle?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          slug?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_handle?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          slug?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: {
        Args: { name: string }
        Returns: string
      }
      increment_track_play_count: {
        Args: { track_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

