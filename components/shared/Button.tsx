import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  // Define base styles
  const baseStyles = `
    font-family: inherit;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Define variant styles
  const variantStyles = {
    primary: `
      background-color: var(--primary-color);
      color: white;
      border: none;
      &:hover:not(:disabled) {
        background-color: #3D53D9;
      }
    `,
    secondary: `
      background-color: var(--bg-secondary);
      color: var(--text-color);
      border: 1px solid var(--card-border);
      &:hover:not(:disabled) {
        background-color: var(--bg-tertiary);
      }
    `,
    outline: `
      background-color: transparent;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
      &:hover:not(:disabled) {
        background-color: rgba(75, 102, 243, 0.1);
      }
    `,
  };
  
  // Define size styles
  const sizeStyles = {
    small: `
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    `,
    medium: `
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    `,
    large: `
      padding: 1rem 2rem;
      font-size: 1.125rem;
    `,
  };
  
  // Define disabled styles
  const disabledStyles = `
    opacity: 0.6;
    cursor: not-allowed;
  `;
  
  // Define full width styles
  const fullWidthStyles = `
    width: 100%;
  `;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${className}`}
    >
      {children}
      
      <style jsx>{`
        .button {
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${disabled ? disabledStyles : ''}
          ${fullWidth ? fullWidthStyles : ''}
        }
      `}</style>
    </button>
  );
};

export default Button; 