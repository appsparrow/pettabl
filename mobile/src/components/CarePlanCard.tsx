import { memo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Calendar, Edit, Trash2, UserRound } from 'lucide-react-native';
let SwipeableComponent: any = null;
if (Platform.OS !== 'web') {
  SwipeableComponent = require('react-native-gesture-handler').Swipeable;
}
import { format, parseISO } from 'date-fns';
import { colors } from '../theme/colors';

export type CarePlanAgent = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type Status = 'active' | 'planned' | 'completed' | string;

const statusStyles: Record<string, { background: string; text: string }> = {
  active: { background: '#D1FAE5', text: '#047857' },
  planned: { background: '#DBEAFE', text: '#1D4ED8' },
  completed: { background: '#FCE7F3', text: '#9D174D' },
};

interface Props {
  title: string;
  startDate: string;
  endDate: string;
  status: Status;
  agents: CarePlanAgent[];
  onPressAgent?: (agentId: string) => void;
  onPressEdit?: () => void;
  onPressDelete?: () => void;
  emptyAgentsLabel?: string;
}

function CarePlanCardComponent({
  title,
  startDate,
  endDate,
  status,
  agents,
  onPressAgent,
  onPressEdit,
  onPressDelete,
  emptyAgentsLabel = 'Assign an person to this pet watch',
}: Props) {
  const statusStyle = statusStyles[status] ?? statusStyles.active;
  const formattedRange = `${format(parseISO(startDate), 'MMM d, yyyy')} – ${format(parseISO(endDate), 'MMM d, yyyy')}`;
  const isWeb = Platform.OS === 'web';

  const rightActionWidth = 84;
  const renderActions = () => (
    <View style={styles.actionContainer}>
      {onPressDelete && (
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onPressDelete}>
          <Trash2 color="#fff" size={18} />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      )}
      {onPressEdit && (
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onPressEdit}>
          <Edit color="#fff" size={18} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const [hinted, setHinted] = useState(false);
  const swipeRef = useRef<any>(null);

  const playHint = () => {
    if (isWeb || hinted || !(onPressEdit || onPressDelete) || !SwipeableComponent) return;
    setHinted(true);
    swipeRef.current?.openRight();
    setTimeout(() => {
      swipeRef.current?.close();
      setTimeout(() => setHinted(false), 1200);
    }, 320);
  };

  const cardContent = (
    <Pressable onPress={isWeb ? undefined : playHint} style={{ flex: 1 }}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusPill, { backgroundColor: statusStyle.background }]}>
              <Text style={[styles.statusLabel, { color: statusStyle.text }]}>{status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <Calendar color={colors.textMuted} size={16} />
          <Text style={styles.dateText}>{formattedRange}</Text>
        </View>

        <View style={styles.agentSection}>
          <Text style={styles.agentLabel}>Pet Watchers</Text>
          {agents.length === 0 ? (
            <Text style={styles.emptyAgents}>{emptyAgentsLabel}</Text>
          ) : (
            <View style={styles.agentRow}>
              {agents.map((agent) => (
                <TouchableOpacity
                  key={agent.id}
                  style={styles.agentChip}
                  onPress={onPressAgent ? () => onPressAgent(agent.id) : undefined}
                  activeOpacity={onPressAgent ? 0.85 : 1}
                >
                  <View style={styles.agentAvatar}>
                    <UserRound color={colors.primary} size={14} />
                  </View>
                  <Text style={styles.agentName}>{agent.name || agent.email || 'Agent'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (isWeb || !(onPressEdit || onPressDelete) || !SwipeableComponent) {
    return (
      <View style={{ marginBottom: 14 }}>
        {cardContent}
        {isWeb && (onPressEdit || onPressDelete) && (
          <View style={styles.webActions}>
            {onPressEdit && (
              <TouchableOpacity style={[styles.webActionButton, styles.editButton]} onPress={onPressEdit}>
                <Edit color="#fff" size={14} />
                <Text style={styles.webActionText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onPressDelete && (
              <TouchableOpacity style={[styles.webActionButton, styles.deleteButton]} onPress={onPressDelete}>
                <Trash2 color="#fff" size={14} />
                <Text style={styles.webActionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <SwipeableComponent
      ref={swipeRef}
      renderRightActions={renderActions}
      friction={2}
      overshootRight={false}
      rightThreshold={rightActionWidth / 2}
    >
      {cardContent}
    </SwipeableComponent>
  );
}

export const CarePlanCard = memo(CarePlanCardComponent);

const styles = StyleSheet.create({
  actionContainer: { alignItems: 'center', justifyContent: 'space-between', width: 84, height: '100%', paddingVertical: 18 },
  actionButton: { width: 68, justifyContent: 'center', alignItems: 'center', paddingVertical: 12, gap: 4, borderRadius: 14 },
  deleteButton: { backgroundColor: '#EF4444' },
  editButton: { backgroundColor: colors.primary },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    gap: 12,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 12px 28px rgba(15, 23, 42, 0.12)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusLabel: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 14, color: colors.textMuted },
  agentSection: { gap: 8 },
  agentLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  agentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  agentChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#F1F5F9' },
  agentAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  agentName: { color: colors.primary, fontWeight: '700' },
  emptyAgents: { color: colors.textMuted, fontSize: 13 },
  webActions: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  webActionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  webActionText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
