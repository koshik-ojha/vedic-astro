import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSunSignHoroscope } from '../api/astro';
import { colors, zodiacSigns } from '../utils/theme';

const PERIODS = ['daily', 'weekly', 'monthly'];

function getZodiacFromDOB(dob) {
  const parts = dob.split('-');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return null;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return null;
}

export default function QuickHoroscopeScreen() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [selectedSign, setSelectedSign] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  const handleDobChange = (text) => {
    setDob(text);
    setHoroscope(null);
    setFetched(false);
    if (text.length === 10) {
      const signName = getZodiacFromDOB(text);
      if (signName) {
        setSelectedSign(zodiacSigns.find((s) => s.name === signName) || null);
      }
    }
  };

  const handleSignSelect = (sign) => {
    setSelectedSign(sign);
    setHoroscope(null);
    setFetched(false);
    setError(null);
  };

  const fetchHoroscope = async (p, sign) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getSunSignHoroscope(sign.name.toLowerCase(), p);
      setHoroscope(data);
      setFetched(true);
    } catch (e) {
      setError(
        e.code === 'ECONNABORTED'
          ? 'Server is starting up, please try again.'
          : 'Unable to fetch horoscope. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetHoroscope = () => {
    if (!name.trim()) return Alert.alert('Missing Info', 'Please enter your name.');
    if (!selectedSign) return Alert.alert('Missing Info', 'Please select your zodiac sign.');
    fetchHoroscope(period, selectedSign);
  };

  const handlePeriodChange = (p) => {
    setPeriod(p);
    if (fetched && selectedSign) {
      fetchHoroscope(p, selectedSign);
    }
  };

  return (
    <LinearGradient colors={['#0d0d2b', '#1a0a3d']} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerIcon}>🔮</Text>
          <Text style={styles.header}>Quick Horoscope</Text>
          <Text style={styles.subtitle}>Enter your details to get your reading</Text>
        </View>

        {/* Inputs Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Priya Sharma"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD  e.g. 1995-06-21"
            placeholderTextColor={colors.textMuted}
            value={dob}
            onChangeText={handleDobChange}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          {selectedSign && dob.length === 10 && (
            <Text style={styles.detected}>
              Auto-detected: {selectedSign.symbol} {selectedSign.name}
            </Text>
          )}
        </View>

        {/* Zodiac Sign Picker */}
        <Text style={styles.sectionTitle}>Select Zodiac Sign</Text>
        <View style={styles.zodiacGrid}>
          {zodiacSigns.map((sign) => {
            const active = selectedSign?.name === sign.name;
            return (
              <TouchableOpacity
                key={sign.name}
                style={[styles.zodiacCard, active && styles.zodiacCardActive]}
                onPress={() => handleSignSelect(sign)}
                activeOpacity={0.7}
              >
                <Text style={styles.zodiacSymbol}>{sign.symbol}</Text>
                <Text style={[styles.zodiacName, active && styles.zodiacNameActive]}>
                  {sign.name}
                </Text>
                <Text style={styles.zodiacDates}>{sign.dates}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Period Tabs */}
        <Text style={styles.sectionTitle}>Period</Text>
        <View style={styles.tabs}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.tab, period === p && styles.tabActive]}
              onPress={() => handlePeriodChange(p)}
            >
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Get Horoscope Button */}
        {!fetched && (
          <TouchableOpacity
            style={[styles.btn, (!name.trim() || !selectedSign || loading) && styles.btnDisabled]}
            onPress={handleGetHoroscope}
            disabled={!name.trim() || !selectedSign || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Get My Horoscope</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Loading (after first fetch, for period changes) */}
        {loading && fetched && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Consulting the stars...</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchHoroscope(period, selectedSign)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result Card */}
        {horoscope && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultSymbol}>{selectedSign.symbol}</Text>
              <View>
                <Text style={styles.resultGreeting}>
                  {period.charAt(0).toUpperCase() + period.slice(1)} reading for {name}
                </Text>
                <Text style={styles.resultMeta}>
                  {selectedSign.name}  ·  {selectedSign.dates}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.resultContent}>
              {horoscope.horoscope || horoscope.content || horoscope.prediction || horoscope.message || ''}
            </Text>

            {/* Change period from result */}
            <View style={styles.resultTabs}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.resultTab, period === p && styles.resultTabActive]}
                  onPress={() => handlePeriodChange(p)}
                >
                  <Text style={[styles.resultTabText, period === p && styles.resultTabTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  headerRow: { alignItems: 'center', paddingTop: 20, marginBottom: 24 },
  headerIcon: { fontSize: 48, marginBottom: 8 },
  header: { fontSize: 26, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.bgCardLight,
    color: colors.text,
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detected: {
    color: colors.success,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  zodiacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  zodiacCard: {
    width: '30.5%',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  zodiacCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#2d1a5e',
  },
  zodiacSymbol: { fontSize: 22, marginBottom: 4 },
  zodiacName: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  zodiacNameActive: { color: colors.primaryLight, fontWeight: '700' },
  zodiacDates: { color: colors.border, fontSize: 9, marginTop: 2, textAlign: 'center' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  btn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  loadingText: { color: colors.textMuted, fontSize: 13 },

  errorCard: {
    backgroundColor: '#2d1a1a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 9,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  resultCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  resultSymbol: { fontSize: 44 },
  resultGreeting: { fontSize: 15, fontWeight: '700', color: colors.text },
  resultMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 14 },
  resultContent: { color: colors.text, fontSize: 15, lineHeight: 26 },

  resultTabs: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: colors.bgCardLight,
    borderRadius: 10,
    padding: 3,
  },
  resultTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  resultTabActive: { backgroundColor: colors.primary },
  resultTabText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  resultTabTextActive: { color: '#fff', fontWeight: '600' },
});
