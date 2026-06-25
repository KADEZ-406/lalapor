import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LOCAL_PC_IP = '192.168.1.4'; // Configured automatically based on active Wi-Fi adapter

const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // Emulator Android mendeteksi host PC di IP 10.0.2.2
    return 'http://10.0.2.2:5000/api';
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  // Simulator iOS atau default fallback
  return `http://${LOCAL_PC_IP}:5000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
