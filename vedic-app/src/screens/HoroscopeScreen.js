import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSunSignHoroscope } from '../api/astro';
import { colors } from '../utils/theme';
import LoadingSpinner from '../components/LoadingSpinner';

const PERIODS = ['daily', 'weekly', 'monthly'];

export default function HoroscopeScreen({ route }) {
  const { sign } = route.params;
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHoroscope = async (p) => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const { data: res } = await getSunSignHoroscope(sign.name.toLowerCase(), p);
      setData(res);
    } catch (e) {
      setError(e.code === 'ECONNABORTED' ? 'Server is starting up, please try again.' : 'Unable to fetch horoscope. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHoroscope(period); }, [period]);

  return (
    <LinearGradient colors={['#0d0d2b', '#1a0a3d']} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Sign Header */}
        <View style={styles.signHeader}>
          <Text style={styles.signSymbol}>{sign.symbol}</Text>
          <Text style={styles.signName}>{sign.name}</Text>
          <Text style={styles.signDates}>{sign.dates}</Text>
        </View>

        {/* Period Tabs */}
        <View style={styles.tabs}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.tab, period === p && styles.tabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Consulting the stars..." />
        ) : data ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{period.charAt(0).toUpperCase() + period.slice(1)} Horoscope</Text>
            <Text style={styles.content}>{data.horoscope || data.content || data.prediction || data.message || ''}</Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={styles.error}>{error || 'Unable to fetch horoscope.'}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchHoroscope(period)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  signHeader: { alignItems: 'center', paddingTop: 16, marginBottom: 24 },
  signSymbol: { fontSize: 64, marginBottom: 8 },
  signName: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  signDates: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gold, marginBottom: 12 },
  content: { color: colors.text, fontSize: 15, lineHeight: 26 },
  error: { color: colors.error, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
});
