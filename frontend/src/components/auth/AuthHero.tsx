import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthHeroProps {
  image: ImageSourcePropType;
  title?: string;
  onBack?: () => void;
}

export const AuthHero: React.FC<AuthHeroProps> = ({ image, title, onBack }) => {
  const { height } = useWindowDimensions();

  return (
    <View style={{ height: height * 0.42, overflow: 'hidden' }} className="relative w-full">
      <Image source={image} className="absolute inset-0 w-full h-full" resizeMode="cover" />

      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent']}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="absolute inset-0 p-4 justify-between">
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-black/25 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {title && (
          <Text
            className="text-white text-3xl font-bold px-2 pb-6"
            style={{
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 6,
            }}
          >
            {title}
          </Text>
        )}
      </View>
    </View>
  );
};
