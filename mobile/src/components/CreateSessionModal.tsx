import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { format } from 'date-fns';

type Props = {
  visible: boolean;
  onClose: () => void;
  petId: string;
  onCreated: () => void;
  session?: any; // if provided, modal is in edit mode
};

export function CreateSessionModal({ visible, onClose, petId, onCreated, session }: Props) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) return;

    if (session) {
      setStartDate(new Date(session.start_date));
      setEndDate(new Date(session.end_date));
      setNotes(session.notes ?? '');
      const existingAgents = (session.session_agents || []).map((a: any) => ({
        id: a.fur_agent_id,
        name: a.profiles?.name ?? '',
        email: a.profiles?.email ?? '',
      }));
      setSelectedAgents(existingAgents);
    } else {
      const today = new Date();
      setStartDate(today);
      setEndDate(new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000));
      setNotes('');
      setSelectedAgents([]);
    }
  }, [visible, session]);

  useEffect(() => {
    if (!visible) return;
    void getCurrentUser();
  }, [visible]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
  };

  useEffect(() => {
    const t = setTimeout(() => { void searchAgents(); }, 300);
    return () => clearTimeout(t);
  }, [search, visible]);

  const searchAgents = async () => {
    if (!visible) return;
    const term = search.trim();
    if (term.length < 2) {
      setOptions([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id,name,email,phone')
      .or(`email.ilike.%${term}%,name.ilike.%${term}%,phone.ilike.%${term}%`);

    if (error) {
      console.log('Agent search error:', error);
      setOptions([]);
    } else {
      const filtered = (data || []).filter((profile) => profile.id !== currentUserId);
      console.log('Agent search results:', filtered);
      setOptions(filtered);
    }
  };

  const toggleAgent = (agent: any) => {
    setSelectedAgents((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) return prev.filter((a) => a.id !== agent.id);
      return [...prev, agent];
    });
  };

  const createSession = async () => {
    setSaving(true);
    try {
      console.log('=== CREATE SESSION DEBUG ===');
      console.log('Selected agents:', selectedAgents);
      console.log('Selected agents count:', selectedAgents.length);
      console.log('============================');
      
      const status = computeStatus(startDate, endDate);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      if (session) {
        // edit
        const { error } = await supabase
          .from('sessions')
          .update({
            start_date: startDate.toISOString().slice(0, 10),
            end_date: endDate.toISOString().slice(0, 10),
            status,
            notes: notes || null,
          })
          .eq('id', session.id);
        if (error) throw error;
        // reset assignments
        await supabase.from('session_agents').delete().eq('session_id', session.id);
        if (selectedAgents.length > 0) {
          const insertPayload = selectedAgents.map((a) => ({ session_id: session.id, fur_agent_id: a.id }));
          const { error: agentError } = await supabase.from('session_agents').insert(insertPayload);
          if (agentError) throw agentError;
        }
      } else {
        // create
        const { data: created, error } = await supabase.from('sessions').insert({
          pet_id: petId,
          fur_boss_id: user.id,
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
          status,
          notes: notes || null,
        }).select('id').single();
        if (error) throw error;
        console.log('Session created:', created);
        if (selectedAgents.length > 0 && created?.id) {
          const agentInserts = selectedAgents.map((a) => ({ session_id: created.id, fur_agent_id: a.id }));
          console.log('Inserting agents:', agentInserts);
          const { error: agentError } = await supabase.from('session_agents').insert(agentInserts);
          if (agentError) throw agentError;
        }
      }
      onCreated();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const computeStatus = (start: Date, end: Date) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const s = start.toISOString().slice(0, 10);
    const e = end.toISOString().slice(0, 10);
    if (todayStr < s) return 'planned';
    if (todayStr > e) return 'completed';
    return 'active';
  };

  const formattedDate = (date: Date) => format(date, 'MMM d, yyyy');

  const onChangeDate = (type: 'start' | 'end') => (
    event: any,
    date?: Date,
  ) => {
    if (!date) {
      if (Platform.OS !== 'ios') setActivePicker(null);
      return;
    }
    if (type === 'start') {
      setStartDate(date);
      if (date > endDate) setEndDate(date);
    } else {
      setEndDate(date);
      if (date < startDate) setStartDate(date);
    }
    if (Platform.OS !== 'ios') {
      setActivePicker(null);
    }
  };

  useEffect(() => {
    if (!visible) {
      setActivePicker(null);
    }
  }, [visible]);

  const scrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboard}
          >
            <View style={styles.sheet}>
              <View style={styles.grabber} />
              <ScrollView
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}
              >
                <Text style={styles.title}>{session ? 'Edit Session' : 'Create Session'}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Start</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setActivePicker((prev) => (prev === 'start' ? null : 'start'))}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.dateButtonText}>{formattedDate(startDate)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>End</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setActivePicker((prev) => (prev === 'end' ? null : 'end'))}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.dateButtonText}>{formattedDate(endDate)}</Text>
                  </TouchableOpacity>
                </View>
                {activePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={activePicker === 'start' ? startDate : endDate}
                      onChange={onChangeDate(activePicker)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                      style={styles.nativePicker}
                      themeVariant="dark"
                    />
                    {Platform.OS === 'ios' && (
                      <View style={styles.pickerActions}>
                        <TouchableOpacity onPress={() => setActivePicker(null)} style={styles.doneButton}>
                          <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
                <Text style={[styles.label, { marginTop: 12 }]}>Notes</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Special instructions"
                  style={[styles.input, styles.multiline]}
                  multiline
                  numberOfLines={3}
                  onFocus={scrollToEnd}
                />
                <Text style={[styles.label, { marginTop: 16 }]}>Assign Agents</Text>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by email"
                  style={styles.input}
                  onFocus={scrollToEnd}
                  returnKeyType="search"
                />
                {options.length > 0 && (
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.id}
                    style={styles.agentList}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => {
                      const active = selectedAgents.some((a) => a.id === item.id);
                      return (
                        <TouchableOpacity
                          onPress={() => toggleAgent(item)}
                          style={[styles.agentItem, active && styles.agentItemActive]}
                        >
                          <Text style={[styles.agentText, active && styles.agentTextActive]}>
                            {item.name || item.email}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
                {selectedAgents.length > 0 && (
                  <View style={styles.chipRow}>
                    {selectedAgents.map((a) => (
                      <View key={a.id} style={styles.agentChip}>
                        <Text style={styles.agentChipText}>{a.name || a.email}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity disabled={saving} style={[styles.primaryButton, { flex: 1 }]} onPress={createSession}>
                    <Text style={styles.primaryButtonText}>
                      {saving ? 'Saving...' : session ? 'Save Changes' : 'Create Session'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  content: { paddingBottom: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  dateButton: {
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  dateButtonText: { color: '#1E3A8A', fontSize: 15, fontWeight: '700' },
  pickerContainer: {
    marginTop: 4,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  nativePicker: { width: '100%' },
  pickerActions: { alignItems: 'flex-end' },
  doneButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.primary },
  doneButtonText: { color: '#fff', fontWeight: '600' },
  label: { fontSize: 16, color: colors.text },
  input: { borderWidth: 2, borderColor: colors.border, borderRadius: 14, padding: 12, color: colors.text },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  agentList: { maxHeight: 140, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryButton: { height: 52, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  cancelButton: { height: 52, backgroundColor: '#F3F4F6', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: colors.textMuted, fontWeight: '600' },
  agentItem: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 2, borderColor: colors.border, borderRadius: 12, marginBottom: 6 },
  agentItemActive: { borderColor: '#1D4ED8', backgroundColor: '#DBEAFE' },
  agentText: { color: colors.text },
  agentTextActive: { color: colors.primary, fontWeight: '700' },
  agentChip: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  agentChipText: { color: '#1D4ED8', fontWeight: '700' },
});


