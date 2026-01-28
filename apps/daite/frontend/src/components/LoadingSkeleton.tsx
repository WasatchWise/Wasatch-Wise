export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-2/3"></div>
    </div>
  )
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-6 bg-slate-700 rounded w-24"></div>
        <div className="h-6 bg-slate-700 rounded w-16"></div>
      </div>
      <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-slate-700 rounded w-20"></div>
        <div className="h-6 bg-slate-700 rounded w-20"></div>
        <div className="h-6 bg-slate-700 rounded w-20"></div>
      </div>
      <div className="h-10 bg-slate-700 rounded w-full"></div>
    </div>
  )
}

