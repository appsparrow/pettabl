import { memo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Calendar, Edit, Trash2, UserRound } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
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
  emptyAgentsLabel = 'Assign an agent to this plan',
}: Props) {
  const statusStyle = statusStyles[status] ?? statusStyles.active;
  const formattedRange = `${format(parseISO(startDate), 'MMM d, yyyy')} – ${format(parseISO(endDate), 'MMM d, yyyy')}`;

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
  const swipeRef = useRef<Swipeable | null>(null);

  const playHint = () => {
    if (hinted || !(onPressEdit || onPressDelete)) return;
    setHinted(true);
    swipeRef.current?.openRight();
    setTimeout(() => {
      swipeRef.current?.close();
      setTimeout(() => setHinted(false), 1200);
    }, 320);
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderActions}
      friction={2}
      overshootRight={false}
      rightThreshold={rightActionWidth / 2}
    >
      <Pressable onPress={playHint} style={{ flex: 1 }}>
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
            <Text style={styles.agentLabel}>Agents</Text>
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
    </Swipeable>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
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
});
