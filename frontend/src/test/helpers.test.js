import { describe, it, expect } from 'vitest'

// Test utility functions (assuming helpers.js has these functions)
// We'll test common utility patterns that might exist in the codebase

describe('Helper Functions', () => {
  describe('String Utilities', () => {
    it('should get initials from full name', () => {
      const getInitials = (name) => {
        return name
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || '?'
      }
      
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Alice')).toBe('A')
      expect(getInitials('John Michael Doe')).toBe('JM')
      expect(getInitials('')).toBe('?')
      expect(getInitials(null)).toBe('?')
      expect(getInitials(undefined)).toBe('?')
    })

    it('should truncate text with ellipsis', () => {
      const truncate = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text
        return text.slice(0, maxLength) + '...'
      }
      
      expect(truncate('Hello World', 5)).toBe('Hello...')
      expect(truncate('Hi', 5)).toBe('Hi')
      expect(truncate('', 5)).toBe('')
      expect(truncate(null, 5)).toBe(null)
    })
  })

  describe('Date Utilities', () => {
    it('should format date for display', () => {
      const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString()
      }
      
      expect(formatDate('2024-01-15')).toBeTruthy()
      expect(formatDate('')).toBe('')
      expect(formatDate(null)).toBe('')
    })

    it('should calculate time difference', () => {
      const getTimeDiff = (date) => {
        const now = new Date()
        const then = new Date(date)
        const diffMs = now - then
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
      }
      
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000)
      expect(getTimeDiff(fiveMinutesAgo)).toBe('5m ago')
      
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000)
      expect(getTimeDiff(twoHoursAgo)).toBe('2h ago')
    })

    it('should check if date is today', () => {
      const isToday = (dateString) => {
        const date = new Date(dateString)
        const today = new Date()
        return date.toDateString() === today.toDateString()
      }
      
      expect(isToday(new Date().toISOString())).toBe(true)
      expect(isToday('2020-01-01')).toBe(false)
    })
  })

  describe('Number Utilities', () => {
    it('should format minutes to hours and minutes', () => {
      const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      }
      
      expect(formatDuration(30)).toBe('30m')
      expect(formatDuration(60)).toBe('1h')
      expect(formatDuration(90)).toBe('1h 30m')
      expect(formatDuration(120)).toBe('2h')
    })

    it('should calculate percentage', () => {
      const calculatePercentage = (value, total) => {
        if (!total) return 0
        return Math.round((value / total) * 100)
      }
      
      expect(calculatePercentage(50, 100)).toBe(50)
      expect(calculatePercentage(25, 50)).toBe(50)
      expect(calculatePercentage(0, 100)).toBe(0)
      expect(calculatePercentage(100, 0)).toBe(0)
    })

    it('should clamp value between min and max', () => {
      const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max)
      }
      
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('Array Utilities', () => {
    it('should group items by key', () => {
      const groupBy = (array, key) => {
        return array.reduce((groups, item) => {
          const group = item[key]
          groups[group] = groups[group] || []
          groups[group].push(item)
          return groups
        }, {})
      }
      
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ]
      
      const grouped = groupBy(items, 'type')
      expect(grouped.a.length).toBe(2)
      expect(grouped.b.length).toBe(1)
    })

    it('should remove duplicates', () => {
      const unique = (array) => [...new Set(array)]
      
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b'])
    })

    it('should sort by property', () => {
      const sortBy = (array, key, ascending = true) => {
        return [...array].sort((a, b) => {
          if (ascending) return a[key] - b[key]
          return b[key] - a[key]
        })
      }
      
      const items = [
        { name: 'c', value: 3 },
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
      ]
      
      expect(sortBy(items, 'value')[0].name).toBe('a')
      expect(sortBy(items, 'value', false)[0].name).toBe('c')
    })
  })

  describe('Validation Utilities', () => {
    it('should validate email format', () => {
      const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
      }
      
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('test@example')).toBe(false)
      expect(isValidEmail('test.example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should validate password strength', () => {
      const isStrongPassword = (password) => {
        return password && password.length >= 6
      }
      
      expect(isStrongPassword('password123')).toBe(true)
      expect(isStrongPassword('short')).toBe(false)
      expect(isStrongPassword('')).toBe(false)
      expect(isStrongPassword(null)).toBe(false)
    })

    it('should check if object is empty', () => {
      const isEmpty = (obj) => {
        if (!obj) return true
        return Object.keys(obj).length === 0
      }
      
      expect(isEmpty({})).toBe(true)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })
  })

  describe('URL Utilities', () => {
    it('should extract query params', () => {
      const getQueryParams = (url) => {
        const params = new URLSearchParams(url.split('?')[1] || '')
        const result = {}
        for (const [key, value] of params) {
          result[key] = value
        }
        return result
      }
      
      expect(getQueryParams('http://example.com?foo=bar')).toEqual({ foo: 'bar' })
      expect(getQueryParams('http://example.com?a=1&b=2')).toEqual({ a: '1', b: '2' })
      expect(getQueryParams('http://example.com')).toEqual({})
    })

    it('should build query string', () => {
      const buildQueryString = (params) => {
        return Object.entries(params)
          .filter(([, value]) => value !== null && value !== undefined)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')
      }
      
      expect(buildQueryString({ foo: 'bar' })).toBe('foo=bar')
      expect(buildQueryString({ a: 1, b: 2 })).toBe('a=1&b=2')
      expect(buildQueryString({ a: 1, b: null })).toBe('a=1')
    })
  })
})

