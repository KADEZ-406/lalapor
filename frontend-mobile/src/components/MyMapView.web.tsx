import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

export interface MapMarkerData {
  id: string | number;
  latitude: number;
  longitude: number;
  pinColor?: string;
  title?: string;
  description?: string;
  onCalloutPress?: () => void;
}

export interface MyMapViewProps {
  style?: any;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  markers?: MapMarkerData[];
}

export default function MyMapView({ style }: MyMapViewProps) {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, style, { backgroundColor: colors.bgSurfaceHover, borderColor: colors.border }]}>
      <Ionicons name="map-outline" size={48} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>Peta Interaktif</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Peta interaktif tidak tersedia di browser web. Silakan buka aplikasi Lalapor! pada perangkat seluler Android atau iOS Anda untuk memantau lokasi pengaduan secara interaktif.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderRadius: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
});
