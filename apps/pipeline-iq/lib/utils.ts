import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return formatDate(date)
}

export function capitalize(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function extractNameFromEmail(email: string | null | undefined): { firstName: string, lastName: string } | null {
  if (!email) return null
  const [local] = email.split('@')
  if (!local) return null

  // Handle dot.format (rajesh.khubchandani)
  if (local.includes('.')) {
    const parts = local.split('.')
    return {
      firstName: capitalize(parts[0]),
      lastName: capitalize(parts.slice(1).join(' '))
    }
  }

  // Handle underscore_format (rajesh_khubchandani)
  if (local.includes('_')) {
    const parts = local.split('_')
    return {
      firstName: capitalize(parts[0]),
      lastName: capitalize(parts.slice(1).join(' '))
    }
  }

  // Minimal: just use the local part if it looks like a name (not 'info' or 'sales')
  const genericPrefixes = ['info', 'sales', 'contact', 'support', 'admin', 'office']
  if (genericPrefixes.includes(local.toLowerCase())) {
    return null
  }

  return {
    firstName: capitalize(local),
    lastName: ''
  }
}
