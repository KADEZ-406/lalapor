import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, useColorScheme, Platform, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import MyMapView from '@/components/MyMapView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  image: string | null;
  created_at: string;
  latitude?: string;
  longitude?: string;
  comments?: any[];
  category?: { name: string };
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function LaporanListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];
  const isFirstMount = useRef(true);

  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Web Alignment Features state
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/laporan/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const fetchLaporan = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await api.get('/laporan', {
        params: {
          page: pageNum,
          limit: 10,
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });
      const newReports = res.data.data;
      if (isRefresh || pageNum === 1) {
        setLaporanList(newReports);
      } else {
        setLaporanList(prev => [...prev, ...newReports]);
      }
      const pagination = res.data.pagination;
      setHasMore(pageNum < pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch laporan', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      if (isFirstMount.current) {
        isFirstMount.current = false;
        fetchStats();
        return;
      }
      fetchStats();
      fetchLaporan(1, false);
    }, [user, fetchStats, fetchLaporan])
  );

  useEffect(() => {
    if (!user) return;
    const delayDebounceFn = setTimeout(() => {
      fetchLaporan(1, false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [user, search, statusFilter, fetchLaporan]);

  const handleRefresh = async () => {
    await Promise.all([fetchStats(), fetchLaporan(1, true)]);
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

  // Donut SVG Calculation
  const totalCount = stats.total;
  const approvedCount = stats.approved;
  const pendingCount = stats.pending;
  const rejectedCount = stats.rejected;
  const resolutionRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (resolutionRate / 100) * circumference;

  const renderItem = ({ item }: { item: Laporan }) => {
    const imageUrl = item.image
      ? item.image.startsWith('http')
        ? item.image
        : `${api.defaults.baseURL?.replace('/api', '')}${item.image}`
      : null;

    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}
        onPress={() => router.push(`/laporan/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {new Date(item.created_at).toLocaleDateString('id-ID')}
          </Text>
        </View>

        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardDescription, { color: colors.textMuted }]} numberOfLines={2}>
          {item.description}
        </Text>

        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
        )}

        <View style={[styles.cardFooter, { borderTopColor: colors.bgSurfaceHover }]}>
          <View style={styles.commentCount}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.commentCountText, { color: colors.textMuted }]}>
              {item.comments?.length || 0} Tanggapan
            </Text>
          </View>
          <Text style={[styles.detailLink, { color: colors.primary }]}>Detail →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const loadMore = () => {
    if (!loading && !refreshing && !loadingMore && hasMore) {
      fetchLaporan(page + 1, false);
    }
  };

  const renderHeader = () => {
    return (
      <View style={{ marginBottom: 10 }}>
        {/* Welcome Banner */}
        <LinearGradient
          colors={colorScheme === 'light' ? ['#ffffff', '#eef2ff'] : ['#111827', '#1e1b4b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.welcomeBanner, { borderColor: colors.border }]}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Portal Aduan Lalapor!</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textMuted }]}>
              Halo, <Text style={{ fontWeight: '700', color: colors.primary }}>{user?.name || 'Masyarakat'}</Text>.
              Pantau aduan teraktif atau laporkan kendala fasilitas di sekitar Anda.
            </Text>
            {user?.role === 'user' && (
              <TouchableOpacity
                style={[styles.bannerBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/tambah')}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.bannerBtnText}>Buat Laporan</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.viewModeBtn, { backgroundColor: viewMode === 'map' ? colors.primary : colors.bgSurface, borderColor: colors.border }]}
            onPress={() => setViewMode(v => v === 'card' ? 'map' : 'card')}
          >
            <Ionicons 
              name={viewMode === 'map' ? 'grid-outline' : 'map-outline'} 
              size={18} 
              color={viewMode === 'map' ? '#fff' : colors.text} 
            />
            <Text style={[styles.viewModeBtnText, { color: viewMode === 'map' ? '#fff' : colors.text }]}>
              {viewMode === 'map' ? 'Card' : 'Peta'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Accordion Kinerja & Statistik */}
        <TouchableOpacity
          style={[styles.statsAccordionHeader, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}
          onPress={() => setIsStatsExpanded(!isStatsExpanded)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="stats-chart-outline" size={20} color={colors.primary} />
            <Text style={[styles.statsAccordionTitle, { color: colors.text }]}>Kinerja & Distribusi Sistem</Text>
          </View>
          <Ionicons name={isStatsExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {isStatsExpanded && (
          <View style={[styles.statsContainer, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
            {/* Donut chart & Summary */}
            <View style={styles.donutRow}>
              <View style={styles.donutWrapper}>
                <Svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="transparent"
                    stroke={colors.border}
                    strokeWidth="6"
                  />
                  <Circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="transparent"
                    stroke={colors.primary}
                    strokeWidth="6"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </Svg>
                <View style={styles.donutCenterText}>
                  <Text style={[styles.donutPercent, { color: colors.text }]}>{resolutionRate}%</Text>
                  <Text style={[styles.donutLabel, { color: colors.textMuted }]}>Selesai</Text>
                </View>
              </View>

              <View style={{ flex: 1, paddingLeft: 16 }}>
                <Text style={[styles.statsOverviewTitle, { color: colors.text }]}>Kinerja Sistem</Text>
                <Text style={[styles.statsOverviewDesc, { color: colors.textMuted }]}>
                  Tingkat penyelesaian pengaduan masyarakat yang disetujui secara transparan.
                </Text>
              </View>
            </View>

            {/* Distribution stats */}
            <View style={styles.statsBreakdown}>
              <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Distribusi Aduan</Text>
              
              {/* Approved Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
                    <Text style={[styles.progressBarLabel, { color: colors.badgeApprovedText }]}>Diterima / Selesai</Text>
                  </View>
                  <Text style={[styles.progressBarValue, { color: colors.text }]}>{approvedCount}</Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: colors.bgSurfaceHover }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: '#10b981', width: `${totalCount > 0 ? (approvedCount / totalCount) * 100 : 0}%` }]} />
                </View>
              </View>

              {/* Pending Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="alert-circle-outline" size={14} color="#f59e0b" />
                    <Text style={[styles.progressBarLabel, { color: colors.badgePendingText }]}>Menunggu Proses</Text>
                  </View>
                  <Text style={[styles.progressBarValue, { color: colors.text }]}>{pendingCount}</Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: colors.bgSurfaceHover }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: '#f59e0b', width: `${totalCount > 0 ? (pendingCount / totalCount) * 100 : 0}%` }]} />
                </View>
              </View>

              {/* Rejected Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="close-circle-outline" size={14} color="#ef4444" />
                    <Text style={[styles.progressBarLabel, { color: colors.badgeRejectedText }]}>Ditolak</Text>
                  </View>
                  <Text style={[styles.progressBarValue, { color: colors.text }]}>{rejectedCount}</Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: colors.bgSurfaceHover }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: '#ef4444', width: `${totalCount > 0 ? (rejectedCount / totalCount) * 100 : 0}%` }]} />
                </View>
              </View>
            </View>

            {/* Alur Kerja */}
            <View style={[styles.timelineSection, { borderTopColor: colors.bgSurfaceHover }]}>
              <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Alur Kerja Pengaduan</Text>
              
              <View style={styles.timelineRow}>
                <View style={[styles.timelineNode, { backgroundColor: colors.primary }]}>
                  <Text style={styles.timelineNodeText}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>Kirim Aduan</Text>
                  <Text style={[styles.timelineDesc, { color: colors.textMuted }]}>Isi judul, deskripsi, kategori, sertakan foto & lokasi pin maps.</Text>
                </View>
              </View>

              <View style={styles.timelineRow}>
                <View style={[styles.timelineNode, { backgroundColor: colors.primary }]}>
                  <Text style={styles.timelineNodeText}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>Verifikasi Data</Text>
                  <Text style={[styles.timelineDesc, { color: colors.textMuted }]}>Petugas meninjau laporan Anda untuk dicocokkan & disetujui.</Text>
                </View>
              </View>

              <View style={styles.timelineRow}>
                <View style={[styles.timelineNode, { backgroundColor: colors.success }]}>
                  <Text style={styles.timelineNodeText}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>Lapangan Ditangani</Text>
                  <Text style={[styles.timelineDesc, { color: colors.textMuted }]}>Instansi terkait melakukan tindakan lapangan hingga laporan selesai.</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Filter Section */}
        <View style={[styles.filterSection, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Cari judul laporan..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.tabButton,
                  { backgroundColor: colors.bgSurfaceHover },
                  statusFilter === filter && { backgroundColor: colors.primary },
                ]}
                onPress={() => setStatusFilter(filter)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: colors.textMuted },
                    statusFilter === filter && { color: '#fff' },
                  ]}
                >
                  {filter === 'all'
                    ? 'Semua'
                    : filter === 'pending'
                    ? 'Proses'
                    : filter === 'approved'
                    ? 'Diterima'
                    : 'Ditolak'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  if (viewMode === 'map') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        <View style={{ flex: 1, overflow: 'hidden', borderRadius: 12, margin: 16, borderWidth: 1, borderColor: colors.border }}>
          <MyMapView
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: -6.200000,
              longitude: 106.816666,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            markers={laporanList
              .filter(item => item.latitude && item.longitude)
              .map(item => {
                const lat = parseFloat(item.latitude!);
                const lng = parseFloat(item.longitude!);
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return {
                  id: item.id,
                  latitude: lat,
                  longitude: lng,
                  pinColor: item.status === 'approved' ? '#10b981' : item.status === 'rejected' ? '#ef4444' : '#f59e0b',
                  title: item.title,
                  description: item.description,
                  onCalloutPress: () => router.push(`/laporan/${item.id}`),
                };
              })
              .filter(item => item !== null) as any
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Memuat data laporan...</Text>
        </View>
      ) : (
        <FlatList
          data={laporanList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Tidak ada laporan ditemukan</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  welcomeBanner: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  bannerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  viewModeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  statsAccordionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  donutWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenterText: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutPercent: {
    fontSize: 15,
    fontWeight: '800',
  },
  donutLabel: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsOverviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsOverviewDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  statsBreakdown: {
    paddingVertical: 12,
    gap: 12,
  },
  statsSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  progressBarWrapper: {
    gap: 4,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  timelineSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineNodeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  filterSection: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginRight: 8,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCountText: {
    marginLeft: 6,
    fontSize: 12,
  },
  detailLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
