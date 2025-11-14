import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Edit, Save, X, Camera } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToR2, deleteImageFromR2 } from '../lib/r2-storage';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { format, parseISO } from 'date-fns';
import { PetIcon, PetType } from '../components/PetIcon';
import { CarePlanCard } from '../components/CarePlanCard';

export default function PetDetailScreen({ route, navigation }: any) {
  const { petId } = route.params;
  const [pet, setPet] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionOpen, setSessionOpen] = useState<any | false>(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isBoss, setIsBoss] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ uri: string; title?: string; subtitle?: string; meta?: string } | null>(null);
  const PET_TYPES = ['dog', 'cat', 'fish', 'bird', 'rabbit', 'turtle', 'hamster', 'other'] as const;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    petType: 'dog' as typeof PET_TYPES[number],
    breed: '',
    age: '',
    food: '',
    medical: '',
    vet: '',
  });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (petId) {
      loadPetDetails();
      loadSessions();
      loadPhotos();
      loadRole();
    }
  }, [petId]);
  useFocusEffect(useCallback(() => { if (petId) { loadPetDetails(); loadSessions(); loadPhotos(); } }, [petId]));

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name ?? '',
        petType: (pet.pet_type as typeof PET_TYPES[number]) ?? 'dog',
        breed: pet.breed ?? '',
        age: pet.age ? String(pet.age) : '',
        food: pet.food_preferences ?? '',
        medical: pet.medical_info ?? '',
        vet: pet.vet_contact ?? '',
      });
    }
  }, [pet]);

  const loadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsBoss(false);
      setUserId(null);
      return;
    }
    setUserId(user.id);
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    setIsBoss(data?.role === 'fur_boss');
  };

  const loadPetDetails = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();
    setPet(data);
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*, session_agents(fur_agent_id, profiles(name,email))')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });
    setSessions(data || []);
  };

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('activities')
      .select(`
        id,
        photo_url,
        created_at,
        caretaker:profiles!activities_caretaker_id_fkey ( name )
      `)
      .eq('pet_id', petId)
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(12);
    setPhotos(data || []);
  };

  const pickPetPhoto = async () => {
    const canManageCurrent = isBoss || (userId && pet?.fur_boss_id === userId);
    if (!canManageCurrent || !editing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to update the pet image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    setPhotoUri(result.assets[0].uri);
  };

  const cancelEditing = () => {
    if (pet) {
      setForm({
        name: pet.name ?? '',
        petType: (pet.pet_type as typeof PET_TYPES[number]) ?? 'dog',
        breed: pet.breed ?? '',
        age: pet.age ? String(pet.age) : '',
        food: pet.food_preferences ?? '',
        medical: pet.medical_info ?? '',
        vet: pet.vet_contact ?? '',
      });
    }
    setPhotoUri(null);
    setEditing(false);
  };

  const startEditing = () => {
    if (pet) {
      setForm({
        name: pet.name ?? '',
        petType: (pet.pet_type as typeof PET_TYPES[number]) ?? 'dog',
        breed: pet.breed ?? '',
        age: pet.age ? String(pet.age) : '',
        food: pet.food_preferences ?? '',
        medical: pet.medical_info ?? '',
        vet: pet.vet_contact ?? '',
      });
    }
    setPhotoUri(null);
    setEditing(true);
  };

  const savePet = async () => {
    const canManageCurrent = isBoss || (userId && pet?.fur_boss_id === userId);
    if (!canManageCurrent || !pet) return;

    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter a pet name.');
      return;
    }

    setSaving(true);
    try {
      let photo_url: string | null | undefined = undefined;

      if (photoUri) {
        if (pet.photo_url && pet.photo_url.includes('r2.cloudflarestorage.com')) {
          try {
            await deleteImageFromR2(pet.photo_url);
          } catch (deleteErr) {
            console.warn('Failed to delete previous image from R2', deleteErr);
          }
        }

        photo_url = await uploadImageToR2(photoUri, 'pets', false);
      }

      const update: any = {
        name: form.name.trim(),
        pet_type: form.petType,
        breed: form.breed || null,
        age: form.age ? Number(form.age) : null,
        food_preferences: form.food || null,
        medical_info: form.medical || null,
        vet_contact: form.vet || null,
      };

      if (photo_url !== undefined) {
        update.photo_url = photo_url;
      }

      const { error } = await supabase
        .from('pets')
        .update(update)
        .eq('id', pet.id);

      if (error) throw error;

      await loadPetDetails();
      Alert.alert('Success', `${form.name.trim()} updated!`);
      setEditing(false);
      setPhotoUri(null);
    } catch (err: any) {
      console.error('Error saving pet', err);
      Alert.alert('Error', err?.message || 'Unable to save pet details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deletePet = async () => {
    const { error } = await supabase.from('pets').delete().eq('id', petId);
    if (error) Alert.alert('Error', error.message);
    else navigation.goBack();
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this care session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
            if (!error) {
              loadSessions();
            } else {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

  const getPetIcon = (petType: string | null) => {
    switch (petType) {
      case 'dog': return '🐶';
      case 'cat': return '🐱';
      case 'fish': return '🐠';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'turtle': return '🐢';
      case 'hamster': return '🐭';
      default: return '🐾';
    }
  };

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const canManage = isBoss || (userId && pet?.fur_boss_id === userId);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['#f39de6', '#f8c77f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        {canManage && !editing && (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={startEditing}
              accessibilityRole="button"
              accessibilityLabel="Edit pet"
            >
              <Edit color={colors.primary} size={20} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (editing && canManage) {
              pickPetPhoto();
              return;
            }
            const displayUri = photoUri || pet.photo_url;
            if (displayUri) {
              setLightbox({
                uri: displayUri,
                title: pet.name,
                subtitle: pet.breed || undefined,
              });
            }
          }}
          style={styles.petPhotoWrapper}
        >
          {photoUri || pet.photo_url ? (
            <Image source={{ uri: photoUri || pet.photo_url }} style={styles.petPhoto} />
          ) : (
            <View style={styles.placeholderCircle}>
              <Text style={styles.petIcon}>{getPetIcon(pet.pet_type)}</Text>
            </View>
          )}
          {editing && canManage && (
            <View style={styles.photoBadge}>
              <Camera color="#fff" size={18} />
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Pet Info Card */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.card}>
            {editing ? (
              <>
                <Text style={styles.inputLabel}>Pet Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
                  placeholder="Eg. Zach"
                />

                <Text style={styles.inputLabel}>Pet Type</Text>
                <View style={styles.typeRow}>
                  {PET_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeChip, form.petType === type && styles.typeChipActive]}
                      onPress={() => setForm((prev) => ({ ...prev, petType: type }))}
                    >
                      <Text style={[styles.typeChipText, form.petType === type && styles.typeChipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Breed</Text>
                <TextInput
                  style={styles.input}
                  value={form.breed}
                  onChangeText={(breed) => setForm((prev) => ({ ...prev, breed }))}
                  placeholder="Eg. Golden Retriever"
                />

                <Text style={styles.inputLabel}>Age (years)</Text>
                <TextInput
                  style={styles.input}
                  value={form.age}
                  onChangeText={(age) => setForm((prev) => ({ ...prev, age }))}
                  placeholder="Eg. 4"
                  keyboardType="number-pad"
                />

                <Text style={styles.inputLabel}>Food Preferences</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={form.food}
                  onChangeText={(food) => setForm((prev) => ({ ...prev, food }))}
                  placeholder="Meal schedule, brands..."
                  multiline
                />

                <Text style={styles.inputLabel}>Medical Info</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={form.medical}
                  onChangeText={(medical) => setForm((prev) => ({ ...prev, medical }))}
                  placeholder="Medications, allergies..."
                  multiline
                />

                <Text style={styles.inputLabel}>Vet Contact</Text>
                <TextInput
                  style={styles.input}
                  value={form.vet}
                  onChangeText={(vet) => setForm((prev) => ({ ...prev, vet }))}
                  placeholder="Clinic name, phone"
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                    <X color={colors.textMuted} size={20} />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={savePet}
                    disabled={saving}
                  >
                    <Save color="#fff" size={20} />
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.petHeader}>
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    {pet.breed && <Text style={styles.petBreed}>{pet.breed}</Text>}
                  </View>
                  {pet.age && (
                    <View style={styles.ageTag}>
                      <Text style={styles.ageText}>{pet.age} years</Text>
                    </View>
                  )}
                </View>
              </>
            )}
            {canManage && !editing && (
              <TouchableOpacity
                style={[styles.manageButton, { alignSelf: 'flex-start', marginTop: 16 }]}
                onPress={() => navigation.navigate('ScheduleEditor', { petId })}
              >
                <Text style={styles.manageButtonText}>Daily Schedule</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pet Details */}
          {!editing && (pet.food_preferences || pet.medical_info || pet.vet_contact) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pet Information</Text>
              
              {pet.food_preferences && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>🍽️ Food Preferences</Text>
                  <Text style={styles.infoText}>{pet.food_preferences}</Text>
                </View>
              )}

              {pet.medical_info && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>💊 Medical Information</Text>
                  <Text style={styles.infoText}>{pet.medical_info}</Text>
                </View>
              )}

              {pet.vet_contact && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>📞 Vet Contact</Text>
                  <Text style={styles.infoText}>{pet.vet_contact}</Text>
                </View>
              )}
            </View>
          )}

          {/* Pet Watches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pet Watches</Text>
              {isBoss && (
                <TouchableOpacity style={styles.addButton} onPress={() => setSessionOpen(true)}>
                  <Plus color="#fff" size={20} />
                  <Text style={styles.addButtonText}>New</Text>
                </TouchableOpacity>
              )}
            </View>

            {sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>No pet watches yet</Text>
              </View>
            ) : (
              sessions.map((session) => (
                <CarePlanCard
                  key={session.id}
                  title={pet.name}
                  startDate={session.start_date}
                  endDate={session.end_date}
                  status={session.status}
                  agents={session.session_agents.map((a: any) => ({
                    id: a.fur_agent_id,
                    name: a.profiles?.name,
                    email: a.profiles?.email,
                  }))}
                  onPressEdit={isBoss ? () => setSessionOpen(session) : undefined}
                  onPressDelete={isBoss ? () => handleDeleteSession(session.id) : undefined}
                  onPressAgent={(agentId) => navigation.navigate('AgentProfile', { agentId })}
                />
              ))
            )}
          </View>

          {/* Activity Photos */}
          {photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Photos</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {photos.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.9}
                    onPress={() =>
                      setLightbox({
                        uri: p.photo_url,
                        title: pet.name,
                        subtitle: p.caretaker?.name ? `Uploaded by ${p.caretaker.name}` : undefined,
                        meta: format(parseISO(p.created_at), 'MMM d • h:mm a'),
                      })
                    }
                  >
                    <Image source={{ uri: p.photo_url }} style={{ width: 96, height: 96, borderRadius: 12 }} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Danger Zone</Text>
            {canManage && (
              <TouchableOpacity
                style={{ height: 52, borderRadius: 14, borderWidth: 2, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                  Alert.alert('Delete Pet', `Are you sure you want to delete ${pet?.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: deletePet },
                  ]);
                }}
              >
                <Text style={{ color: '#ef4444', fontWeight: '700' }}>Delete Pet</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      {isBoss && (
        <CreateSessionModal
          visible={sessionOpen !== false}
          onClose={() => setSessionOpen(false)}
          petId={petId}
          onCreated={async () => {
            await loadSessions();
          }}
          session={sessionOpen && sessionOpen !== true ? sessionOpen : undefined}
        />
      )}
      <ImageLightboxModal
        visible={!!lightbox}
        imageUrl={lightbox?.uri ?? null}
        title={lightbox?.title}
        subtitle={lightbox?.subtitle}
        meta={lightbox?.meta}
        onClose={() => setLightbox(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadingText: { fontSize: 18, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  header: { paddingTop: 60, paddingBottom: 80, paddingHorizontal: 24, alignItems: 'center' },
  backButton: { position: 'absolute', top: 60, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  headerButtons: { position: 'absolute', top: 60, right: 20, flexDirection: 'row', gap: 8 },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  petPhotoWrapper: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  petPhoto: { width: '100%', height: '100%' },
  placeholderCircle: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  petIcon: { fontSize: 56 },
  photoBadge: { position: 'absolute', bottom: 6, right: 6, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { marginTop: -32, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 40, backgroundColor: 'rgba(255,255,255,0.82)', borderTopLeftRadius: 32, borderTopRightRadius: 32, minHeight: '100%' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  petHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  petInfo: { flex: 1 },
  petName: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  petBreed: { fontSize: 16, color: colors.textMuted },
  ageTag: { backgroundColor: colors.primary + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  ageText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  infoText: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, gap: 4 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  manageButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  manageButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textMuted },
  inputLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
    marginBottom: 16,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  typeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  typeChipTextActive: {
    color: colors.primary,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
