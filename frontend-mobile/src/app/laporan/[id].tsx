import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyMapView from '@/components/MyMapView';

interface UserInfo {
  id: number;
  name: string;
}

interface CategoryInfo {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: UserInfo;
}

interface LaporanDetail {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  image: string | null;
  created_at: string;
  latitude?: string;
  longitude?: string;
  user: UserInfo;
  category: CategoryInfo;
  comments: Comment[];
}

export default function LaporanDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];
  
  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitCommentLoading, setSubmitCommentLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Upvote features
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const ticketId = useMemo(() => {
    if (!laporan) return '';
    return `LPR-${new Date(laporan.created_at).getFullYear()}-${laporan.id.toString().padStart(5, '0')}`;
  }, [laporan]);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get(`/laporan/${id}`);
      setLaporan(res.data);
      setUpvotes(res.data.upvotesCount || 0);
      setHasUpvoted(!!res.data.hasUpvoted);
    } catch (error) {
      console.error('Failed to fetch detail', error);
      Alert.alert('Error', 'Gagal memuat detail laporan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpvote = async () => {
    if (!laporan) return;
    try {
      const res = await api.post(`/laporan/${laporan.id}/upvote`);
      setUpvotes(res.data.upvotesCount);
      setHasUpvoted(res.data.hasUpvoted);
    } catch (err) {
      console.error('Failed to upvote', err);
      Alert.alert('Error', 'Gagal mengirimkan dukungan.');
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !laporan) return;

    setSubmitCommentLoading(true);
    try {
      const res = await api.post(`/laporan/${laporan.id}/comments`, {
        content: commentText,
      });

      const newComment: Comment = {
        id: res.data.data.id,
        content: commentText,
        created_at: new Date().toISOString(),
        user: {
          id: user?.id || 0,
          name: user?.name || 'Anda',
        },
      };

      setLaporan({
        ...laporan,
        comments: [...laporan.comments, newComment],
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment', error);
      Alert.alert('Gagal', 'Gagal mengirimkan tanggapan.');
    } finally {
      setSubmitCommentLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    if (!laporan) return;

    setStatusUpdateLoading(true);
    try {
      await api.patch(`/laporan/${laporan.id}/status`, { status: newStatus });
      setLaporan({
        ...laporan,
        status: newStatus,
      });
      Alert.alert('Sukses', `Status laporan berhasil diubah menjadi ${newStatus === 'approved' ? 'Diterima' : 'Ditolak'}.`);
    } catch (error) {
      console.error('Failed to update status', error);
      Alert.alert('Gagal', 'Gagal memperbarui status laporan.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleDeleteLaporan = async () => {
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus laporan ini secara permanen?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/laporan/${id}`);
              Alert.alert('Sukses', 'Laporan berhasil dihapus.', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/(tabs)');
                  },
                },
              ]);
            } catch (error: any) {
              console.error('Failed to delete laporan', error);
              Alert.alert('Gagal', error.response?.data?.message || 'Gagal menghapus laporan.');
            }
          },
        },
      ]
    );
  };

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
        return 'DITERIMA';
      case 'rejected':
        return 'DITOLAK';
      default:
        return 'PROSES';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Memuat detail pengaduan...</Text>
      </View>
    );
  }

  if (!laporan) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Laporan tidak ditemukan.</Text>
      </View>
    );
  }

  const imageUrl = laporan.image
    ? laporan.image.startsWith('http')
      ? laporan.image
      : `${api.defaults.baseURL?.replace('/api', '')}${laporan.image}`
    : null;

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const statusStyle = getStatusStyle(laporan.status);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Detail Laporan Info Card */}
        <View style={[styles.detailCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {getStatusText(laporan.status)}
              </Text>
            </View>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{laporan.category?.name}</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{laporan.title}</Text>
          
          <View style={styles.ticketRow}>
            <Ionicons name="pricetag-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.ticketId, { color: colors.text }]}> {ticketId}</Text>
          </View>

          <View style={[styles.reporterInfo, { borderBottomColor: colors.bgSurfaceHover }]}>
            <Ionicons name="person-circle-outline" size={32} color={colors.textMuted} />
            <View style={styles.reporterMeta}>
              <Text style={[styles.reporterName, { color: colors.text }]}>{laporan.user?.name}</Text>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Upvotes (Saya Juga Mengalami) */}
          <View style={[styles.upvoteContainer, { backgroundColor: colors.bgSurfaceHover, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={handleUpvote}
              style={[styles.upvoteBtn, { backgroundColor: hasUpvoted ? colors.primary : colors.bgSurface, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={hasUpvoted ? "thumbs-up" : "thumbs-up-outline"} 
                size={18} 
                color={hasUpvoted ? '#fff' : colors.text} 
              />
              <Text style={[styles.upvoteBtnText, { color: hasUpvoted ? '#fff' : colors.text }]}>
                {hasUpvoted ? 'Dukungan Terkirim' : 'Saya Juga Mengalami'}
              </Text>
            </TouchableOpacity>
            
            <View style={{ paddingLeft: 12 }}>
              <Text style={[styles.upvotesCount, { color: colors.text }]}>{upvotes}</Text>
              <Text style={[styles.upvotesLabel, { color: colors.textMuted }]}>Warga mendukung laporan ini</Text>
            </View>
          </View>

          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.laporanImage} resizeMode="contain" />
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Deskripsi Laporan</Text>
          <Text style={[styles.description, { color: colors.text }]}>{laporan.description}</Text>
        </View>

        {/* Incident location Map view */}
        {laporan.latitude && laporan.longitude && (
          <View style={[styles.mapCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
            <Text style={[styles.mapCardTitle, { color: colors.text }]}>
              <Ionicons name="map-outline" size={16} color={colors.primary} /> Lokasi Kejadian
            </Text>
            <View style={[styles.mapWrapper, { borderColor: colors.border }]}>
              <MyMapView
                style={{ width: '100%', height: '100%' }}
                initialRegion={{
                  latitude: parseFloat(laporan.latitude),
                  longitude: parseFloat(laporan.longitude),
                  latitudeDelta: 0.0122,
                  longitudeDelta: 0.0061,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                markers={[
                  {
                    id: laporan.id,
                    latitude: parseFloat(laporan.latitude),
                    longitude: parseFloat(laporan.longitude),
                    pinColor: '#ef4444',
                  }
                ]}
              />
            </View>
            <Text style={[styles.mapCoordinates, { color: colors.textMuted }]}>
              Koordinat: {parseFloat(laporan.latitude).toFixed(6)}, {parseFloat(laporan.longitude).toFixed(6)}
            </Text>
          </View>
        )}

        {/* Khusus Admin - Tindakan status */}
        {isAdmin && (
          <View style={[styles.adminCard, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
            <Text style={[styles.adminTitle, { color: colors.primary }]}>Aksi Petugas (Admin)</Text>
            {statusUpdateLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={{ gap: 12 }}>
                <View style={styles.adminActionRow}>
                  {laporan.status !== 'approved' && (
                    <TouchableOpacity
                      style={[styles.adminBtn, styles.adminBtnApprove]}
                      onPress={() => handleUpdateStatus('approved')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={styles.adminBtnText}>Terima</Text>
                    </TouchableOpacity>
                  )}
                  {laporan.status !== 'rejected' && (
                    <TouchableOpacity
                      style={[styles.adminBtn, styles.adminBtnReject]}
                      onPress={() => handleUpdateStatus('rejected')}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#fff" />
                      <Text style={styles.adminBtnText}>Tolak</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {user?.role === 'super_admin' && (
                  <TouchableOpacity
                    style={[styles.adminBtn, styles.adminBtnDelete, { flex: 0, width: '100%' }]}
                    onPress={handleDeleteLaporan}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.adminBtnText}>Hapus Laporan</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Diskusi & Komentar */}
        <View style={[styles.commentsCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Text style={[styles.commentsTitle, { color: colors.text }]}>
            Diskusi & Tanggapan ({laporan.comments?.length || 0})
          </Text>

          <View style={styles.commentsList}>
            {laporan.comments?.length === 0 ? (
              <Text style={[styles.noCommentsText, { color: colors.textMuted }]}>Belum ada komentar.</Text>
            ) : (
              laporan.comments?.map((comment) => {
                const isBot = comment.user?.name === 'Lalapor Bot' || comment.user?.name === 'Lalapor';
                
                return (
                  <View 
                    key={comment.id} 
                    style={[
                      styles.commentItem, 
                      { 
                        backgroundColor: isBot ? colors.primaryGlow : colors.bgSurface, 
                        borderColor: isBot ? colors.primary : colors.border 
                      }
                    ]}
                  >
                    <View style={styles.commentHeader}>
                      <Text style={[styles.commentAuthor, { color: isBot ? colors.primary : colors.text }]}>
                        {comment.user?.name}
                        {isBot && (
                          <Text style={styles.botTag}> SYSTEM</Text>
                        )}
                      </Text>
                      {comment.created_at && (
                        <Text style={[styles.commentDate, { color: colors.textMuted }]}>
                          {new Date(comment.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.commentContent, { color: colors.text }]}>{comment.content}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Input Komentar */}
      <View style={[styles.commentInputContainer, { backgroundColor: colors.bgSurface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.commentInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Tulis tanggapan Anda..."
          placeholderTextColor={colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendCommentBtn, { backgroundColor: colors.primary }, !commentText.trim() && styles.sendCommentBtnDisabled]}
          onPress={handleSendComment}
          disabled={!commentText.trim() || submitCommentLoading}
        >
          {submitCommentLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
  },
  detailCard: {
    padding: 20,
    borderBottomWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 28,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketId: {
    fontSize: 13,
    fontWeight: '700',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  reporterMeta: {
    marginLeft: 10,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  upvoteBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  upvotesCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  upvotesLabel: {
    fontSize: 11,
  },
  laporanImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  mapCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  mapWrapper: {
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 8,
  },
  mapCoordinates: {
    fontSize: 11,
    fontWeight: '600',
  },
  adminCard: {
    borderWidth: 1,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 8,
    gap: 6,
  },
  adminBtnApprove: {
    backgroundColor: '#10b981',
  },
  adminBtnReject: {
    backgroundColor: '#dc2626',
  },
  adminBtnDelete: {
    backgroundColor: '#dc2626',
  },
  adminBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  commentsCard: {
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 16,
  },
  commentsList: {
    gap: 12,
  },
  noCommentsText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
  },
  commentItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
  },
  botTag: {
    fontSize: 9,
    backgroundColor: '#4f46e5',
    color: '#fff',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontWeight: '800',
  },
  commentDate: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 14,
  },
  sendCommentBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendCommentBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
