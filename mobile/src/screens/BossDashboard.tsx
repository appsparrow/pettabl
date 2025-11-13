import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, PawPrint, Plus } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { AddPetModal } from '../components/AddPetModal';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useRole } from '../context/RoleContext';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { PetIcon } from '../components/PetIcon';
import { CarePlanCard } from '../components/CarePlanCard';

export default function BossDashboard({ navigation }: any) {
  const [pets, setPets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [sessionPetId, setSessionPetId] = useState<string | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<any | null>(null);
  const [petPickerVisible, setPetPickerVisible] = useState(false);
  const { activeRole } = useRole();

  useEffect(() => {
    if (activeRole === 'fur_boss') {
      loadUser();
    }
  }, [activeRole]);

  useFocusEffect(
    useCallback(() => {
      if (activeRole === 'fur_boss') {
        loadUser();
      }
    }, [activeRole])
  );

  const onRefresh = async () => {
    if (activeRole !== 'fur_boss') return;
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const loadUser = async () => {
    if (activeRole !== 'fur_boss') return;
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await Promise.all([loadProfile(user.id), loadPets(user.id), loadSessions(user.id)]);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const loadPets = async (userId: string) => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('fur_boss_id', userId)
      .order('created_at', { ascending: false });
    setPets(data || []);
  };

  const loadSessions = async (userId: string) => {
    const { data } = await supabase
      .from('sessions')
      .select('*, pets(name, photo_url, pet_type, age), session_agents(fur_agent_id, profiles(name,email))')
      .eq('fur_boss_id', userId)
      .order('start_date', { ascending: true });
    console.log('Boss sessions:', data);
    setSessions(data || []);
  };

  const openCreateSession = (petId: string) => {
    setSessionToEdit(null);
    setSessionPetId(petId);
    setSessionModalVisible(true);
    setPetPickerVisible(false);
  };

  const openEditSession = (session: any) => {
    setSessionToEdit(session);
    setSessionPetId(session.pet_id);
    setSessionModalVisible(true);
  };

  const closeSessionModal = () => {
    setSessionModalVisible(false);
    setSessionToEdit(null);
    setSessionPetId(null);
  };

  const handleNewPlan = () => {
    if (pets.length === 0) {
      Alert.alert('Add a pet first', 'You need at least one pet before creating a care plan.');
      return;
    }
    if (pets.length === 1) {
      openCreateSession(pets[0].id);
    } else {
      setPetPickerVisible(true);
    }
  };

  const activePlans = sessions.filter((session) => session.status === 'active');
  const petSessionCounts = pets.reduce<Record<string, number>>((acc, pet) => {
    acc[pet.id] = sessions.filter((session) => session.pet_id === pet.id).length;
    return acc;
  }, {});

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.name}>{profile?.name || 'Boss'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <PawPrint color="#fff" size={18} />
              <Text style={styles.badgeText}>{pets.length} Pets</Text>
            </View>
            <View style={styles.badge}>
              <CalendarDays color="#fff" size={18} />
              <Text style={styles.badgeText}>{activePlans.length} Active Plans</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickRow}>
              <TouchableOpacity style={[styles.quickCard, styles.quickAdd]} onPress={() => setAddOpen(true)}>
                <View style={styles.quickIcon}>
                  <Plus color="#fff" size={20} />
                </View>
                <Text style={styles.quickLabel}>Add Pet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickCard, styles.quickPlan]} onPress={handleNewPlan}>
                <View style={styles.quickIcon}>
                  <CalendarDays color="#fff" size={20} />
                </View>
                <Text style={styles.quickLabel}>New Care Plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Pets</Text>
              <Text style={styles.sectionSubtitle}>{pets.length} total</Text>
            </View>
            {pets.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🐾</Text>
                <Text style={styles.emptyText}>No pets yet. Add your first furry friend!</Text>
              </View>
            ) : (
              <View style={styles.petGrid}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
              >
                <LinearGradient colors={['#FCE7F3', '#E0EAFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.petGradient}>
                  <View style={styles.petIconBubble}>
                    {pet.photo_url ? (
                      <Image source={{ uri: pet.photo_url }} style={styles.petImage} />
                    ) : (
                      <PetIcon type={pet.pet_type} color="#F97316" size={30} />
                    )}
                  </View>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petPlans}>{petSessionCounts[pet.id] || 0} care plans</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Care Plans</Text>
              <Text style={styles.sectionSubtitle}>{sessions.length} total</Text>
            </View>
            {sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🗓️</Text>
                <Text style={styles.emptyText}>No care plans yet. Tap “New Care Plan” to get started.</Text>
              </View>
            ) : (
              sessions.map((session) => (
                <CarePlanCard
                  key={session.id}
                  title={session.pets?.name || 'Pet'}
                  startDate={session.start_date}
                  endDate={session.end_date}
                  status={session.status}
                  agents={session.session_agents?.map((agent: any) => ({
                    id: agent.fur_agent_id,
                    name: agent.profiles?.name,
                    email: agent.profiles?.email,
                  })) ?? []}
                  onPressAgent={(agentId) => navigation.navigate('AgentProfile', { agentId })}
                  onPressEdit={() => openEditSession(session)}
                  onPressDelete={() => {
                    Alert.alert('Delete Care Plan', 'This will remove the care plan permanently.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          const { error } = await supabase
                            .from('sessions')
                            .delete()
                            .eq('id', session.id);
                          if (error) {
                            Alert.alert('Error', 'Unable to delete care plan right now.');
                          } else if (user?.id) {
                            await loadSessions(user.id);
                          }
                        },
                      },
                    ]);
                  }}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <AddPetModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={async () => {
          if (user?.id) {
            await loadPets(user.id);
          }
        }}
      />

      {sessionPetId && (
        <CreateSessionModal
          visible={sessionModalVisible}
          onClose={closeSessionModal}
          petId={sessionPetId}
          session={sessionToEdit ?? undefined}
          onCreated={async () => {
            if (user?.id) {
              await loadSessions(user.id);
            }
          }}
        />
      )}

      <Modal transparent visible={petPickerVisible} animationType="fade" onRequestClose={() => setPetPickerVisible(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setPetPickerVisible(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Choose a pet</Text>
            {pets.map((pet) => (
              <TouchableOpacity key={pet.id} style={styles.pickerItem} onPress={() => openCreateSession(pet.id)}>
                <View style={styles.pickerIcon}>
                  <PetIcon type={pet.pet_type} size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerName}>{pet.name}</Text>
                  {pet.breed && <Text style={styles.pickerDetail}>{pet.breed}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FF' },
  scrollContent: { paddingBottom: 48 },
  header: {
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  greeting: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  name: { fontSize: 34, fontWeight: '700', color: '#fff', marginBottom: 20 },
  badgeRow: { flexDirection: 'row', gap: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 18,
  },
  badgeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1F1F3D' },
  sectionSubtitle: { fontSize: 13, color: '#7B7F9E' },
  quickRow: { flexDirection: 'row', gap: 16 },
  quickCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  quickAdd: { backgroundColor: '#FDE68A' },
  quickPlan: { backgroundColor: '#C4B5FD' },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: { fontSize: 16, fontWeight: '700', color: '#1F1F3D' },
  petGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  petCard: { width: '47%' },
  petGradient: {
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  petIconBubble: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  petImage: { width: 58, height: 58, borderRadius: 18 },
  petName: { fontSize: 18, fontWeight: '700', color: '#1F1F3D' },
  petPlans: { fontSize: 13, fontWeight: '600', color: '#475569' },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, color: '#7B7F9E', textAlign: 'center' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 12 },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: '#1F1F3D' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  pickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F2F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerName: { fontSize: 16, fontWeight: '600', color: '#1F1F3D' },
  pickerDetail: { fontSize: 12, color: '#7B7F9E' },
});
