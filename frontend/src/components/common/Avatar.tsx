import React from 'react';
import { View, Image, Text } from 'react-native';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0]?.slice(0, 2).toUpperCase() || '?';
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        className={`${sizeStyles[size]} rounded-full ${className || ''}`}
      />
    );
  }

  return (
    <View
      className={`${sizeStyles[size]} rounded-full bg-primary-100 items-center justify-center ${className || ''}`}
    >
      <Text className={`${textSizeStyles[size]} font-semibold text-primary-600`}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
};
