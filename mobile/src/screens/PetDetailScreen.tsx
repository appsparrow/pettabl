import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Edit } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { EditPetModal } from '../components/EditPetModal';
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
  const [editOpen, setEditOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState<any | false>(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isBoss, setIsBoss] = useState<boolean>(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const [lightbox, setLightbox] = useState<{ uri: string; title?: string; subtitle?: string; meta?: string } | null>(null);

  useEffect(() => {
    if (petId) {
      loadPetDetails();
      loadSessions();
      loadPhotos();
      loadRole();
    }
  }, [petId]);
  useFocusEffect(useCallback(() => { if (petId) { loadPetDetails(); loadSessions(); loadPhotos(); } }, [petId]));

  const loadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsBoss(false);
      return;
    }
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

  const handleChangePhoto = async () => {
    if (!isBoss || !pet) return;

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

    setUpdatingPhoto(true);
    try {
      const asset = result.assets[0];

      if (pet.photo_url && pet.photo_url.includes('r2.cloudflarestorage.com')) {
        try {
          await deleteImageFromR2(pet.photo_url);
        } catch (deleteErr) {
          console.warn('Failed to delete previous image from R2', deleteErr);
        }
      }

      const uploadedUrl = await uploadImageToR2(asset.uri, 'pets', false);
      const { error } = await supabase
        .from('pets')
        .update({ photo_url: uploadedUrl })
        .eq('id', petId);

      if (error) {
        throw error;
      }

      await loadPetDetails();
      Alert.alert('Photo updated', `${pet.name}'s profile photo has been refreshed!`);
    } catch (err: any) {
      console.error('Error updating pet photo', err);
      Alert.alert('Upload failed', err?.message || 'Unable to update pet photo. Please try again.');
    } finally {
      setUpdatingPhoto(false);
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

        {isBoss && (
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => setEditOpen(true)}>
              <Edit color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (pet.photo_url) {
              setLightbox({
                uri: pet.photo_url,
                title: pet.name,
                subtitle: pet.breed || undefined,
              });
            }
          }}
          style={styles.petPhotoWrapper}
        >
          {pet.photo_url ? (
            <Image source={{ uri: pet.photo_url }} style={styles.petPhoto} />
          ) : (
            <View style={styles.placeholderCircle}>
              <Text style={styles.petIcon}>{getPetIcon(pet.pet_type)}</Text>
            </View>
          )}
          {isBoss && (
            <TouchableOpacity style={styles.photoBadge} onPress={handleChangePhoto} activeOpacity={0.9}>
              {updatingPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Edit color="#fff" size={16} />
              )}
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Pet Info Card */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.card}>
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
            {isBoss && (
              <TouchableOpacity
                style={[styles.addButton, { alignSelf: 'flex-start', marginTop: 12 }]}
                onPress={() => navigation.navigate('ScheduleEditor', { petId })}
              >
                <Text style={styles.addButtonText}>Daily Schedule</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pet Details */}
          {(pet.food_preferences || pet.medical_info || pet.vet_contact) && (
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

          {/* Care Plans */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Care Plans</Text>
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
                <Text style={styles.emptyText}>No sessions yet</Text>
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
            {isBoss && (
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
        <EditPetModal
          visible={editOpen}
          onClose={() => setEditOpen(false)}
          pet={pet}
          onSaved={async () => {
            await loadPetDetails();
          }}
        />
      )}
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
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  petPhotoWrapper: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  petPhoto: { width: '100%', height: '100%' },
  placeholderCircle: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  petIcon: { fontSize: 56 },
  photoBadge: { position: 'absolute', bottom: 6, right: 6, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { marginTop: -40, paddingHorizontal: 20, paddingBottom: 40, backgroundColor: 'rgba(255,255,255,0.82)', borderTopLeftRadius: 32, borderTopRightRadius: 32, minHeight: '100%' },
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
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textMuted },
});
