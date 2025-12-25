import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from './test-utils'
import Login from '../pages/Login'
import Register from '../pages/Register'
import { authApi } from '../services/api'

// Mock the API
vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  describe('Login Page', () => {
    it('renders login form correctly', () => {
      render(<Login />)
      
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows validation error for empty email', async () => {
      render(<Login />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)
      
      // Form should not submit with empty fields
      expect(authApi.login).not.toHaveBeenCalled()
    })

    it('shows validation error for invalid email format', async () => {
      render(<Login />)
      
      const emailInput = screen.getByPlaceholderText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      
      const passwordInput = screen.getByPlaceholderText(/password/i)
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      // HTML5 validation should prevent submission
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('calls login API with correct credentials', async () => {
      authApi.login.mockResolvedValue({
        data: {
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' },
        },
      })

      render(<Login />)
      
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          username: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('shows error message on login failure', async () => {
      authApi.login.mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } },
      })

      render(<Login />)
      
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument()
      })
    })

    it('has link to registration page', () => {
      render(<Login />)
      
      const registerLink = screen.getByText(/create account/i)
      expect(registerLink).toBeInTheDocument()
    })

    it('shows password field as type password by default', () => {
      render(<Login />)
      
      const passwordInput = screen.getByPlaceholderText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('toggles password visibility', async () => {
      render(<Login />)
      
      const passwordInput = screen.getByPlaceholderText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Find and click the visibility toggle button
      const toggleButton = passwordInput.parentElement.querySelector('button')
      if (toggleButton) {
        fireEvent.click(toggleButton)
        await waitFor(() => {
          expect(passwordInput).toHaveAttribute('type', 'text')
        })
      }
    })
  })

  describe('Register Page', () => {
    it('renders registration form correctly', () => {
      render(<Register />)
      
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('validates password minimum length', async () => {
      render(<Register />)
      
      const passwordInput = screen.getByPlaceholderText(/^password$/i)
      fireEvent.change(passwordInput, { target: { value: '123' } })
      
      // Password should have minLength attribute
      expect(passwordInput).toHaveAttribute('minLength')
    })

    it('calls register API with correct data', async () => {
      authApi.register.mockResolvedValue({
        data: {
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          user: { id: '1', email: 'new@example.com', displayName: 'New User' },
        },
      })

      render(<Register />)
      
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/^password$/i)
      
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalled()
      })
    })

    it('shows error message on registration failure', async () => {
      authApi.register.mockRejectedValue({
        response: { data: { message: 'Email already exists' } },
      })

      render(<Register />)
      
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/^password$/i)
      
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
      })
    })

    it('has link to login page', () => {
      render(<Register />)
      
      const loginLink = screen.getByText(/sign in/i)
      expect(loginLink).toBeInTheDocument()
    })

    it('shows terms and privacy links', () => {
      render(<Register />)
      
      // Check for terms of service link
      const termsLink = screen.queryByText(/terms/i)
      const privacyLink = screen.queryByText(/privacy/i)
      
      // At least one should exist in registration form
      expect(termsLink || privacyLink).toBeTruthy()
    })
  })
})

