import { stringToColor, getInitials } from '../utils/helpers'

export default function Avatar({
  name,
  src,
  size = 'md',
  showOnline = false,
  isOnline = false,
  className = '',
}) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const onlineSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  }

  const bgColor = stringToColor(name)
  const initials = getInitials(name)

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ${className}`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {showOnline && (
        <div
          className={`absolute bottom-0 right-0 ${onlineSizes[size]} rounded-full border-2 border-white dark:border-slate-800 ${
            isOnline ? 'bg-success-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  )
}

