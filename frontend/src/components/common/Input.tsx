import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? 'border-error-500'
    : isFocused
    ? 'border-primary-500'
    : 'border-secondary-200';

  return (
    <View className={`mb-4 ${className || ''}`}>
      {label && (
        <Text className="text-secondary-700 font-medium mb-2 text-sm">
          {label}
        </Text>
      )}
      
      <View
        className={`flex-row items-center bg-white border-2 rounded-xl px-4 ${borderColor}`}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? '#EF4444' : isFocused ? '#4F46E5' : '#94A3B8'}
            style={{ marginRight: 12 }}
          />
        )}
        
        <TextInput
          className="flex-1 py-3 text-secondary-900 text-base"
          placeholderTextColor="#94A3B8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon} size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-error-500 text-xs mt-1">{error}</Text>
      )}
      
      {hint && !error && (
        <Text className="text-secondary-400 text-xs mt-1">{hint}</Text>
      )}
    </View>
  );
};
