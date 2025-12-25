import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  return dayjs(date).fromNow()
}

/**
 * Format a date for display (e.g., "Dec 22, 2024")
 */
export function formatDate(date, format = 'MMM D, YYYY') {
  return dayjs(date).format(format)
}

/**
 * Format time (e.g., "2:30 PM")
 */
export function formatTime(date) {
  return dayjs(date).format('h:mm A')
}

/**
 * Format duration in minutes to human readable (e.g., "1h 30m")
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * Format a call duration (e.g., "05:23")
 */
export function formatCallDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Debounce a function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle a function
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generate a random color based on a string (for avatars)
 */
export function stringToColor(str) {
  if (!str) return '#0ea5e9'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#0ea5e9', // primary
    '#d946ef', // accent
    '#22c55e', // success
    '#f59e0b', // warning
    '#6366f1', // indigo
    '#ec4899', // pink
    '#14b8a6', // teal
    '#8b5cf6', // violet
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 50) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Check if browser supports notifications
 */
export function supportsNotifications() {
  return 'Notification' in window
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!supportsNotifications()) return false
  
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Show a browser notification
 */
export function showNotification(title, options = {}) {
  if (!supportsNotifications() || Notification.permission !== 'granted') return
  
  new Notification(title, {
    icon: '/vite.svg',
    badge: '/vite.svg',
    ...options,
  })
}

/**
 * Calculate compatibility score color
 */
export function getScoreColor(score) {
  if (score >= 80) return 'text-success-500'
  if (score >= 60) return 'text-primary-500'
  if (score >= 40) return 'text-warning-500'
  return 'text-danger-500'
}

/**
 * Check if two arrays have common items
 */
export function hasCommonItems(arr1, arr2) {
  if (!arr1 || !arr2) return false
  return arr1.some((item) => arr2.includes(item))
}

/**
 * Get common items between two arrays
 */
export function getCommonItems(arr1, arr2) {
  if (!arr1 || !arr2) return []
  return arr1.filter((item) => arr2.includes(item))
}

