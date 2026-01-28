import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  className?: string
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-purple-600/30 text-purple-300 border-purple-500/30',
    secondary: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    success: 'bg-green-600/30 text-green-300 border-green-500/30',
    warning: 'bg-yellow-600/30 text-yellow-300 border-yellow-500/30',
    info: 'bg-blue-600/30 text-blue-300 border-blue-500/30'
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

