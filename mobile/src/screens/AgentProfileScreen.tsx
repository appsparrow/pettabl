import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { Mail, Phone, MapPin, UserRound, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

export default function AgentProfileScreen({ route, navigation }: any) {
  const { agentId } = route.params;
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', agentId).single();
      setProfile(data);
    };
    load();
  }, [agentId]);

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const handleCall = () => {
    if (!profile.phone) return;
    const cleaned = profile.phone.replace(/[^\d+]/g, '');
    if (!cleaned) return;
    Linking.openURL(`tel:${cleaned}`).catch(() => undefined);
  };

  const handleAddress = () => {
    if (!profile.address) return;
    const target = encodeURIComponent(profile.address);
    const url = Platform.OS === 'ios' ? `http://maps.apple.com/?q=${target}` : `geo:0,0?q=${target}`;
    Linking.openURL(url).catch(() => undefined);
  };

  const handleEmail = () => {
    if (!profile.email) return;
    Clipboard.setStringAsync(profile.email).then(() => {
      Alert.alert('Copied', 'Email address copied to clipboard.');
    }).catch(() => undefined);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#EEF2FF', '#FFFFFF']} style={StyleSheet.absoluteFillObject} pointerEvents="none" />
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <ArrowLeft color={colors.text} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarShell}>
          <View style={styles.avatarShadow}>
            <View style={styles.avatar}>
              {profile.photo_url ? (
                <Image source={{ uri: profile.photo_url }} style={styles.avatarImage} />
              ) : (
                <UserRound color={colors.primary} size={54} />
              )}
            </View>
          </View>
          <Text style={styles.name}>{profile.name || 'Agent'}</Text>
          {profile.role && <Text style={styles.roleTag}>{profile.role === 'fur_agent' ? 'Fur Agent' : 'Team Member'}</Text>}
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.contactRow, !profile.email && styles.contactDisabled]}
            onPress={handleEmail}
            activeOpacity={profile.email ? 0.7 : 1}
            disabled={!profile.email}
          >
            <Mail color={profile.email ? colors.primary : colors.textMuted} size={18} />
            <Text style={[styles.value, !profile.email && styles.muted]}>{profile.email || 'Email not provided'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactRow, !profile.phone && styles.contactDisabled]}
            onPress={handleCall}
            activeOpacity={profile.phone ? 0.7 : 1}
            disabled={!profile.phone}
          >
            <Phone color={profile.phone ? colors.primary : colors.textMuted} size={18} />
            <Text style={[styles.value, !profile.phone && styles.muted]}>{profile.phone || 'Phone not provided'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactRow, !profile.address && styles.contactDisabled]}
            onPress={handleAddress}
            activeOpacity={profile.address ? 0.7 : 1}
            disabled={!profile.address}
          >
            <MapPin color={profile.address ? colors.primary : colors.textMuted} size={18} />
            <Text style={[styles.value, !profile.address && styles.muted]}>{profile.address || 'Location not provided'}</Text>
          </TouchableOpacity>
        </View>

        {profile.bio ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loading: { color: colors.textMuted },
  container: { paddingHorizontal: 24, paddingBottom: 48, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatarShell: { alignItems: 'center', gap: 8, marginTop: 16 },
  avatarShadow: { borderRadius: 64, padding: 4, backgroundColor: 'rgba(255,255,255,0.75)', shadowColor: '#64748B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#fff', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  name: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center' },
  roleTag: { fontSize: 13, color: colors.textMuted, letterSpacing: 0.4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 12, shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactDisabled: { opacity: 0.6 },
  value: { color: colors.text, fontSize: 16, flex: 1 },
  muted: { color: colors.textMuted },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  bio: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
});


