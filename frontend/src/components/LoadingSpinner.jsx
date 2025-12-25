export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }

  return (
    <div
      className={`${sizes[size]} border-primary-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-slate-500 animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

