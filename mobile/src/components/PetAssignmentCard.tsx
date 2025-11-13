import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Bone } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { PetIcon, PetType } from './PetIcon';

export type DayStatus = 'future' | 'none' | 'partial' | 'complete';

interface DayStatusEntry {
  date: string;
  status: DayStatus;
}

export interface PetAssignmentCardProps {
  session_id: string;
  pet_id: string;
  pet_name: string;
  pet_photo_url?: string | null;
  pet_type?: PetType | null;
  start_date: string;
  end_date: string;
  status: string;
  activities_today: number;
  total_activities_today: number;
  day_statuses: DayStatusEntry[];
  isLastDayToday: boolean;
  isUpcoming: boolean;
}

interface Props {
  assignment: PetAssignmentCardProps;
  onPress: () => void;
}

const statusColors: Record<DayStatus, string> = {
  future: '#E5E7EB',
  none: '#F87171',
  partial: '#FB923C',
  complete: '#34D399',
};

const MAX_VISIBLE_DOTS = 30;

export function PetAssignmentCard({ assignment, onPress }: Props) {
  const [legendVisible, setLegendVisible] = useState(false);
  const completionPercentage =
    assignment.total_activities_today > 0
      ? Math.round((assignment.activities_today / assignment.total_activities_today) * 100)
      : assignment.activities_today > 0
        ? 100
        : 0;

  const { visibleStatuses, remaining } = useMemo(() => {
    const visible = assignment.day_statuses.slice(0, MAX_VISIBLE_DOTS);
    const extra = Math.max(assignment.day_statuses.length - visible.length, 0);
    return { visibleStatuses: visible, remaining: extra };
  }, [assignment.day_statuses]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.wrapper}>
      <LinearGradient
        colors={['#F7F6FF', '#FFF6FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.avatarBadge}>
            {assignment.pet_photo_url ? (
              <Image source={{ uri: assignment.pet_photo_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.iconFallback}>
                {assignment.pet_type ? (
                  <PetIcon type={assignment.pet_type} size={24} color="#F97316" />
                ) : (
                  <Bone color="#F97316" size={22} />
                )}
              </View>
            )}
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.petName} numberOfLines={1}>{assignment.pet_name}</Text>
            <View style={[styles.statusPill, assignment.status === 'active' ? styles.statusActive : styles.statusInactive]}>
              <Text style={[styles.statusText, assignment.status !== 'active' && styles.statusTextMuted]}>
                {assignment.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Calendar color="#64748B" size={14} />
          <Text style={styles.dateText}>
            {format(parseISO(assignment.start_date), 'MMM d')} – {format(parseISO(assignment.end_date), 'MMM d, yyyy')}
          </Text>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Progress timeline</Text>
            <TouchableOpacity onPress={() => setLegendVisible((prev) => !prev)}>
              <Text style={styles.legendToggle}>{legendVisible ? 'Hide legend' : 'Legend'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dotsGrid}>
            {visibleStatuses.map((entry, index) => (
              <View key={`${entry.date}-${index}`} style={[styles.dot, { backgroundColor: statusColors[entry.status] }]} />
            ))}
            {remaining > 0 && (
              <View style={styles.moreBadge}>
                <Text style={styles.moreText}>+{remaining}</Text>
              </View>
            )}
          </View>
          {legendVisible && (
            <View style={styles.legendCard}>
              <LegendRow color={statusColors.none} label="Nothing logged" />
              <LegendRow color={statusColors.partial} label="Partially logged" />
              <LegendRow color={statusColors.complete} label="All done" />
            </View>
          )}
        </View>

        {assignment.total_activities_today > 0 && !assignment.isUpcoming && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Today's Tasks</Text>
              <Text style={styles.progressLabel}>
                {assignment.activities_today}/{assignment.total_activities_today}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#34D399', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${completionPercentage}%` }]}
              />
            </View>
          </View>
        )}

        {assignment.isLastDayToday && (
          <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.lastDayBanner}>
            <Text style={styles.lastDayText}>🥹 Last day with {assignment.pet_name}! Leave it sparkling clean.</Text>
          </LinearGradient>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  card: {
    borderRadius: 30,
    padding: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    gap: 16,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FFE6FB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  iconFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  petName: { fontSize: 20, fontWeight: '700', color: '#1F1F3D', flex: 1 },
  statusPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize', color: '#F97316' },
  statusTextMuted: { color: '#475569' },
  statusActive: { backgroundColor: '#FFE8D6' },
  statusInactive: { backgroundColor: '#E5E7EB' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 14, color: '#64748B' },
  timeline: { gap: 8 },
  timelineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timelineTitle: { fontSize: 13, fontWeight: '600', color: '#475569' },
  legendToggle: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
  dotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 12 },
  moreBadge: {
    minWidth: 30,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  moreText: { fontSize: 11, color: '#4C51BF', fontWeight: '600' },
  legendCard: {
    marginTop: 6,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    gap: 6,
  },
  progressSection: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, color: '#475569', fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  lastDayBanner: { padding: 12, borderRadius: 16 },
  lastDayText: { fontSize: 13, color: '#92400E', fontWeight: '600' },
});

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 10, height: 10, borderRadius: 12, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: '#475569' }}>{label}</Text>
    </View>
  );
}