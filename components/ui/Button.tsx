import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 transition-all duration-300 font-sans tracking-wide text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-gold-600 shadow-md hover:shadow-lg",
    secondary: "bg-gold-500 text-white hover:bg-gold-600 shadow-md",
    outline: "border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white",
    ghost: "text-navy-900 hover:text-gold-600 bg-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
