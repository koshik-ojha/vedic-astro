import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getVedicPanchang } from '../api/astro';
import { colors } from '../utils/theme';
import LoadingSpinner from '../components/LoadingSpinner';

const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.2090;
const DEFAULT_TZ = 'Asia/Kolkata';

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

export default function PanchangScreen() {
  const [panchang, setPanchang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPanchang = async () => {
    try {
      const { data } = await getVedicPanchang(DEFAULT_LAT, DEFAULT_LON, DEFAULT_TZ);
      setPanchang(data);
    } catch (e) {
      console.log('Panchang error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPanchang(); }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <LoadingSpinner message="Calculating panchang..." />;

  return (
    <LinearGradient colors={['#0d0d2b', '#1a0a3d']} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPanchang(); }} tintColor={colors.primary} />}
      >
        <Text style={styles.header}>Today's Panchang</Text>
        <Text style={styles.date}>{today}</Text>

        {panchang ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Panch Tatva</Text>
              <InfoRow label="Tithi" value={panchang.tithi} />
              <InfoRow label="Nakshatra" value={panchang.nakshatra} />
              <InfoRow label="Yoga" value={panchang.yoga} />
              <InfoRow label="Karana" value={panchang.karana} />
              <InfoRow label="Vara (Day)" value={panchang.vara || panchang.weekday} />
            </View>

            {panchang.sunrise && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Timings</Text>
                <InfoRow label="Sunrise" value={panchang.sunrise} />
                <InfoRow label="Sunset" value={panchang.sunset} />
                {panchang.moonrise && <InfoRow label="Moonrise" value={panchang.moonrise} />}
                {panchang.moonset && <InfoRow label="Moonset" value={panchang.moonset} />}
              </View>
            )}

            {panchang.choghadiya && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Choghadiya</Text>
                {Object.entries(panchang.choghadiya).map(([key, val]) => (
                  <InfoRow key={key} label={key} value={typeof val === 'object' ? JSON.stringify(val) : val} />
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.error}>Unable to fetch panchang data.</Text>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: colors.text, paddingTop: 16, marginBottom: 4 },
  date: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.gold, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.bgCardLight },
  rowLabel: { color: colors.textMuted, fontSize: 13, flex: 1 },
  rowValue: { color: colors.text, fontSize: 13, fontWeight: '500', flex: 1, textAlign: 'right' },
  error: { color: colors.error, textAlign: 'center', marginTop: 40 },
});
