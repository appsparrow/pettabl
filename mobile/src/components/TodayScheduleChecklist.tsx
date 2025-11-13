import type { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Check, Utensils, Footprints, Home, Sun, Cloud, Moon, Camera } from 'lucide-react-native';
import { colors } from '../theme/colors';

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

type InstructionMap = Partial<Record<'feed' | 'walk' | 'letout', string | null | undefined>>;

interface Props {
  scheduleTimes: ScheduleTime[];
  completedActivities: Activity[];
  onCheckActivity: (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening') => void;
  onUnmarkActivity?: (activityId: string) => void;
  instructions?: InstructionMap;
  onPressPhoto?: (activity: Activity) => void;
}

const getActivityIcon = (type: string, size = 20) => {
  switch (type) {
    case 'feed': return <Utensils color={colors.text} size={size} />;
    case 'walk': return <Footprints color={colors.text} size={size} />;
    case 'letout': return <Home color={colors.text} size={size} />;
    default: return <Calendar color={colors.text} size={size} />;
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case 'feed': return 'Feed';
    case 'walk': return 'Walk';
    case 'letout': return 'Let Out';
    default: return type;
  }
};

const getTimePeriodIcon = (timePeriod: string, size = 18) => {
  switch (timePeriod) {
    case 'morning': return <Sun color="#F59E0B" size={size} />;
    case 'afternoon': return <Cloud color="#3B82F6" size={size} />;
    case 'evening': return <Moon color="#8B5CF6" size={size} />;
    default: return <Calendar color={colors.text} size={size} />;
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export function TodayScheduleChecklist({ 
  scheduleTimes, 
  completedActivities,
  onCheckActivity,
  onUnmarkActivity,
  instructions,
  onPressPhoto,
}: Props) {
  const isCompleted = (activityType: string, timePeriod: string) => {
    return completedActivities.some(
      activity => activity.activity_type === activityType && activity.time_period === timePeriod
    );
  };

  const getCompletedActivity = (activityType: string, timePeriod: string) => {
    return completedActivities.find(
      activity => activity.activity_type === activityType && activity.time_period === timePeriod
    );
  };

  // Group schedule times by time period
  const groupedSchedule = scheduleTimes.reduce((acc, item) => {
    if (!acc[item.time_period]) {
      acc[item.time_period] = [];
    }
    acc[item.time_period].push(item);
    return acc;
  }, {} as Record<string, ScheduleTime[]>);

  const periods = ['morning', 'afternoon', 'evening'] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.card}
      >
        <View style={styles.header}>
          <Calendar color={colors.primary} size={24} />
          <Text style={styles.title}>Today's Schedule</Text>
        </View>

        {scheduleTimes.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color="#D1D5DB" size={64} />
            <Text style={styles.emptyTitle}>No schedule set yet</Text>
            <Text style={styles.emptyText}>Ask your Fur Boss to set up the daily schedule!</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {(instructions?.feed || instructions?.walk || instructions?.letout) && (
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsHeading}>Care instructions</Text>
                {instructions?.feed ? (
                  <InstructionLine label="Feeding" value={instructions.feed} icon={<Utensils color="#F97316" size={16} />} />
                ) : null}
                {instructions?.walk ? (
                  <InstructionLine label="Walking" value={instructions.walk} icon={<Footprints color="#0EA5E9" size={16} />} />
                ) : null}
                {instructions?.letout ? (
                  <InstructionLine label="Let Out" value={instructions.letout} icon={<Home color="#6366F1" size={16} />} />
                ) : null}
              </View>
            )}
            {periods.map((period) => {
              const periodItems = groupedSchedule[period] || [];
              if (periodItems.length === 0) return null;

              return (
                <View key={period} style={styles.periodSection}>
                  <View style={styles.periodHeader}>
                    {getTimePeriodIcon(period)}
                    <Text style={styles.periodTitle}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
                  </View>
                  
                  {periodItems.map((item) => {
                    const completed = isCompleted(item.activity_type, item.time_period);
                    const activity = getCompletedActivity(item.activity_type, item.time_period);
                    const specificInstruction = instructions?.[item.activity_type]?.trim();

                    return (
                      <View
                        key={`${item.activity_type}-${item.time_period}`}
                        style={[
                          styles.activityItem,
                          completed && styles.activityItemCompleted
                        ]}
                      >
                        <View style={styles.activityContent}>
                          <View style={[
                            styles.iconCircle,
                            completed && styles.iconCircleCompleted
                          ]}>
                            {completed ? (
                              <Check color="#10B981" size={20} />
                            ) : (
                              getActivityIcon(item.activity_type, 20)
                            )}
                          </View>
                          
                          <View style={styles.activityInfo}>
                            <Text style={[
                              styles.activityLabel,
                              completed && styles.activityLabelCompleted
                            ]}>
                              {getActivityLabel(item.activity_type)}
                            </Text>
                            {specificInstruction ? (
                              <Text
                                style={[
                                  styles.instructionText,
                                  completed && styles.instructionTextCompleted
                                ]}
                                numberOfLines={3}
                              >
                                {specificInstruction}
                              </Text>
                            ) : null}
                            {completed && activity && (
                              <View style={styles.completedInfo}>
                                <Text style={styles.completedText}>
                                  ✓ by {activity.caretaker?.name || 'Agent'} at {formatTime(activity.created_at)}
                                </Text>
                                {activity.photo_url && (
                                  <TouchableOpacity
                                    onPress={onPressPhoto ? () => onPressPhoto(activity) : undefined}
                                    activeOpacity={onPressPhoto ? 0.75 : 1}
                                  >
                                    <View style={styles.photoBadge}>
                                      <Camera color="#10B981" size={12} />
                                      <Text style={styles.photoBadgeText}>Photo</Text>
                                    </View>
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>
                        </View>

                        {completed && onUnmarkActivity && activity ? (
                          <TouchableOpacity
                            onPress={() => onUnmarkActivity(activity.id)}
                            style={styles.undoButton}
                          >
                            <Text style={styles.undoButtonText}>Undo</Text>
                          </TouchableOpacity>
                        ) : !completed ? (
                          <TouchableOpacity
                            onPress={() => onCheckActivity(item.activity_type, item.time_period as any)}
                            style={styles.markDoneButton}
                          >
                            <LinearGradient
                              colors={['#34D399', '#10B981']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.markDoneGradient}
                            >
                              <Text style={styles.markDoneText}>Mark Done</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    gap: 20,
  },
  instructionsCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  instructionsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2943',
    textTransform: 'uppercase',
  },
  periodSection: {
    gap: 12,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
  },
  activityItemCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleCompleted: {
    backgroundColor: '#D1FAE5',
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  activityLabelCompleted: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  instructionText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  instructionTextCompleted: {
    color: '#047857',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  photoBadgeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  undoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  undoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  markDoneButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  markDoneGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  markDoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

function InstructionLine({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937' }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 12, color: '#475569', lineHeight: 16 }}>{value.trim()}</Text>
    </View>
  );
}

