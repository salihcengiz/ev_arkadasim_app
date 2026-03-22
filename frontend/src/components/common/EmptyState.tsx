import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-20 h-20 rounded-full bg-secondary-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color="#94A3B8" />
      </View>
      
      <Text className="text-xl font-semibold text-secondary-800 text-center mb-2">
        {title}
      </Text>
      
      {description && (
        <Text className="text-secondary-500 text-center mb-6">
          {description}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} />
      )}
    </View>
  );
};
