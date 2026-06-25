import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function TambahLaporanScreen() {
  const router = useRouter();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategory(res.data[0]);
        }
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const pickImage = async () => {
    const ImagePicker = require('expo-image-picker');
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin galeri untuk mengunggah foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      
      const localUri = asset.uri;
      const filename = localUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      setImageFile({
        uri: localUri,
        name: filename,
        type,
      });
    }
  };

  const handleSubmitting = async () => {
    if (!title.trim() || !description.trim() || !selectedCategory) {
      Alert.alert('Error', 'Judul, Kategori, dan Deskripsi wajib diisi.');
      return;
    }

    setLoading(true);

    // Ambil GPS Koordinat perangkat
    let coords: { latitude: number; longitude: number } | null = null;
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    } catch (e) {
      console.warn('Gagal mendapatkan lokasi GPS:', e);
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category_id', selectedCategory.id.toString());

      if (coords) {
        formData.append('latitude', coords.latitude.toString());
        formData.append('longitude', coords.longitude.toString());
      }

      if (imageFile) {
        if (Platform.OS === 'web') {
          const response = await fetch(imageUri!);
          const blob = await response.blob();
          
          let ext = 'jpg';
          if (blob.type === 'image/png') ext = 'png';
          else if (blob.type === 'image/webp') ext = 'webp';
          else if (blob.type === 'image/gif') ext = 'gif';
          
          const filename = `upload-${Date.now()}.${ext}`;
          formData.append('image', blob, filename);
        } else {
          formData.append('image', imageFile as any);
        }
      }

      await api.post('/laporan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sukses', 'Laporan berhasil terkirim!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setDescription('');
            setImageUri(null);
            setImageFile(null);
            if (categories.length > 0) {
              setSelectedCategory(categories[0]);
            }
            router.push('/(tabs)');
          },
        },
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal mengirimkan laporan. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.formCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Detail Pengaduan</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Judul Laporan</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Misal: Jalan rusak berlubang..."
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
            <TouchableOpacity
              style={[styles.pickerTrigger, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.pickerTriggerText, { color: colors.text }]}>
                {selectedCategory ? selectedCategory.name : 'Pilih Kategori'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Deskripsi Pengaduan</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Jelaskan detail masalah, lokasi akurat, dan situasi saat ini..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bukti Foto</Text>
            <TouchableOpacity style={[styles.imagePickerBox, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={pickImage} activeOpacity={0.7}>
              {imageUri ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setImageFile(null); }}>
                    <Ionicons name="close-circle" size={24} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera-outline" size={36} color={colors.primary} />
                  <Text style={[styles.uploadTitle, { color: colors.primary }]}>Pilih Foto Bukti</Text>
                  <Text style={[styles.uploadSubtitle, { color: colors.textMuted }]}>Ketuk untuk membuka galeri foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && styles.submitBtnDisabled]}
            onPress={handleSubmitting}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Kirim Laporan</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.bgSurface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Kategori</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalOption,
                      { borderBottomColor: colors.border },
                      selectedCategory?.id === cat.id && [styles.modalOptionSelected, { backgroundColor: colors.primaryGlow }],
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: colors.text },
                        selectedCategory?.id === cat.id && [styles.modalOptionTextSelected, { color: colors.primary }],
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {cat.description && (
                      <Text style={[styles.modalOptionDesc, { color: colors.textMuted }]}>{cat.description}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
  },
  pickerTriggerText: {
    fontSize: 15,
    color: '#0f172a',
  },
  imagePickerBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 20,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 10,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 9999,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
