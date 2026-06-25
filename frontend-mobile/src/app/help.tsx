import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Linking, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';

interface Hotline {
  name: string;
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Faq {
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];

  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const hotlines: Hotline[] = [
    { name: 'Panggilan Darurat Nasional', number: '112', icon: 'call-outline' },
    { name: 'Polisi', number: '110', icon: 'shield-outline' },
    { name: 'Ambulans', number: '118', icon: 'medical-outline' },
    { name: 'Pemadam Kebakaran', number: '113', icon: 'flame-outline' },
    { name: 'PLN (Gangguan Listrik)', number: '123', icon: 'flash-outline' },
  ];

  const faqs: Faq[] = [
    {
      question: 'Bagaimana cara kerja Lalapor!?',
      answer: 'Lalapor! bekerja dengan menerima aduan dari masyarakat, kemudian kami akan meneruskannya ke instansi yang berwenang untuk ditindaklanjuti. Anda dapat memantau status aduan Anda melalui dashboard.'
    },
    {
      question: 'Berapa lama batas waktu peninjauan laporan?',
      answer: 'Laporan biasanya ditinjau dalam waktu kurang dari 24 jam. Jika laporan Anda bersifat darurat, kami menyarankan untuk menghubungi nomor hotline darurat langsung.'
    },
    {
      question: 'Apakah data pribadi saya aman?',
      answer: 'Ya, kami menjamin keamanan data pribadi Anda. Data pelapor dienkripsi dan hanya dapat diakses oleh petugas yang berwenang untuk keperluan tindak lanjut aduan.'
    }
  ];

  const handleCopy = async (number: string) => {
    try {
      await Clipboard.setStringAsync(number);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      Alert.alert('Gagal', 'Gagal menyalin nomor telepon.');
    }
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(err => {
      console.error('Failed to call', err);
      Alert.alert('Gagal', 'Perangkat tidak mendukung panggilan telepon langsung.');
    });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bantuan & Darurat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Bantuan & Nomor Darurat</Text>
          <Text style={[styles.mainSubtitle, { color: colors.textMuted }]}>
            Temukan informasi hotline penting dan jawaban atas pertanyaan umum seputar Lalapor!
          </Text>
        </View>

        {/* Hotlines */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="phone-portrait-outline" size={16} color={colors.primary} /> Hotline Darurat
          </Text>
          
          <View style={{ gap: 12 }}>
            {hotlines.map((hotline, idx) => (
              <View key={idx} style={[styles.hotlineCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
                <View style={styles.hotlineLeft}>
                  <View style={[styles.iconWrapper, { backgroundColor: colors.primaryGlow }]}>
                    <Ionicons name={hotline.icon} size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.hotlineName, { color: colors.text }]}>{hotline.name}</Text>
                    <Text style={[styles.hotlineNumber, { color: colors.primary }]}>{hotline.number}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceHover, borderColor: colors.border }]}
                    onPress={() => handleCopy(hotline.number)}
                  >
                    <Ionicons
                      name={copiedNumber === hotline.number ? 'checkmark-circle' : 'copy-outline'}
                      size={18}
                      color={copiedNumber === hotline.number ? colors.success : colors.text}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleCall(hotline.number)}
                  >
                    <Ionicons name="call" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pertanyaan Umum (FAQ)</Text>
          
          <View style={{ gap: 12 }}>
            {faqs.map((faq, idx) => (
              <View key={idx} style={[styles.faqCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                  <Ionicons
                    name={openFaq === idx ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                
                {openFaq === idx && (
                  <View style={[styles.faqBody, { borderTopColor: colors.bgSurfaceHover }]}>
                    <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  titleSection: {
    alignItems: 'center',
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  hotlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineName: {
    fontSize: 13,
    fontWeight: '700',
  },
  hotlineNumber: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  faqCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    paddingRight: 12,
  },
  faqBody: {
    padding: 16,
    borderTopWidth: 1,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 18,
  },
});
