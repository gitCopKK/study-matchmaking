import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const STYLES = {
  success: 'bg-success-500 text-white',
  error: 'bg-danger-500 text-white',
  info: 'bg-primary-500 text-white',
  warning: 'bg-warning-500 text-white',
}

function Toast({ id, type = 'info', message, onClose }) {
  const Icon = ICONS[type] || ICONS.info

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-up ${STYLES[type]}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = {
    success: (message) => addToast('success', message),
    error: (message) => addToast('error', message),
    info: (message) => addToast('info', message),
    warning: (message) => addToast('warning', message),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

