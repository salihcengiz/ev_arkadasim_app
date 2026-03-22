import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, EmptyState } from '../../src/components';
import { messageService } from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { getTimeAgo } from '../../src/utils';
import type { Conversation } from '../../src/types';

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = useCallback(async (showRefresh = false) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await messageService.getConversations();
      
      if (response.success && response.data) {
        setConversations(response.data);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.log('Conversations fetch error:', err);
      setConversations([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  // Her ekrana geldiğinde yenile
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const onRefresh = () => {
    fetchConversations(true);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const participant = item.participant;
    if (!participant) return null;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.id}`)}
        className={`flex-row items-center px-6 py-4 ${
          item.unreadCount > 0 ? 'bg-primary-50' : 'bg-white'
        }`}
      >
        <Avatar
          name={participant.fullName || 'Kullanıcı'}
          source={participant.profileImage || undefined}
          size="md"
        />
        <View className="flex-1 ml-4">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-base ${
                item.unreadCount > 0 ? 'font-bold text-secondary-900' : 'font-medium text-secondary-800'
              }`}
            >
              {participant.fullName || 'Kullanıcı'}
            </Text>
            {item.lastMessage && (
              <Text className="text-secondary-400 text-xs">
                {getTimeAgo(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text
              className={`flex-1 ${
                item.unreadCount > 0 ? 'text-secondary-700 font-medium' : 'text-secondary-500'
              }`}
              numberOfLines={1}
            >
              {item.lastMessage?.content || 'Henüz mesaj yok'}
            </Text>
            {item.unreadCount > 0 && (
              <View className="bg-primary-600 rounded-full w-5 h-5 items-center justify-center ml-2">
                <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ItemSeparator = () => <View className="h-px bg-secondary-100 ml-20" />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-6 pt-4 pb-4 border-b border-secondary-100">
          <Text className="text-2xl font-bold text-secondary-900">Mesajlar</Text>
        </View>
        <EmptyState
          icon="log-in-outline"
          title="Giriş Yapın"
          description="Mesajlarınızı görmek için giriş yapmalısınız."
          actionLabel="Giriş Yap"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 border-b border-secondary-100">
        <Text className="text-2xl font-bold text-secondary-900">Mesajlar</Text>
      </View>

      {/* Conversations */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-secondary-500 mt-2">Yükleniyor...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Henüz Mesaj Yok"
          description="İlanlarla ilgilendiğinizde burada mesajlarınızı göreceksiniz."
          actionLabel="İlanları Keşfet"
          onAction={() => router.push('/(tabs)/search')}
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={ItemSeparator}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
