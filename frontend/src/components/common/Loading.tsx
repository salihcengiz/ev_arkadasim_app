import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Yükleniyor...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        {message && (
          <Text className="mt-4 text-secondary-500 text-base">{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size="large" color="#4F46E5" />
      {message && (
        <Text className="mt-4 text-secondary-500 text-base">{message}</Text>
      )}
    </View>
  );
};
