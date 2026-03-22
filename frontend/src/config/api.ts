import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Development modunda Expo'nun IP adresini otomatik olarak algılar.
 * Production'da ise .env'deki URL kullanılır.
 */
const getApiUrl = (): string => {
  // Production URL'i varsa onu kullan
  const productionUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // Production modunda veya production URL tanımlıysa
  if (!__DEV__ && productionUrl) {
    return productionUrl;
  }

  // Development modunda Expo'nun hostUri'sini kullan
  // hostUri formatı: "192.168.0.101:8081" şeklinde
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  
  if (debuggerHost) {
    // Port numarasını kaldır ve backend portunu ekle
    const host = debuggerHost.split(':')[0];
    const apiUrl = `http://${host}:3000/api`;
    console.log('API URL (auto-detected):', apiUrl);
    return apiUrl;
  }

  // Android Emulator için özel IP
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  // iOS Simulator veya fallback
  return 'http://localhost:3000/api';
};

export const API_URL = getApiUrl();
export const API_TIMEOUT = 10000;
