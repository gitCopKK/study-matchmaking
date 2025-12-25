export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) {
  const variants = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    accent: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300',
    success: 'bg-success-500/10 text-success-600 dark:text-success-400',
    warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
    danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}

