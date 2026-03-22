import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'Hesap silme özelliği yakında eklenecek.');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Hesap',
      items: [
        {
          icon: 'person-outline',
          title: 'Profili Düzenle',
          onPress: () => router.push('/settings/edit-profile'),
        },
        {
          icon: 'lock-closed-outline',
          title: 'Şifre Değiştir',
          onPress: () => Alert.alert('Bilgi', 'Şifre değiştirme özelliği yakında eklenecek.'),
        },
        {
          icon: 'mail-outline',
          title: 'E-posta Değiştir',
          subtitle: user?.email,
          onPress: () => Alert.alert('Bilgi', 'E-posta değiştirme özelliği yakında eklenecek.'),
        },
      ],
    },
    {
      title: 'Bildirimler',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Bildirim Ayarları',
          onPress: () => Alert.alert('Bilgi', 'Bildirim ayarları yakında eklenecek.'),
        },
      ],
    },
    {
      title: 'Destek',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Yardım Merkezi',
          onPress: () => Alert.alert('Bilgi', 'Yardım merkezi yakında eklenecek.'),
        },
        {
          icon: 'document-text-outline',
          title: 'Gizlilik Politikası',
          onPress: () => Alert.alert('Bilgi', 'Gizlilik politikası yakında eklenecek.'),
        },
        {
          icon: 'newspaper-outline',
          title: 'Kullanım Koşulları',
          onPress: () => Alert.alert('Bilgi', 'Kullanım koşulları yakında eklenecek.'),
        },
      ],
    },
    {
      title: 'Tehlikeli Alan',
      items: [
        {
          icon: 'log-out-outline',
          title: 'Çıkış Yap',
          titleColor: 'text-red-500',
          onPress: handleLogout,
        },
        {
          icon: 'trash-outline',
          title: 'Hesabı Sil',
          titleColor: 'text-red-500',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-secondary-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-secondary-900 ml-2">Ayarlar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} className="mt-4">
            <Text className="px-6 text-secondary-500 text-sm font-medium mb-2">
              {section.title}
            </Text>
            <View className="bg-white">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.title}
                  onPress={item.onPress}
                  className={`flex-row items-center px-6 py-4 ${
                    itemIndex !== section.items.length - 1 ? 'border-b border-secondary-100' : ''
                  }`}
                >
                  <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center mr-4">
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={item.titleColor?.includes('red') ? '#EF4444' : '#64748B'} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-medium ${item.titleColor || 'text-secondary-800'}`}>
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text className="text-secondary-500 text-sm">{item.subtitle}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="items-center py-8">
          <Text className="text-secondary-400 text-sm">Ev Arkadaşım</Text>
          <Text className="text-secondary-300 text-xs">Versiyon 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
