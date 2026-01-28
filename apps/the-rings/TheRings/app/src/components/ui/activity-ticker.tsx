'use client'

import { useEffect, useState } from 'react'

interface Activity {
  id: number
  message: string
  icon: string
  zone?: string
  time: string
}

const activityTemplates = [
  { message: 'completed a quest step', icon: '🎯', zone: 'TechNest' },
  { message: 'earned the "First Commit" badge', icon: '🏆', zone: 'TechNest' },
  { message: 'tapped in', icon: '📍', zone: 'Creative Studio' },
  { message: 'uploaded a Loot Drop', icon: '📸', zone: 'Boxing Ring' },
  { message: 'joined the Esports Practice', icon: '🎮', zone: 'Gaming Arena' },
  { message: 'started a new quest', icon: '🚀', zone: 'TechNest' },
  { message: 'helped a teammate', icon: '🤝', zone: 'Creative Studio' },
  { message: 'reached level 50 in Brain Ring', icon: '🧠', zone: null },
  { message: 'finished sparring session', icon: '🥊', zone: 'Boxing Ring' },
  { message: 'led crew meeting', icon: '👥', zone: 'Civic Lab' },
  { message: 'completed Zen session', icon: '🧘', zone: 'Zen Den' },
  { message: 'mentored a younger champion', icon: '⭐', zone: null },
]

const names = [
  'Marcus', 'Sophia', 'Devon', 'Aaliyah', 'Tyler', 'Emma', 'Jake',
  'Olivia', 'Liam', 'Ava', 'Noah', 'Isabella', 'Carlos', 'Mia'
]

export function ActivityTicker({ className }: { className?: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    // Generate initial activities
    const initial = Array.from({ length: 8 }, (_, i) => generateActivity(i))
    setActivities(initial)
    setCounter(8)

    // Add new activity every few seconds
    const interval = setInterval(() => {
      setCounter(prev => {
        const newActivity = generateActivity(prev)
        setActivities(current => [newActivity, ...current.slice(0, 7)])
        return prev + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  function generateActivity(id: number): Activity {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
    const name = names[Math.floor(Math.random() * names.length)]
    const minutes = Math.floor(Math.random() * 30)

    return {
      id,
      message: `${name} ${template.message}`,
      icon: template.icon,
      zone: template.zone || undefined,
      time: minutes === 0 ? 'Just now' : `${minutes}m ago`
    }
  }

  return (
    <div className={`overflow-hidden ${className || ''}`}>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-center gap-2 text-sm animate-fade-in"
            style={{
              opacity: 1 - (index * 0.1),
              animationDelay: `${index * 0.1}s`
            }}
          >
            <span className="text-base">{activity.icon}</span>
            <span className="flex-1 truncate text-foreground">{activity.message}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// Horizontal scrolling ticker for headers
export function ActivityTickerHorizontal({ className }: { className?: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const initial = Array.from({ length: 20 }, (_, i) => generateActivity(i))
    setActivities(initial)
    setCounter(20)

    const interval = setInterval(() => {
      setCounter(prev => {
        const newActivity = generateActivity(prev)
        setActivities(current => [...current.slice(1), newActivity])
        return prev + 1
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  function generateActivity(id: number): Activity {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
    const name = names[Math.floor(Math.random() * names.length)]

    return {
      id,
      message: `${name} ${template.message}`,
      icon: template.icon,
      zone: template.zone || undefined,
      time: ''
    }
  }

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className || ''}`}>
      <div className="inline-flex animate-marquee">
        {activities.map((activity) => (
          <span
            key={activity.id}
            className="inline-flex items-center gap-2 mx-6 text-sm"
          >
            <span>{activity.icon}</span>
            <span>{activity.message}</span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  )
}

// Floating notification popup
export function ActivityNotification() {
  const [notification, setNotification] = useState<Activity | null>(null)
  const [visible, setVisible] = useState(false)
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const showNotification = () => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
      const name = names[Math.floor(Math.random() * names.length)]

      setNotification({
        id: counter,
        message: `${name} ${template.message}`,
        icon: template.icon,
        zone: template.zone || undefined,
        time: 'Just now'
      })
      setCounter(prev => prev + 1)
      setVisible(true)

      setTimeout(() => setVisible(false), 4000)
    }

    // Show first notification after 5 seconds
    const initialTimeout = setTimeout(showNotification, 5000)

    // Then every 8-15 seconds
    const interval = setInterval(() => {
      showNotification()
    }, 8000 + Math.random() * 7000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [counter])

  if (!notification || !visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className="bg-card border border-border/50 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{notification.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">{notification.message}</div>
            {notification.zone && (
              <div className="text-xs text-muted-foreground">{notification.zone}</div>
            )}
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
