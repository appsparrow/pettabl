import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { useFocusEffect } from '@react-navigation/native';
import { TodayScheduleChecklist } from '../components/TodayScheduleChecklist';
import * as ImagePicker from 'expo-image-picker';
import { format, parseISO } from 'date-fns';
import { PetIcon, PetType } from '../components/PetIcon';
import { uploadImageToR2, deleteImageFromR2 } from '../lib/r2-storage';
import { ImageLightboxModal } from '../components/ImageLightboxModal';

interface Schedule {
  id: string;
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
}

interface ScheduleTime {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
}

interface Activity {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker?: {
    name: string;
  };
  photo_url?: string;
  created_at: string;
}

interface Pet {
  id: string;
  name: string;
  photo_url: string | null;
  breed: string | null;
  pet_type: string | null;
}

export default function AgentPetDetailScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleTimes, setScheduleTimes] = useState<ScheduleTime[]>([]);
  const [activitiesData, setActivitiesData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<{ uri: string; title?: string; subtitle?: string; meta?: string } | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ start_date: string; end_date: string } | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadPetAndSchedule();
    }
  }, [sessionId]);

  useFocusEffect(useCallback(() => { if (sessionId) loadPetAndSchedule(); }, [sessionId]));

  const loadPetAndSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.navigate('Auth');
        return;
      }

      // Get session and pet info
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          pet_id,
          start_date,
          end_date,
          notes,
          pets (
            id,
            name,
            photo_url,
            breed,
            pet_type
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData?.pets) {
        const petInfo = sessionData.pets as unknown as Pet;
        setPet(petInfo);
        setSessionInfo({
          start_date: sessionData.start_date,
          end_date: sessionData.end_date,
        });

        // Get schedule for this pet
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('*')
          .eq('pet_id', sessionData.pet_id)
          .is('session_id', null)
          .maybeSingle();

        if (scheduleData) {
          setSchedule(scheduleData);

          // Get schedule times
          const { data: timesData } = await supabase
            .from('schedule_times')
            .select('*')
            .eq('schedule_id', scheduleData.id);

          if (timesData) {
            setScheduleTimes(timesData as ScheduleTime[]);
          }
        }

        // Get today's activities
        const today = new Date().toISOString().split('T')[0];
        const { data: activitiesData } = await supabase
          .from('activities')
          .select(`
            *,
            caretaker:profiles!activities_caretaker_id_fkey (
              name,
              email
            )
          `)
          .eq('session_id', sessionId)
          .eq('date', today)
          .order('created_at', { ascending: false });

        if (activitiesData) {
          setActivitiesData(activitiesData as any);
        }
      }
    } catch (error) {
      console.error('Error loading pet and schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckActivity = async (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening') => {
    // Ask if they want to add a photo
    Alert.alert(
      'Mark Activity Complete',
      'Would you like to add a photo?',
      [
        {
          text: 'Just Mark Done',
          onPress: () => markActivityComplete(activityType, timePeriod, null),
        },
        {
          text: 'Add Photo',
          onPress: () => pickPhotoAndMark(activityType, timePeriod),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickPhotoAndMark = async (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await markActivityComplete(activityType, timePeriod, result.assets[0].uri);
    }
  };

  const markActivityComplete = async (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening', photoUri: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let photoUrl = null;
      if (photoUri) {
        photoUrl = await uploadImageToR2(photoUri, 'activities', true);
      }

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('activities').insert({
        session_id: sessionId,
        pet_id: pet?.id,
        caretaker_id: user.id,
        activity_type: activityType,
        time_period: timePeriod,
        date: today,
        photo_url: photoUrl,
      });

      if (error) throw error;

      await loadPetAndSchedule();
    } catch (error) {
      console.error('Error marking activity:', error);
      Alert.alert('Error', 'Failed to mark activity complete');
    }
  };

  const handleUnmarkActivity = async (activityId: string) => {
    try {
      const activity = activitiesData.find((a) => a.id === activityId);
      if (activity?.photo_url && activity.photo_url.includes('r2')) {
        try {
          await deleteImageFromR2(activity.photo_url);
        } catch (deleteErr) {
          console.warn('Failed to remove activity photo from R2', deleteErr);
        }
      }

      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      await loadPetAndSchedule();
    } catch (error) {
      console.error('Error unmarking activity:', error);
      Alert.alert('Error', 'Failed to unmark activity');
    }
  };

  const handleViewPhoto = (activity: Activity) => {
    if (!activity.photo_url) return;
    setLightboxImage({
      uri: activity.photo_url,
      title: `${pet?.name || 'Pet'} — ${activity.activity_type.toUpperCase()}`,
      subtitle: activity.caretaker?.name ? `Uploaded by ${activity.caretaker.name}` : undefined,
      meta: format(parseISO(activity.created_at), 'MMM d • h:mm a'),
    });
  };

  if (loading || !pet) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isLastDay = sessionInfo && sessionInfo.end_date === format(new Date(), 'yyyy-MM-dd');
  const scheduleInstructions = {
    feed: schedule?.feeding_instruction?.trim() || undefined,
    walk: schedule?.walking_instruction?.trim() || undefined,
    letout: schedule?.letout_instruction?.trim() || undefined,
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#f39de6', '#f8c77f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={20} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.petAvatar}>
            {pet.photo_url ? (
              <Image source={{ uri: pet.photo_url }} style={styles.petPhoto} />
            ) : (
              <PetIcon type={pet?.pet_type ? (pet.pet_type as PetType) : null} color="#F97316" size={40} />
            )}
          </View>
          <View>
            <Text style={styles.petTitle}>{pet.name}</Text>
            {pet.breed && <Text style={styles.petSubtitle}>{pet.breed}</Text>}
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sessionInfo && (
          <View style={styles.sessionPill}>
            <Text style={styles.sessionPillText}>
              Session: {format(parseISO(sessionInfo.start_date), 'MMM d')} - {format(parseISO(sessionInfo.end_date), 'MMM d, yyyy')}
            </Text>
          </View>
        )}

        {isLastDay && (
          <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.lastDayCard}>
            <Text style={styles.lastDayText}>
              🥹 Last day together! Give {pet.name} extra snuggles before you go.
            </Text>
          </LinearGradient>
        )}

        <TodayScheduleChecklist
          scheduleTimes={scheduleTimes}
          completedActivities={activitiesData}
          onCheckActivity={handleCheckActivity}
          onUnmarkActivity={handleUnmarkActivity}
          instructions={scheduleInstructions}
          onPressPhoto={handleViewPhoto}
        />
      </ScrollView>
      <ImageLightboxModal
        visible={!!lightboxImage}
        imageUrl={lightboxImage?.uri ?? null}
        title={lightboxImage?.title}
        subtitle={lightboxImage?.subtitle}
        meta={lightboxImage?.meta}
        onClose={() => setLightboxImage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F8FF' },
  header: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  petAvatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petPhoto: { width: '100%', height: '100%' },
  petTitle: { fontSize: 32, fontWeight: '700', color: '#fff' },
  petSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  sessionPill: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sessionPillText: { fontSize: 14, fontWeight: '600', color: '#7C3AED' },
  lastDayCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lastDayText: { fontSize: 14, color: '#92400E', textAlign: 'center', fontWeight: '600' },
});
