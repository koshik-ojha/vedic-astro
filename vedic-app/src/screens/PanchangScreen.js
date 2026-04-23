import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getVedicPanchang } from '../api/astro';
import { colors } from '../utils/theme';
import LoadingSpinner from '../components/LoadingSpinner';

const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.2090;
const DEFAULT_TZ  = 'Asia/Kolkata';

const QUALITY_COLORS = {
  Excellent:    '#10b981',
  Good:         '#a855f7',
  Beneficial:   '#3b82f6',
  Neutral:      '#9ca3af',
  Inauspicious: '#ef4444',
};

function qColor(q) { return QUALITY_COLORS[q] || colors.textMuted; }

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

const Badge = ({ quality }) => (
  <Text style={[styles.badge, { color: qColor(quality) }]}>{quality}</Text>
);

const SectionCard = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

function fmtEndTime(t) {
  if (!t) return null;
  if (typeof t === 'string') return `ends ${t}`;
  return null;
}

export default function PanchangScreen() {
  const [p, setP]               = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);
  const [showHora, setShowHora] = useState(false);
  const [showLagna, setShowLagna] = useState(false);

  const fetchPanchang = async () => {
    setError(null);
    try {
      const { data } = await getVedicPanchang(DEFAULT_LAT, DEFAULT_LON, DEFAULT_TZ);
      setP(data);
    } catch (e) {
      setError(e.code === 'ECONNABORTED'
        ? 'Server is starting up. Pull down to refresh.'
        : 'Unable to fetch panchang. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPanchang(); }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) return <LoadingSpinner message="Calculating panchang..." />;

  return (
    <LinearGradient colors={['#0d0d2b', '#1a0a3d']} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchPanchang(); }}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.header}>Today's Panchang</Text>
        <Text style={styles.date}>{today}</Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : p ? (
          <>
            {/* ─── Current Moment ─── */}
            {p.current && (
              <SectionCard title="Right Now">
                <Row label="Tithi"     value={`${p.current.tithi?.name}${p.current.tithi?.end_time ? ` · ends ${p.current.tithi.end_time}` : ''}`} />
                <Row label="Nakshatra" value={`${p.current.nakshatra?.name}${p.current.nakshatra?.end_time ? ` · ends ${p.current.nakshatra.end_time}` : ''}`} />
                <Row label="Yoga"      value={`${p.current.yoga?.name}${p.current.yoga?.end_time ? ` · ends ${p.current.yoga.end_time}` : ''}`} />
                <Row label="Karana"    value={`${p.current.karana?.name}${p.current.karana?.end_time ? ` · ends ${p.current.karana.end_time}` : ''}`} />
                {p.current.choghadiya && (
                  <View style={styles.nowChog}>
                    <Text style={styles.nowChogLabel}>Current Choghadiya</Text>
                    <Text style={[styles.nowChogName, { color: qColor(p.current.choghadiya.quality) }]}>
                      {p.current.choghadiya.name}
                    </Text>
                    <Text style={styles.nowChogTime}>
                      {p.current.choghadiya.start} – {p.current.choghadiya.end}
                    </Text>
                  </View>
                )}
              </SectionCard>
            )}

            {/* ─── Pancha Anga ─── */}
            <SectionCard title="Pancha Anga">
              <Row label="Tithi"
                value={`${p.tithi?.number}. ${p.tithi?.name} (${p.tithi?.paksha || ''})${p.tithi?.end_time ? ` · ends ${p.tithi.end_time}` : ''}`} />
              <Row label="Nakshatra"
                value={`${p.nakshatra?.name}${p.nakshatra?.pada ? ` Pada ${p.nakshatra.pada}` : ''}${p.nakshatra?.end_time ? ` · ends ${p.nakshatra.end_time}` : ''}`} />
              <Row label="Yoga"
                value={`${p.yoga?.name}${p.yoga?.end_time ? ` · ends ${p.yoga.end_time}` : ''}`} />
              <Row label="Karana"
                value={`${p.karana?.name}${p.karana?.end_time ? ` · ends ${p.karana.end_time}` : ''}`} />
              <Row label="Vara (Day)" value={p.vara?.english} />
            </SectionCard>

            {/* ─── Hindu Calendar ─── */}
            {p.hindu_calendar && (
              <SectionCard title="Hindu Calendar">
                <Row label="Vikram Samvat"   value={String(p.hindu_calendar.vikram_samvat || '')} />
                <Row label="Shaka Samvat"    value={String(p.hindu_calendar.shaka_samvat  || '')} />
                <Row label="Samvatsar"       value={p.hindu_calendar.samvatsar} />
                <Row label="Ayana"           value={p.hindu_calendar.ayana} />
                <Row label="Ritu (Season)"   value={p.hindu_calendar.ritu} />
                <Row label="Month (Amanta)"  value={p.hindu_calendar.amanta_month  || p.hindu_calendar.month} />
                <Row label="Month (Purnimanta)" value={p.hindu_calendar.purnimanta_month} />
                <Row label="Paksha"          value={p.hindu_calendar.paksha} />
                <Row label="Paksha Day"      value={String(p.hindu_calendar.paksha_day || '')} />
              </SectionCard>
            )}

            {/* ─── Sun & Moon ─── */}
            <SectionCard title="Sun & Moon">
              <Row label="Sunrise"              value={p.sun?.sunrise} />
              <Row label="Sunset"               value={p.sun?.sunset} />
              <Row label="Madhyahna (Midday)"   value={p.madhyahna} />
              <Row label="Moonrise"             value={p.moon?.moonrise} />
              <Row label="Moonset"              value={p.moon?.moonset} />
              <Row label="Day Duration"         value={p.durations?.day_duration} />
              <Row label="Night Duration"       value={p.durations?.night_duration} />
              <Row label="Surya Rashi"          value={p.sun?.surya_rashi?.name} />
              <Row label="Chandra Rashi"        value={p.moon?.chandra_rashi?.name} />
              {p.moon?.chandra_rashi_transition && (
                <Row label="Moon Rashi Changes" value={p.moon.chandra_rashi_transition} />
              )}
            </SectionCard>

            {/* ─── Inauspicious Periods ─── */}
            {p.inauspicious && (
              <SectionCard title="Inauspicious Periods">
                <Row label="Rahu Kalam"
                  value={`${p.inauspicious.rahu_kalam?.start} – ${p.inauspicious.rahu_kalam?.end}`} />
                <Row label="Yamagandam"
                  value={`${p.inauspicious.yamagandam?.start} – ${p.inauspicious.yamagandam?.end}`} />
                <Row label="Gulika Kalam"
                  value={`${p.inauspicious.gulika_kalam?.start} – ${p.inauspicious.gulika_kalam?.end}`} />
                {p.inauspicious.varjyam && (
                  <Row label="Varjyam"
                    value={`${p.inauspicious.varjyam?.start} – ${p.inauspicious.varjyam?.end}`} />
                )}
                {p.inauspicious.dur_muhurtam?.length > 0 && (
                  <>
                    <Text style={styles.subhead}>Dur Muhurtam</Text>
                    {p.inauspicious.dur_muhurtam.map((d, i) => (
                      <Row key={i} label={`  Slot ${i + 1}`} value={`${d.start} – ${d.end}`} />
                    ))}
                  </>
                )}
              </SectionCard>
            )}

            {/* ─── Special Conditions ─── */}
            {(p.panchaka?.active || p.ganda_moola?.active || p.bhadra?.active) && (
              <SectionCard title="Special Conditions">
                {p.panchaka?.active && (
                  <View style={styles.alertRow}>
                    <Text style={styles.alertIcon}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>Panchaka</Text>
                      <Text style={styles.alertDesc}>{p.panchaka.description}</Text>
                    </View>
                  </View>
                )}
                {p.ganda_moola?.active && (
                  <View style={styles.alertRow}>
                    <Text style={styles.alertIcon}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>Ganda Moola</Text>
                      <Text style={styles.alertDesc}>{p.ganda_moola.description}</Text>
                    </View>
                  </View>
                )}
                {p.bhadra?.active && (
                  <View style={styles.alertRow}>
                    <Text style={styles.alertIcon}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>Bhadra (Vishti)</Text>
                      <Text style={styles.alertDesc}>{p.bhadra.description}</Text>
                    </View>
                  </View>
                )}
              </SectionCard>
            )}

            {/* ─── Special Yogas ─── */}
            {p.special_yogas?.length > 0 && (
              <SectionCard title="Special Yogas Today">
                {p.special_yogas.map((yoga, i) => (
                  <View key={i} style={styles.yogaRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.yogaName}>{yoga.name}</Text>
                      <Text style={styles.yogaDesc}>{yoga.description}</Text>
                    </View>
                    <Badge quality={yoga.quality} />
                  </View>
                ))}
              </SectionCard>
            )}

            {/* ─── Auspicious Muhurta ─── */}
            {p.muhurta?.length > 0 && (
              <SectionCard title="Auspicious Muhurta">
                {p.muhurta.map((m, i) => (
                  <View key={i} style={styles.muhurtaRow}>
                    <View style={styles.muhurtaLeft}>
                      <Text style={styles.muhurtaName}>{m.name}</Text>
                      <Text style={styles.muhurtaTime}>{m.start} – {m.end}</Text>
                      {m.description ? <Text style={styles.muhurtaDesc}>{m.description}</Text> : null}
                    </View>
                    <Badge quality={m.quality} />
                  </View>
                ))}
              </SectionCard>
            )}

            {/* ─── Festivals ─── */}
            {p.festivals?.length > 0 && (
              <SectionCard title="Festival / Vrat">
                {p.festivals.map((f, i) => (
                  <Row key={i} label={f.name || f} value={f.type || ''} />
                ))}
              </SectionCard>
            )}

            {/* ─── Tarabalam / Chandrabalam (if birth data provided) ─── */}
            {(p.tarabalam || p.chandrabalam) && (
              <SectionCard title="Personal (Birth Chart)">
                {p.tarabalam && (
                  <>
                    <Text style={styles.subhead}>Tarabalam</Text>
                    <Row label="Type"     value={p.tarabalam.type} />
                    <Row label="Quality"  value={p.tarabalam.quality} />
                    <Row label="Count"    value={String(p.tarabalam.count)} />
                  </>
                )}
                {p.chandrabalam && (
                  <>
                    <Text style={styles.subhead}>Chandrabalam</Text>
                    <Row label="Position" value={String(p.chandrabalam.position)} />
                    <Row label="Quality"  value={p.chandrabalam.quality} />
                  </>
                )}
              </SectionCard>
            )}

            {/* ─── Day Choghadiya ─── */}
            {p.choghadiya?.day?.length > 0 && (
              <SectionCard title="Day Choghadiya">
                {p.choghadiya.day.map((c, i) => (
                  <View key={i} style={styles.chogRow}>
                    <Text style={styles.chogName}>{c.name}</Text>
                    <Text style={styles.chogTime}>{c.start} – {c.end}</Text>
                    <Badge quality={c.quality} />
                  </View>
                ))}
              </SectionCard>
            )}

            {/* ─── Night Choghadiya ─── */}
            {p.choghadiya?.night?.length > 0 && (
              <SectionCard title="Night Choghadiya">
                {p.choghadiya.night.map((c, i) => (
                  <View key={i} style={styles.chogRow}>
                    <Text style={styles.chogName}>{c.name}</Text>
                    <Text style={styles.chogTime}>{c.start} – {c.end}</Text>
                    <Badge quality={c.quality} />
                  </View>
                ))}
              </SectionCard>
            )}

            {/* ─── Hora (collapsible) ─── */}
            {p.hora?.length > 0 && (
              <View style={styles.card}>
                <TouchableOpacity onPress={() => setShowHora(!showHora)} style={styles.collapseHeader}>
                  <Text style={styles.cardTitle}>Hora Table</Text>
                  <Text style={styles.collapseChevron}>{showHora ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showHora && p.hora.map((h, i) => (
                  <View key={i} style={styles.chogRow}>
                    <Text style={styles.chogName}>{h.planet}</Text>
                    <Text style={styles.chogTime}>{h.start} – {h.end}</Text>
                    <Text style={[styles.badge, { color: colors.textMuted }]}>{h.period}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ─── Udaya Lagna (collapsible) ─── */}
            {p.udaya_lagna?.length > 0 && (
              <View style={styles.card}>
                <TouchableOpacity onPress={() => setShowLagna(!showLagna)} style={styles.collapseHeader}>
                  <Text style={styles.cardTitle}>Udaya Lagna</Text>
                  <Text style={styles.collapseChevron}>{showLagna ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showLagna && p.udaya_lagna.map((l, i) => (
                  <View key={i} style={styles.chogRow}>
                    <Text style={styles.chogName}>{l.lagna}</Text>
                    <Text style={styles.chogTime}>{l.start} – {l.end}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.error}>No panchang data available.</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: colors.text, paddingTop: 16, marginBottom: 4 },
  date: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  error: { color: colors.error, textAlign: 'center', marginTop: 40 },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  collapseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  collapseChevron: { color: colors.textMuted, fontSize: 12 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardLight,
  },
  rowLabel: { color: colors.textMuted, fontSize: 13, flex: 1 },
  rowValue: { color: colors.text, fontSize: 13, fontWeight: '500', flex: 1.2, textAlign: 'right' },

  subhead: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 10,
    marginBottom: 2,
  },

  badge: { fontSize: 11, fontWeight: '600' },

  nowChog: {
    marginTop: 10,
    backgroundColor: colors.bgCardLight,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  nowChogLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 4 },
  nowChogName: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  nowChogTime: { color: colors.textMuted, fontSize: 12 },

  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardLight,
  },
  alertIcon: { fontSize: 16 },
  alertTitle: { color: '#f59e0b', fontSize: 13, fontWeight: '700' },
  alertDesc: { color: colors.textMuted, fontSize: 11, marginTop: 2 },

  yogaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardLight,
    gap: 8,
  },
  yogaName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  yogaDesc: { color: colors.textMuted, fontSize: 11, marginTop: 2 },

  muhurtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardLight,
  },
  muhurtaLeft: { flex: 1 },
  muhurtaName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  muhurtaTime: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  muhurtaDesc: { color: colors.border, fontSize: 10, marginTop: 2 },

  chogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardLight,
    gap: 8,
  },
  chogName: { color: colors.text, fontSize: 13, fontWeight: '500', width: 80 },
  chogTime: { color: colors.textMuted, fontSize: 12, flex: 1 },
});
