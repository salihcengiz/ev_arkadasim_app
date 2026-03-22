import { useState, useEffect, useRef } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  Platform, ActivityIndicator, Keyboard, Animated
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/components';
import { messageService } from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { getTimeAgo } from '../../src/utils';
import type { Message } from '../../src/types';

interface OtherParticipant {
  id: string;
  fullName: string;
  profileImage?: string | null;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherParticipant | null>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      fetchMessages();
      markAsRead();
    }
  }, [id]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? 250 : 0,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 0,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching messages for conversation:', id);
      const response = await messageService.getMessages(id!, 1, 100);
      console.log('Messages response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        setMessages(response.data.items || []);
        
        // Get other participant from response
        const participant = (response.data as any).otherParticipant;
        console.log('Other participant:', participant);
        if (participant) {
          setOtherUser(participant);
        }
      }
    } catch (err) {
      console.log('Messages fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await messageService.markConversationAsRead(id!);
    } catch (err) {
      console.log('Mark as read error:', err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    
    if (!otherUser) {
      console.log('Other user not loaded yet');
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const response = await messageService.sendMessage(otherUser.id, messageText);
      
      if (response.success && response.data) {
        setMessages(prev => [response.data!, ...prev]);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (err) {
      console.log('Send message error:', err);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    
    return (
      <View className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View 
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            isMe 
              ? 'bg-primary-600 rounded-br-md' 
              : 'bg-secondary-100 rounded-bl-md'
          }`}
        >
          <Text className={isMe ? 'text-white' : 'text-secondary-900'}>
            {item.content}
          </Text>
          <Text 
            className={`text-xs mt-1 ${
              isMe ? 'text-primary-200' : 'text-secondary-400'
            }`}
          >
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-secondary-500 mt-2">Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-secondary-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => otherUser && router.push(`/user/${otherUser.id}`)}
          className="flex-row items-center flex-1 ml-2"
        >
          <Avatar
            name={otherUser?.fullName || 'Kullanıcı'}
            source={otherUser?.profileImage || undefined}
            size="sm"
          />
          <View className="flex-1 ml-3">
            <Text className="font-semibold text-secondary-900">
              {otherUser?.fullName || 'Yükleniyor...'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, marginBottom: keyboardOffset }}>
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          inverted
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-10">
              <Ionicons name="chatbubbles-outline" size={48} color="#94A3B8" />
              <Text className="text-secondary-500 mt-2">Henüz mesaj yok</Text>
              <Text className="text-secondary-400 text-sm">İlk mesajı siz gönderin!</Text>
            </View>
          }
        />

        {/* Input */}
        <View 
          className="flex-row items-center px-4 py-3 border-t border-secondary-100 bg-white"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <TextInput
            className="flex-1 bg-secondary-100 rounded-full px-4 py-3 text-secondary-900"
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#94A3B8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!newMessage.trim() || isSending || !otherUser}
            className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${
              newMessage.trim() && !isSending && otherUser ? 'bg-primary-600' : 'bg-secondary-200'
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={18} 
                color={newMessage.trim() && otherUser ? '#FFFFFF' : '#94A3B8'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
