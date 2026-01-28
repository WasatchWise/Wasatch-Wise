/**
 * Unit tests for button components
 * Tests common button patterns used throughout the app
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock button component for testing
const TestButton = ({ 
  onClick, 
  children, 
  disabled = false,
  variant = 'primary',
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

describe('Button Components', () => {
  it('should render button with text', () => {
    render(<TestButton>Click me</TestButton>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<TestButton onClick={handleClick}>Click me</TestButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <TestButton onClick={handleClick} disabled>
        Click me
      </TestButton>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes when disabled', () => {
    render(<TestButton disabled>Disabled button</TestButton>);
    
    const button = screen.getByText('Disabled button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should apply variant classes', () => {
    const { rerender } = render(<TestButton variant="primary">Primary</TestButton>);
    
    expect(screen.getByText('Primary')).toHaveClass('btn-primary');
    
    rerender(<TestButton variant="secondary">Secondary</TestButton>);
    expect(screen.getByText('Secondary')).toHaveClass('btn-secondary');
  });
});
