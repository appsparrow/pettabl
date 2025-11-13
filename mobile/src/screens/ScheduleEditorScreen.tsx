import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

type Props = { route: any; navigation: any };

const ACTIVITIES = ['feed', 'walk', 'letout'] as const;
const PERIODS = ['morning', 'afternoon', 'evening'] as const;

export default function ScheduleEditorScreen({ route, navigation }: Props) {
  const { petId } = route.params;
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [feedingInstruction, setFeedingInstruction] = useState('');
  const [walkingInstruction, setWalkingInstruction] = useState('');
  const [letoutInstruction, setLetoutInstruction] = useState('');

  useEffect(() => {
    loadSchedule();
  }, [petId]);

  const loadSchedule = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('id, feeding_instruction, walking_instruction, letout_instruction, schedule_times(id, activity_type, time_period)')
      .eq('pet_id', petId)
      .maybeSingle();
    if (error) {
      console.log('Error loading schedule', error);
    }
    if (data) {
      setScheduleId(data.id);
      const map: Record<string, boolean> = {};
      data.schedule_times?.forEach((t: any) => {
        map[`${t.activity_type}_${t.time_period}`] = true;
      });
      setSelected(map);
      setFeedingInstruction(data.feeding_instruction || '');
      setWalkingInstruction(data.walking_instruction || '');
      setLetoutInstruction(data.letout_instruction || '');
    } else {
      setScheduleId(null);
      setSelected({});
      setFeedingInstruction('');
      setWalkingInstruction('');
      setLetoutInstruction('');
    }
  };

  const toggle = (activity: string, period: string) => {
    const key = `${activity}_${period}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      let id = scheduleId;
      if (!id) {
        const { data, error } = await supabase
          .from('schedules')
          .insert({
            pet_id: petId,
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
          })
          .select('id')
          .single();
        if (error) throw error;
        id = data.id;
        setScheduleId(id);
      } else {
        const { error } = await supabase
          .from('schedules')
          .update({
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (error) throw error;
      }
      // Clear existing
      await supabase.from('schedule_times').delete().eq('schedule_id', id!);
      // Insert selected
      const rows = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => {
          const [activity_type, time_period] = k.split('_');
          return { schedule_id: id!, activity_type, time_period };
        });
      if (rows.length > 0) {
        const { error } = await supabase.from('schedule_times').insert(rows);
        if (error) throw error;
      }
      Alert.alert('Saved', 'Daily schedule updated.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Daily Schedule</Text>

        <View style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>Care Instructions</Text>
          <Text style={styles.sectionHelper}>Bring over the notes from the desktop schedule—quantities, routes, or reminders show up here.</Text>

          <View style={styles.instructionGroup}>
            <Text style={styles.instructionLabel}>Feeding</Text>
            <TextInput
              style={styles.instructionInput}
              placeholder="How much to feed? Include treats or meds."
              value={feedingInstruction}
              onChangeText={setFeedingInstruction}
              multiline
            />
          </View>
          <View style={styles.instructionGroup}>
            <Text style={styles.instructionLabel}>Walking</Text>
            <TextInput
              style={styles.instructionInput}
              placeholder="Route, duration, equipment reminders."
              value={walkingInstruction}
              onChangeText={setWalkingInstruction}
              multiline
            />
          </View>
          <View style={styles.instructionGroup}>
            <Text style={styles.instructionLabel}>Let Out / Potty</Text>
            <TextInput
              style={styles.instructionInput}
              placeholder="Yard access, pee pad notes, special cues."
              value={letoutInstruction}
              onChangeText={setLetoutInstruction}
              multiline
            />
          </View>
        </View>

        {PERIODS.map((period) => (
          <View key={period} style={styles.periodBlock}>
            <Text style={styles.periodTitle}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
            <View style={styles.row}>
              {ACTIVITIES.map((a) => {
                const key = `${a}_${period}`;
                const active = !!selected[key];
                return (
                  <TouchableOpacity key={key} onPress={() => toggle(a, period)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            disabled={saving} 
            style={[styles.primaryButton, saving && styles.primaryButtonDisabled]} 
            onPress={save}
          >
            <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Schedule'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, gap: 16 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  instructionsCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionHelper: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  instructionGroup: { gap: 8 },
  instructionLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  instructionInput: {
    minHeight: 80,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: '#F7F8FF',
  },
  periodBlock: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  periodTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 2, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  chipText: { color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  secondaryButton: { 
    flex: 1, 
    height: 52, 
    borderRadius: 14, 
    borderWidth: 2, 
    borderColor: colors.border, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#fff' 
  },
  secondaryButtonText: { color: colors.textMuted, fontWeight: '600', fontSize: 16 },
  primaryButton: { 
    flex: 1, 
    height: 52, 
    backgroundColor: colors.primary, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});


