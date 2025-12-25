import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className={`card w-full ${sizes[size]} p-6 animate-scale-in`}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-lg font-display font-semibold">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

