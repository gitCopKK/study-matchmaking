import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

describe('Context Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('AuthContext', () => {
    it('provides user state', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.user).toBe(null)
      expect(result.current.loading).toBeDefined()
    })

    it('provides login function', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(typeof result.current.login).toBe('function')
    })

    it('provides register function', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(typeof result.current.register).toBe('function')
    })

    it('provides logout function', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(typeof result.current.logout).toBe('function')
    })

    it('provides updateUser function', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(typeof result.current.updateUser).toBe('function')
    })

    it('provides refreshUser function', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(typeof result.current.refreshUser).toBe('function')
    })

    it('throws error when used outside provider', () => {
      // This test verifies the context throws when used outside provider
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })
  })

  describe('ThemeContext', () => {
    it('provides isDark state', () => {
      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>
      
      const { result } = renderHook(() => useTheme(), { wrapper })
      
      expect(typeof result.current.isDark).toBe('boolean')
    })

    it('provides toggleTheme function', () => {
      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>
      
      const { result } = renderHook(() => useTheme(), { wrapper })
      
      expect(typeof result.current.toggleTheme).toBe('function')
    })

    it('toggles dark mode', () => {
      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>
      
      const { result } = renderHook(() => useTheme(), { wrapper })
      
      const initialIsDark = result.current.isDark
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(result.current.isDark).toBe(!initialIsDark)
    })

    it('persists theme to localStorage', () => {
      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>
      
      const { result } = renderHook(() => useTheme(), { wrapper })
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('reads theme from localStorage on mount', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      
      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>
      
      renderHook(() => useTheme(), { wrapper })
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
    })
  })
})

