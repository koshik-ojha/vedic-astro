import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getProfiles, createProfile, deleteProfile } from '../api/profile';
import { colors } from '../utils/theme';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_FORM = {
  profile_name: '',
  dob: '',
  tob: '',
  place_name: '',
  lat: '',
  lon: '',
  timezone: 'Asia/Kolkata',
};

export default function ProfileScreen() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await getProfiles();
      setProfiles(data.profiles || []);
    } catch (e) {
      console.log('Profile load error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.dob || !form.place_name) return Alert.alert('Error', 'Date of birth and place are required');
    setSaving(true);
    try {
      await createProfile({
        ...form,
        lat: parseFloat(form.lat) || 0,
        lon: parseFloat(form.lon) || 0,
      });
      setModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Profile', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteProfile(id); load(); }
          catch (e) { Alert.alert('Error', 'Failed to delete profile'); }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading profiles..." />;

  return (
    <LinearGradient colors={['#0d0d2b', '#1a0a3d']} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Birth Profiles</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {profiles.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>No profiles yet. Add your birth details to get started.</Text>
          </View>
        )}

        {profiles.map((p) => (
          <View key={p._id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{p.profile_name}</Text>
              <Text style={styles.profileDetail}>DOB: {p.dob} {p.tob ? `at ${p.tob}` : ''}</Text>
              <Text style={styles.profileDetail}>Place: {p.place_name}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(p._id, p.profile_name)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Profile Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Birth Profile</Text>

            {[
              { label: 'Profile Name', key: 'profile_name', placeholder: 'e.g. My Profile' },
              { label: 'Date of Birth (YYYY-MM-DD)', key: 'dob', placeholder: '1990-01-15' },
              { label: 'Time of Birth (HH:MM)', key: 'tob', placeholder: '14:30 (optional)' },
              { label: 'Place of Birth', key: 'place_name', placeholder: 'e.g. New Delhi' },
              { label: 'Latitude', key: 'lat', placeholder: '28.6139', keyboardType: 'numeric' },
              { label: 'Longitude', key: 'lon', placeholder: '77.2090', keyboardType: 'numeric' },
              { label: 'Timezone', key: 'timezone', placeholder: 'Asia/Kolkata' },
            ].map((field) => (
              <View key={field.key}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={form[field.key]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                  keyboardType={field.keyboardType}
                />
              </View>
            ))}

            <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  addBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 14 },
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  profileName: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  profileDetail: { fontSize: 12, color: colors.textMuted },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: colors.error, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  label: { color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: colors.bgCardLight, color: colors.text, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { alignItems: 'center', marginTop: 12, padding: 8 },
  cancelText: { color: colors.textMuted },
});
