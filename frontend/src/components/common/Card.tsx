import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-2xl overflow-hidden';
  
  const variantStyles = {
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border border-secondary-200',
    filled: 'bg-secondary-50',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className || ''}`;

  if (onPress) {
    return (
      <TouchableOpacity
        className={combinedStyles}
        onPress={onPress}
        activeOpacity={0.7}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedStyles} {...props}>
      {children}
    </View>
  );
};
