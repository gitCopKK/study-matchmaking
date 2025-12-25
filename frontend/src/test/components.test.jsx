import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

describe('UI Components', () => {
  describe('Avatar Component', () => {
    it('renders with initials when no image provided', () => {
      render(<Avatar name="John Doe" />)
      
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders with first letter when single name', () => {
      render(<Avatar name="John" />)
      
      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('handles empty name gracefully', () => {
      render(<Avatar name="" />)
      
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('handles undefined name gracefully', () => {
      render(<Avatar />)
      
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('applies custom size classes', () => {
      const { container } = render(<Avatar name="Test" size="lg" />)
      
      expect(container.firstChild).toHaveClass('w-12', 'h-12')
    })

    it('applies custom size classes for small', () => {
      const { container } = render(<Avatar name="Test" size="sm" />)
      
      expect(container.firstChild).toHaveClass('w-8', 'h-8')
    })

    it('shows online indicator when online prop is true', () => {
      const { container } = render(<Avatar name="Test" online={true} />)
      
      const onlineIndicator = container.querySelector('.bg-green-500')
      expect(onlineIndicator).toBeTruthy()
    })

    it('hides online indicator when offline', () => {
      const { container } = render(<Avatar name="Test" online={false} />)
      
      const onlineIndicator = container.querySelector('.bg-green-500')
      expect(onlineIndicator).toBeFalsy()
    })
  })

  describe('Badge Component', () => {
    it('renders badge with emoji and name', () => {
      render(<Badge emoji="🏆" name="Winner" />)
      
      expect(screen.getByText('🏆')).toBeInTheDocument()
      expect(screen.getByText('Winner')).toBeInTheDocument()
    })

    it('renders badge description when provided', () => {
      render(<Badge emoji="🌟" name="Star" description="You earned a star!" />)
      
      expect(screen.getByText('You earned a star!')).toBeInTheDocument()
    })

    it('shows earned state styling', () => {
      const { container } = render(<Badge emoji="🎯" name="Target" earned={true} />)
      
      // Earned badges should have different styling
      expect(container.firstChild).not.toHaveClass('opacity-50')
    })

    it('shows unearned state styling', () => {
      const { container } = render(<Badge emoji="🎯" name="Target" earned={false} />)
      
      // Unearned badges should be dimmed
      expect(container.firstChild).toHaveClass('opacity-50')
    })

    it('renders progress bar when progress prop provided', () => {
      const { container } = render(<Badge emoji="📚" name="Reader" progress={50} />)
      
      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toBeTruthy()
    })
  })

  describe('LoadingSpinner Component', () => {
    it('renders spinner with default size', () => {
      const { container } = render(<LoadingSpinner />)
      
      expect(container.querySelector('.animate-spin')).toBeTruthy()
    })

    it('renders spinner with custom size', () => {
      const { container } = render(<LoadingSpinner size="lg" />)
      
      expect(container.firstChild).toHaveClass('w-12', 'h-12')
    })

    it('renders spinner with small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />)
      
      expect(container.firstChild).toHaveClass('w-4', 'h-4')
    })

    it('applies custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Modal Component', () => {
    const onClose = vi.fn()

    it('renders modal when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={onClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={onClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    })

    it('calls onClose when close button clicked', () => {
      render(
        <Modal isOpen={true} onClose={onClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const closeButton = screen.getByRole('button')
      fireEvent.click(closeButton)
      
      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when backdrop clicked', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      // Click the backdrop (the outer container)
      const backdrop = container.querySelector('.fixed.inset-0')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalled()
      }
    })

    it('renders with different sizes', () => {
      const { rerender, container } = render(
        <Modal isOpen={true} onClose={onClose} title="Small Modal" size="sm">
          <p>Content</p>
        </Modal>
      )
      
      expect(container.querySelector('.max-w-sm')).toBeTruthy()
      
      rerender(
        <Modal isOpen={true} onClose={onClose} title="Large Modal" size="lg">
          <p>Content</p>
        </Modal>
      )
      
      expect(container.querySelector('.max-w-2xl')).toBeTruthy()
    })

    it('renders children correctly', () => {
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <div data-testid="custom-content">
            <button>Action Button</button>
          </div>
        </Modal>
      )
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
    })
  })
})

