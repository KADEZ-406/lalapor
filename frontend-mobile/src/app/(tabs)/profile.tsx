import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, useColorScheme, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Laporan {
  id: number;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function ProfileScreen() {
  const { user, login } = useAuth();
  const router = useRouter();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];

  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchProfileData = async () => {
        if (!user?.id) return;
  
        // Fetch email and avatar from AsyncStorage if possible or decode token (but we can read stored user or fetch fresh user profile info)
        // Wait, let's fetch email from storage since context/AuthContext only stores { id, name, role } in user state.
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.email) setEmail(parsed.email);
          }
          
          const localAvatar = await AsyncStorage.getItem(`lalapor_avatar_${user.id}`);
          if (localAvatar) {
            setAvatar(localAvatar);
          }
        } catch (err) {
          console.error('Failed to load local user details', err);
        }
  
        // Fetch user's own reports list
        try {
          const res = await api.get('/laporan', { params: { user_id: user.id, limit: 100 } });
          setLaporanList(res.data.data);
        } catch (err) {
          console.error('Failed to fetch user reports', err);
        } finally {
          setLoadingReports(false);
        }
      };
  
      fetchProfileData();
    }, [user])
  );

  const pickAvatar = async () => {
    if (!user?.id) return;
    const ImagePicker = require('expo-image-picker');
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin galeri untuk memilih foto profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
      setAvatar(base64Uri);
      await AsyncStorage.setItem(`lalapor_avatar_${user.id}`, base64Uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Nama dan Email wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name, email });
      const { token, user: updatedUser } = res.data;

      // Update in context (which updates AsyncStorage 'token' and 'user')
      await login(token, { ...updatedUser, email });
      setIsEditing(false);
      Alert.alert('Sukses', 'Detail profil berhasil diperbarui.');
    } catch (err: any) {
      console.error('Failed to update profile', err);
      Alert.alert('Gagal', err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const totalReports = laporanList.length;
  const approvedReports = laporanList.filter(r => r.status === 'approved').length;
  const pendingReports = laporanList.filter(r => r.status === 'pending').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: colors.successBg, text: colors.badgeApprovedText };
      case 'rejected':
        return { backgroundColor: colors.dangerBg, text: colors.badgeRejectedText };
      default:
        return { backgroundColor: colors.warningBg, text: colors.badgePendingText };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Menunggu';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      
      {/* Profile Detail Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
        
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar} activeOpacity={0.8}>
          <View style={[styles.avatarWrapper, { borderColor: colors.border }]}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarPlaceholder, { color: colors.primary }]}>
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </Text>
            )}
            <View style={[styles.cameraOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.userName, { color: colors.text }]}>{name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.successBg }]}>
          <Text style={[styles.roleBadgeText, { color: colors.badgeApprovedText }]}>
            {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Masyarakat'}
          </Text>
        </View>

        {/* Profile Info fields */}
        <View style={[styles.infoSection, { borderTopColor: colors.bgSurfaceHover }]}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{email || 'Belum diatur'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Peran Akun</Text>
              <Text style={[styles.infoValue, { color: colors.text, textTransform: 'capitalize' }]}>{user?.role || 'User'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="trophy-outline" size={18} color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Kontribusi</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{totalReports} Laporan dikirim</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Edit Profil Card */}
      <View style={[styles.editCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Edit Detail Profil</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: colors.text }]}>Nama Pengguna</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Ionicons name="person-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={name}
              onChangeText={setName}
              editable={isEditing}
              placeholder="Nama Lengkap"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: colors.text }]}>Alamat Email</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Ionicons name="mail-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@contoh.com"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {isEditing ? (
          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]} 
              onPress={() => {
                setName(user?.name || '');
                setIsEditing(false);
              }}
            >
              <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Batal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: colors.primary }]} 
              onPress={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.btn, styles.btnSecondary, { borderColor: colors.border, width: '100%' }]} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Ubah Info Profil</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dikirim</Text>
          <Text style={[styles.statNumber, { color: colors.text }]}>{totalReports}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.badgeApprovedText }]}>Disetujui</Text>
          <Text style={[styles.statNumber, { color: colors.badgeApprovedText }]}>{approvedReports}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.badgePendingText }]}>Menunggu</Text>
          <Text style={[styles.statNumber, { color: colors.badgePendingText }]}>{pendingReports}</Text>
        </View>
      </View>

      {/* Riwayat Laporan Saya */}
      <View style={[styles.historyCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.text, marginBottom: 16 }]}>
          <Ionicons name="time-outline" size={16} color={colors.primary} /> Riwayat Laporan Saya
        </Text>

        {loadingReports ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : laporanList.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.border} />
            <Text style={[styles.emptyHistoryText, { color: colors.textMuted }]}>Anda belum pernah mengirim aduan.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {laporanList.map((item) => {
              const statusStyle = getStatusStyle(item.status);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.historyItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => router.push(`/laporan/${item.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </Text>
                    <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>

                  <View style={styles.historyRight}>
                    <View style={[styles.historyBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                      <Text style={[styles.historyBadgeText, { color: statusStyle.text }]}>
                        {getStatusText(item.status)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: 32,
    fontWeight: '800',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    marginBottom: 20,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  infoSection: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  editCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 38,
    fontSize: 13,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  historyCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyHistoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  historyDate: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
