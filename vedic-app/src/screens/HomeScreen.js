import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getProfiles } from '../api/profile';
import { getPersonalized } from '../api/astro';
import { colors, zodiacSigns } from '../utils/theme';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null);
    try {
      const { data } = await getProfiles();
      setProfiles(data.profiles || []);
      if (data.profiles?.length > 0) {
        const first = data.profiles[0];
        setActiveProfile(first);
        try {
          const res = await getPersonalized(first.id);
          setHoroscope(res.data);
        } catch {
          // personalized horoscope is optional, don't block the whole screen
        }
      }
    } catch (e) {
      const msg = e.code === 'ECONNABORTED'
        ? 'Server is starting up. Pull down to refresh.'
        : 'Unable to load data. Pull down to refresh.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <LoadingSpinner message="Reading the stars..." />;

  return (
    <LinearGradient colors={['#0d0d2b', '#1a0a3d']} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste, {user?.name || 'Seeker'} 🙏</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* No profile CTA */}
        {!error && profiles.length === 0 && (
          <TouchableOpacity style={styles.ctaCard} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.ctaIcon}>✨</Text>
            <Text style={styles.ctaTitle}>Set Up Your Profile</Text>
            <Text style={styles.ctaText}>Add your birth details to get personalized horoscope</Text>
          </TouchableOpacity>
        )}

        {/* Personalized Horoscope */}
        {horoscope && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Personalized Reading</Text>
            <Text style={styles.profileName}>For: {activeProfile?.profile_name}</Text>
            <Text style={styles.horoscopeText}>{horoscope.horoscope || horoscope.content || horoscope.prediction || horoscope.message || ''}</Text>
          </View>
        )}

        {/* Zodiac Grid */}
        <Text style={styles.sectionTitle}>Zodiac Signs</Text>
        <View style={styles.zodiacGrid}>
          {zodiacSigns.map((sign) => (
            <TouchableOpacity
              key={sign.name}
              style={styles.zodiacCard}
              onPress={() => navigation.navigate('Horoscope', { sign })}
            >
              <Text style={styles.zodiacSymbol}>{sign.symbol}</Text>
              <Text style={styles.zodiacName}>{sign.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Panchang')}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Panchang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Profiles</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20, marginBottom: 24 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.textMuted, fontSize: 12 },
  ctaCard: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.primary, marginBottom: 20 },
  ctaIcon: { fontSize: 40, marginBottom: 8 },
  ctaTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  ctaText: { color: colors.textMuted, textAlign: 'center', fontSize: 13 },
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gold, marginBottom: 4 },
  profileName: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  horoscopeText: { color: colors.text, fontSize: 14, lineHeight: 22 },
  errorBanner: { backgroundColor: '#2d1a1a', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 12, marginTop: 8 },
  zodiacGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  zodiacCard: { width: '22%', backgroundColor: colors.bgCard, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  zodiacSymbol: { fontSize: 22, marginBottom: 4 },
  zodiacName: { color: colors.textMuted, fontSize: 10 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionText: { color: colors.text, fontSize: 13, fontWeight: '500' },
});
