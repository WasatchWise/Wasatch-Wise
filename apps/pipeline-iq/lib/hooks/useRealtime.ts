'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtime(
  table: string,
  callback: (payload: any) => void,
  filter?: { column: string; value: string }
) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase.channel(`${table}-changes`)

      const subscription = filter
        ? channel.on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter: `${filter.column}=eq.${filter.value}`
            },
            callback
          )
        : channel.on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table
            },
            callback
          )

      await subscription.subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, callback, filter])
}
