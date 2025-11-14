import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, Linking } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { UserRound, Mail, Phone, MapPin, Edit, Save, X, LogOut, Shuffle, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { AddPetModal } from '../components/AddPetModal';
import { useRole } from '../context/RoleContext';
import { PetIcon } from '../components/PetIcon';
import { uploadImageToR2, deleteImageFromR2 } from '../lib/r2-storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', bio: '' });
  const [pets, setPets] = useState<any[]>([]);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation<any>();
  const { activeRole, toggleRole } = useRole();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
      if (data) {
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || '',
        });
      }
      // Load pets
      const { data: petData } = await supabase
        .from('pets')
        .select('id,name,breed,age,pet_type,photo_url')
        .eq('fur_boss_id', user.id)
        .order('created_at', { ascending: false });
      setPets(petData || []);
    }
  };
  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    try {
      let photoUrl = profile?.photo_url;

      // Upload new photo to R2 if selected
      if (photoUri) {
        // Delete old photo from R2 if exists
        if (profile?.photo_url && profile.photo_url.includes('r2.cloudflarestorage.com')) {
          try {
            await deleteImageFromR2(profile.photo_url);
          } catch (error) {
            console.error('Error deleting old photo:', error);
          }
        }

        // Upload new photo to R2
        photoUrl = await uploadImageToR2(photoUri, 'profiles', true);
        Alert.alert('Success', 'Profile photo uploaded! 📸');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          photo_url: photoUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated!');
      setEditing(false);
      setPhotoUri(null);
      loadProfile();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  const switchRole = async () => {
    const next = activeRole === 'fur_boss' ? 'fur_agent' : 'fur_boss';
    await toggleRole();
    Alert.alert('Role switched', `Active mode set to ${next === 'fur_boss' ? 'Pet Boss' : 'Pet Watcher'}`);
  };

  const normalizedPhone = profile?.phone ? profile.phone.replace(/[^\d+]/g, '') : '';

  const openLink = async (url: string, fallback: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Not supported', fallback);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Not supported', fallback);
    }
  };

  const handleCall = () => {
    if (!normalizedPhone) return;
    void openLink(`tel:${normalizedPhone}`, 'Unable to place a call on this device.');
  };

  const handleSms = () => {
    if (!normalizedPhone) return;
    void openLink(`sms:${normalizedPhone}`, 'Messaging is not available.');
  };

  const handleWhatsApp = () => {
    if (!normalizedPhone) return;
    void openLink(`https://wa.me/${normalizedPhone}`, 'WhatsApp is not installed or cannot be opened.');
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const pickProfilePhoto = async () => {
    // If editing, just update the local state
    if (editing) {
      await pickPhoto();
      return;
    }

    // If not editing, upload immediately
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      
      try {
        // Delete old photo from R2 if exists
        if (profile?.photo_url && profile.photo_url.includes('r2.cloudflarestorage.com')) {
          try {
            await deleteImageFromR2(profile.photo_url);
          } catch (error) {
            console.error('Error deleting old photo:', error);
          }
        }

        // Upload to R2
        const photoUrl = await uploadImageToR2(uri, 'profiles', true);
        
        // Update database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ photo_url: photoUrl })
            .eq('id', user.id);
          
          Alert.alert('Success', 'Profile photo updated! 📸');
          await loadProfile();
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to upload photo');
      }
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatar} onPress={pickProfilePhoto}>
            {(photoUri || profile.photo_url) ? (
              <Image source={{ uri: photoUri || profile.photo_url }} style={styles.avatarImage} />
            ) : (
              <UserRound color="#fff" size={48} />
            )}
            {editing && (
              <View style={styles.cameraIconOverlay}>
                <Camera color="#fff" size={20} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        {!editing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Edit color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Profile Content */}
      <View style={styles.content}>
        {editing ? (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(name) => setFormData({ ...formData, name })}
              placeholder="Your name"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(phone) => setFormData({ ...formData, phone })}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(address) => setFormData({ ...formData, address })}
              placeholder="Your address"
              multiline
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(bio) => setFormData({ ...formData, bio })}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                <X color={colors.textMuted} size={20} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.buttonDisabled]} 
                onPress={saveProfile}
                disabled={saving}
              >
                <Save color="#fff" size={20} />
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.name}>{profile.name || 'No name set'}</Text>
            <Text style={styles.role}>
              {activeRole === 'fur_boss' ? '🐶 Pet Boss' : '❤️ Pet Agent'}
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                {[<Mail key="icon" color={colors.textMuted} size={20} />, (
                  <Text key="value" style={styles.infoText}>
                    {profile.email}
                  </Text>
                )]}
              </View>
              <View style={styles.infoRow}>
                {[<Phone key="icon" color={colors.textMuted} size={20} />, (
                  <View key="value" style={{ flex: 1 }}>
                    <Text style={styles.infoText}>{profile.phone || 'Add your phone'}</Text>
                    {profile.phone && (
                      <View style={styles.contactActions}>
                        <TouchableOpacity style={styles.contactChip} onPress={handleCall}>
                          <Text style={styles.contactChipText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactChip} onPress={handleSms}>
                          <Text style={styles.contactChipText}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactChip} onPress={handleWhatsApp}>
                          <Text style={styles.contactChipText}>WhatsApp</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )]}
              </View>
              <View style={styles.infoRow}>
                {[<MapPin key="icon" color={colors.textMuted} size={20} />, (
                  <Text key="value" style={styles.infoText}>
                    {profile.address || 'Add your address'}
                  </Text>
                )]}
              </View>
            </View>

            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>About Me</Text>
              <Text style={styles.bioText}>{profile.bio || 'Add a short bio about you'}</Text>
            </View>

            {activeRole === 'fur_agent' && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Paw Points</Text>
                <Text style={styles.statsValue}>⭐ {profile.paw_points || 0}</Text>
              </View>
            )}

            {/* My Pets Section */}
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>My Pets</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setAddPetOpen(true)}>
                  <Text style={styles.addButtonText}>+ Add Pet</Text>
                </TouchableOpacity>
              </View>
              {pets.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🐾</Text>
                  <Text style={styles.emptyText}>No pets yet. Add your first pet!</Text>
                </View>
              ) : (
                <View style={styles.petGrid}>
                  {pets.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.petCard}
                      onPress={() => navigation.navigate('PetDetail', { petId: p.id })}
                    >
                      <View style={styles.petIcon}>
                        <PetIcon type={p.pet_type} color={colors.primary} size={24} />
                      </View>
                      <Text style={styles.petNameSmall}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Sign Out */}
        {!editing && (
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <View style={styles.buttonContent}>
              <LogOut color={colors.primary} size={20} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        )}
        {!editing && (
          <TouchableOpacity
            style={[styles.signOutButton, { borderColor: colors.accent, marginTop: 12 }]}
            onPress={switchRole}
          >
            <View style={styles.buttonContent}>
              <Shuffle color={colors.accent} size={20} />
              <Text style={[styles.signOutText, { color: colors.accent }]}>Switch to {activeRole === 'fur_boss' ? 'Pet Watcher' : 'Pet Boss'}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Pet Modal */}
      <AddPetModal
        visible={addPetOpen}
        onClose={() => setAddPetOpen(false)}
        onCreated={loadProfile}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  loadingText: { fontSize: 18, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  header: { paddingTop: 60, paddingBottom: 80, paddingHorizontal: 24, alignItems: 'center' },
  avatarContainer: { alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  cameraIconOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: colors.primary, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editButton: { position: 'absolute', top: 60, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  content: { marginTop: -40, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 50 },
  name: { fontSize: 28, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 8 },
  role: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  infoText: { fontSize: 16, color: colors.text, flex: 1 },
  bioCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  bioTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 },
  bioText: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  statsCard: { backgroundColor: colors.primary + '15', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
  statsTitle: { fontSize: 16, color: colors.textMuted, marginBottom: 8 },
  statsValue: { fontSize: 32, fontWeight: 'bold', color: colors.primary },
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 16 },
  input: { height: 56, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, backgroundColor: colors.background, color: colors.text },
  textArea: { height: 120, paddingTop: 16, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.border, gap: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  saveButton: { flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.primary, gap: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  buttonDisabled: { opacity: 0.5 },
  signOutButton: { marginTop: 24, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  signOutText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  petGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  petCard: { width: '30%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  petIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  petNameSmall: { fontSize: 12, fontWeight: '600', color: colors.text },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.textMuted },
  contactActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  contactChip: { backgroundColor: colors.primary + '15', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  contactChipText: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
});
