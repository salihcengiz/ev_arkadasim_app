import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  className,
}) => {
  const variantStyles = {
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
  };

  const textVariantStyles = {
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View
      className={`rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
    >
      <Text
        className={`font-medium ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
      >
        {label}
      </Text>
    </View>
  );
};
