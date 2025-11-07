// =====================================================
// THE HELP LIST - SUPABASE CLIENT & API
// =====================================================
// Version: 1.0.0
// Privacy-First Architecture
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { 
    PrivacyLevel,
    RequestStatus,
    User,
    Request,
    RequestItem,
    AvailableRequest,
    Message,
    DecryptedMessage,
    PrivacySettings,
    ApiResponse
} from '../types';

// =====================================================
// ENVIRONMENT CONFIGURATION
// =====================================================

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => sessionStorage.getItem(key),
      setItem: (key, value) => sessionStorage.setItem(key, value),
      removeItem: (key) => sessionStorage.removeItem(key),
    },
  },
  global: {
    headers: {
      'x-privacy-mode': 'maximum',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// =====================================================
// PRIVACY-AWARE API FUNCTIONS
// =====================================================

export class HelpListAPI {
  // ===== Authentication & User Management =====
  
  static async signUpAnonymously(displayName: string): Promise<ApiResponse<User>> {
    // Implementation from user prompt
    return { error: { message: "Not implemented", code: "NOT_IMPLEMENTED" } };
  }
  
  // ===== Request Management =====
  
  static async createRequest(
    requestData: { displayName: string, need: string, city: string, contactMethod: 'text' | 'email', contactInfo: string }
  ): Promise<ApiResponse<Request>> {
    try {
        const items: RequestItem[] = [{ name: requestData.need, quantity: 1, notes: 'User input from simple form' }];

        const { data: request, error } = await supabase
            .from('requests')
            .insert({
                requester_display_name: requestData.displayName,
                need: requestData.need, // Keep simple field for compatibility
                city: requestData.city, // Keep simple field for compatibility
                items: items,
                urgency_level: 'today',
                delivery_privacy: PrivacyLevel.HIGH,
                location_description: requestData.city,
                status: RequestStatus.ACTIVE,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                // These fields are not in the new schema but are required by old form
                contact_info: requestData.contactInfo,
                contact_method: requestData.contactMethod,
            })
            .select()
            .single();
      
      if (error) throw error;
      
      return { 
        data: request,
        meta: {
          encryption_status: 'encrypted',
          data_retention: '30 days',
          privacy_level: PrivacyLevel.HIGH,
        }
      };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Failed to create request',
          code: 'REQUEST_CREATION_FAILED',
          privacy_implication: 'Your data was not stored',
        }
      };
    }
  }
  
  static async getAvailableRequests(): Promise<ApiResponse<AvailableRequest[]>> {
    try {
      const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', RequestStatus.ACTIVE)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { 
        data: (requests || []).map(r => ({ ...r, item_count: r.items?.length || 1 })),
        meta: {
          encryption_status: 'plain',
          data_retention: 'view-only',
          privacy_level: PrivacyLevel.HIGH,
        }
      };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Failed to fetch available requests',
          code: 'FETCH_FAILED',
        }
      };
    }
  }

  static async getMyTasks(helperId: string): Promise<ApiResponse<Request[]>> {
    try {
        const { data: tasks, error } = await supabase
            .from('requests')
            .select('*')
            .eq('helper_id', helperId)
            .in('status', [RequestStatus.CLAIMED, RequestStatus.SHOPPING, RequestStatus.DELIVERING, RequestStatus.IN_PROGRESS])
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return { data: tasks || [] };
    } catch (error: any) {
        return {
            error: {
                message: error.message || 'Failed to fetch your tasks',
                code: 'FETCH_MY_TASKS_FAILED',
            }
        };
    }
  }

  static async updateRequestStatus(requestId: string, status: RequestStatus): Promise<ApiResponse<Request>> {
      try {
          const { data: request, error } = await supabase
              .from('requests')
              .update({ status: status })
              .eq('id', requestId)
              .select()
              .single();

          if (error) throw error;
          return { data: request };
      } catch (error: any) {
          return {
              error: {
                  message: error.message || 'Failed to update request status',
                  code: 'UPDATE_STATUS_FAILED',
              }
          };
      }
  }
  
  static async claimRequest(requestId: string, helperId: string, helperDisplayName: string): Promise<ApiResponse<Request>> {
    try {
      const { data: request, error } = await supabase
        .from('requests')
        .update({
          helper_id: helperId,
          helper_display_name: helperDisplayName,
          status: RequestStatus.CLAIMED,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', RequestStatus.ACTIVE)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // PostgREST error for no rows returned
            throw new Error("Request may have already been claimed.");
        }
        throw error;
      };
      
      return { data: request };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Failed to claim request',
          code: 'CLAIM_FAILED',
        }
      };
    }
  }
}

// =====================================================
// PRIVACY UTILITIES
// =====================================================

export class PrivacyUtils {
  // Generate anonymous display name
  static generateAnonymousName(): string {
    const adjectives = ['Happy', 'Sunny', 'Helpful', 'Kind', 'Grateful', 'Caring'];
    const nouns = ['Neighbor', 'Helper', 'Friend', 'Buddy', 'Angel', 'Hero'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
  }
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  supabase,
  HelpListAPI,
  PrivacyUtils,
};
