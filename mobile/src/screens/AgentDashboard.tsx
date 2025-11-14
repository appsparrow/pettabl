import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Star } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { useFocusEffect } from '@react-navigation/native';
import PetWatchCard, { PetWatchCardProps } from '../components/PetWatchCard';
import type { PetType } from '../components/PetIcon';
import { eachDayOfInterval, format, parseISO, isAfter } from 'date-fns';
import { useRole } from '../context/RoleContext';

type DayStatus = 'future' | 'none' | 'partial' | 'complete';

type PetWatch = PetWatchCardProps;

export default function AgentDashboard({ navigation }: any) {
  const [petWatches, setPetWatches] = useState<PetWatch[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming'>('current');
  const { activeRole } = useRole();

  useEffect(() => {
    if (activeRole === 'fur_agent') {
      loadData();
    }
  }, [activeRole]);
  
  useFocusEffect(
    useCallback(() => {
      if (activeRole === 'fur_agent') {
        loadData();
      }
    }, [activeRole])
  );

  const onRefresh = async () => {
    if (activeRole !== 'fur_agent') return;
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    if (activeRole !== 'fur_agent') return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    console.log('Loading pet watches for user:', user.id);

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(profileData);

    // Load petWatches
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('session_agents')
      .select(`
        *,
        sessions(
          *,
          pets(id, name, photo_url, pet_type)
        )
      `)
      .eq('fur_agent_id', user.id);
    
    console.log('=== PET WATCH DEBUG ===');
    console.log('User ID:', user.id);
    console.log('Pet watch count:', data?.length || 0);
    console.log('===============================');

    if (!data || data.length === 0) {
      setPetWatches([]);
      return;
    }

    // For each pet watch, calculate day statuses and today's progress
    const petWatchesWithDetails = await Promise.all(
      data.map(async (item) => {
        const session = item.sessions;
        const pet = session.pets;
        
        // Get schedule times for this pet
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('id')
          .eq('pet_id', session.pet_id)
          .is('session_id', null)
          .maybeSingle();

        let totalActivitiesToday = 0;
        if (scheduleData) {
          const { data: scheduleTimes } = await supabase
            .from('schedule_times')
            .select('*')
            .eq('schedule_id', scheduleData.id);
          totalActivitiesToday = scheduleTimes?.length || 0;
        }

        // Get today's completed activities
        const { data: todayActivities } = await supabase
          .from('activities')
          .select('*')
          .eq('session_id', session.id)
          .eq('date', today);
        const activitiesCount = todayActivities?.length || 0;

        // Get all activities for this session
        const { data: allActivities } = await supabase
          .from('activities')
          .select('date')
          .eq('session_id', session.id);

        // Calculate day statuses
        const start = parseISO(session.start_date);
        const end = parseISO(session.end_date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const daysInSession = eachDayOfInterval({ start, end });

        // Count activities per day
        const activityMap = (allActivities || []).reduce((acc: any, activity: any) => {
          const date = activity.date;
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const scheduleTasksPerDay = totalActivitiesToday;

        const dayStatuses = daysInSession.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          if (isAfter(day, todayDate)) {
            return { date: dayStr, status: 'future' as const };
          }

          const completed = activityMap[dayStr] || 0;
          if (scheduleTasksPerDay === 0) {
            return {
              date: dayStr,
              status: completed > 0 ? ('complete' as const) : ('future' as const),
            };
          }
          if (completed === 0) {
            return { date: dayStr, status: 'none' as const };
          }
          if (completed < scheduleTasksPerDay) {
            return { date: dayStr, status: 'partial' as const };
          }
          return { date: dayStr, status: 'complete' as const };
        });

        const isUpcoming = isAfter(start, todayDate);
        const isLastDayToday = format(end, 'yyyy-MM-dd') === today;

        return {
          session_id: session.id,
          pet_id: session.pet_id,
          pet_name: pet?.name || 'Unknown Pet',
          pet_photo_url: pet?.photo_url || null,
          pet_type: (pet?.pet_type as PetType | null | undefined) ?? null,
          start_date: session.start_date,
          end_date: session.end_date,
          status: session.status,
          activities_today: activitiesCount,
          total_activities_today: totalActivitiesToday,
          day_statuses: dayStatuses,
          isLastDayToday,
          isUpcoming,
        };
      })
    );

    setPetWatches(petWatchesWithDetails);
  };

  const currentPetWatches = petWatches.filter((watch) => !watch.isUpcoming);
  const upcomingPetWatches = petWatches.filter((watch) => watch.isUpcoming);
  const visiblePetWatches = activeTab === 'current' ? currentPetWatches : upcomingPetWatches;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <LinearGradient
          colors={['#f39de6', '#f8c77f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.helloText}>Hello</Text>
              <Text style={styles.nameText}>{profile?.name || 'Agent'}</Text>
            </View>
            <View style={styles.pointsCard}>
              <View style={styles.pointsIcon}>
                <Star color="#fcd34d" size={18} fill="#fcd34d" />
              </View>
              <View>
                <Text style={styles.pointsLabel}>Your Paw Points</Text>
                <Text style={styles.pointsValue}>{profile?.paw_points || 0}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.petWatchSection}>
          {refreshing && (
            <View style={styles.refreshBanner}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.refreshText}>Refreshing…</Text>
            </View>
          )}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Pet Watches</Text>
            <View style={styles.tabGroup}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'current' && styles.tabButtonActive]}
                onPress={() => setActiveTab('current')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'current' && styles.tabButtonTextActive]}>Current</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
                onPress={() => setActiveTab('upcoming')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'upcoming' && styles.tabButtonTextActive]}>Upcoming</Text>
              </TouchableOpacity>
            </View>
          </View>

          {visiblePetWatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'current' ? 'No active pet watches' : 'No upcoming pet watches yet'}
              </Text>
              <Text style={styles.emptyText}>
                You’ll see your pet watches here once a Pet Boss schedules you!
              </Text>
            </View>
          ) : (
            visiblePetWatches.map((watch) => (
              <PetWatchCard
                key={watch.session_id}
                watch={watch}
                onPress={() => navigation.navigate('AgentPetDetail', { sessionId: watch.session_id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FF' },
  scrollContent: { paddingBottom: 48, paddingHorizontal: 0 },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helloText: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  nameText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  pointsCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsLabel: { fontSize: 12, color: '#fff', opacity: 0.85 },
  pointsValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  petWatchSection: {
    paddingTop: 24,
    paddingHorizontal: Platform.select({ web: 16, default: 24 }),
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  refreshText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#232946' },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 4,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#f977ce',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7b7f9e',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 48,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1f2233', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7b7f9e', textAlign: 'center', paddingHorizontal: 32 },
  petWatchCard: {
    backgroundColor: '#FFF6FF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#FFC7F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 246, 0.35)',
  },
});
