import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

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

export default function MyMapView({
  style,
  initialRegion,
  scrollEnabled = true,
  zoomEnabled = true,
  markers = [],
}: MyMapViewProps) {
  return (
    <MapView
      style={style || { width: '100%', height: '100%' }}
      initialRegion={initialRegion}
      scrollEnabled={scrollEnabled}
      zoomEnabled={zoomEnabled}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          pinColor={marker.pinColor || '#ef4444'}
        >
          {marker.title || marker.description ? (
            <Callout onPress={marker.onCalloutPress}>
              <View style={styles.calloutContainer}>
                {marker.title ? <Text style={styles.calloutTitle}>{marker.title}</Text> : null}
                {marker.description ? (
                  <Text style={styles.calloutDesc} numberOfLines={2}>
                    {marker.description}
                  </Text>
                ) : null}
                {marker.onCalloutPress ? (
                  <Text style={styles.calloutLink}>Lihat Detail →</Text>
                ) : null}
              </View>
            </Callout>
          ) : null}
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    padding: 8,
    maxWidth: 200,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#0f172a',
  },
  calloutDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  calloutLink: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginTop: 6,
  },
});
