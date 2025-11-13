import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, UserRound, PawPrint, Calendar } from 'lucide-react-native';
import { supabase } from './src/lib/supabase';
import BossDashboard from './src/screens/BossDashboard';
import AgentDashboard from './src/screens/AgentDashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import PetDetailScreen from './src/screens/PetDetailScreen';
import AgentPetDetailScreen from './src/screens/AgentPetDetailScreen';
import ScheduleEditorScreen from './src/screens/ScheduleEditorScreen';
import AgentProfileScreen from './src/screens/AgentProfileScreen';
import { colors } from './src/theme/colors';
import { RoleProvider, useRole } from './src/context/RoleContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const logo = require('./assets/logo-pettabl.png');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthScreen({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'fur_boss' | 'fur_agent'>('fur_boss');
  const passwordRef = useRef<TextInput>(null);
  const isWeb = Platform.OS === 'web';

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    else onSignIn();
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { role, name: name || email.split('@')[0] } }
    });
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success! 🎉', 'Account created! You can now sign in.');
      setIsSignUp(false);
    }
  };

  const formContent = (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <View style={[styles.formLimiter, isWeb && styles.formLimiterWeb]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary, colors.accent]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.authContainer}>
            <View style={styles.brandRow}>
              <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
            </View>
            <Text style={styles.subtitle}>Modern pet care, anywhere</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back!'}</Text>

              {isSignUp && (
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType={isSignUp ? 'next' : 'go'}
                onSubmitEditing={() => {
                  if (isSignUp) {
                    Keyboard.dismiss();
                  } else {
                    signIn();
                  }
                }}
              />

              {isSignUp && (
                <View style={styles.roleSelector}>
                  <Text style={styles.roleLabel}>I am a:</Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'fur_boss' && styles.roleButtonActive]}
                      onPress={() => setRole('fur_boss')}
                    >
                      <Text style={[styles.roleButtonText, role === 'fur_boss' && styles.roleButtonTextActive]}>
                        🐶 Pet Owner
                      </Text>
                      <Text style={[styles.roleSubtext, role === 'fur_boss' && styles.roleSubtextActive]}>
                        (Fur Boss)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'fur_agent' && styles.roleButtonActive]}
                      onPress={() => setRole('fur_agent')}
                    >
                      <Text style={[styles.roleButtonText, role === 'fur_agent' && styles.roleButtonTextActive]}>
                        ❤️ Caretaker
                      </Text>
                      <Text style={[styles.roleSubtext, role === 'fur_agent' && styles.roleSubtextActive]}>
                        (Fur Agent)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.primaryButton} onPress={isSignUp ? signUp : signIn}>
                <Text style={styles.primaryButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchButton}>
                <Text style={styles.switchButtonText}>
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      {isWeb ? (
        formContent
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {formContent}
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
}

function BossTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={BossDashboard}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

function AgentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tab.Screen 
        name="Assignments" 
        component={AgentDashboard}
        options={{
          tabBarLabel: 'Assignments',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { activeRole, loading } = useRole();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const HomeTabs = activeRole === 'fur_agent' ? AgentTabs : BossTabs;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeTabs} />
      <Stack.Screen name="PetDetail" component={PetDetailScreen} />
      <Stack.Screen name="AgentPetDetail" component={AgentPetDetailScreen} />
      <Stack.Screen name="ScheduleEditor" component={ScheduleEditorScreen} />
      <Stack.Screen name="AgentProfile" component={AgentProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthScreen onSignIn={() => setSession(true)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <RoleProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.appRoot, Platform.OS === 'web' && styles.webAppRoot]}>
          <View style={[styles.appContainer, Platform.OS === 'web' && styles.webAppContainer]}>
            <NavigationContainer>
              <MainStack />
            </NavigationContainer>
          </View>
        </View>
      </GestureHandlerRootView>
    </RoleProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  formLimiter: { flexGrow: 1, width: '100%', alignSelf: 'center' },
  formLimiterWeb: { maxWidth: 460 },
  gradient: { flex: 1, minHeight: '100%', borderRadius: 32, overflow: 'hidden' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 20, paddingTop: 60, width: '100%', maxWidth: 420, alignSelf: 'center' },
  brandRow: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brandLogo: { width: 260, height: 80 },
  subtitle: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 36, opacity: 0.9 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20, textAlign: 'center' },
  input: { height: 56, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 20, marginBottom: 16, fontSize: 16, backgroundColor: colors.background, color: colors.text },
  roleSelector: { marginBottom: 20 },
  roleLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  roleButtons: { flexDirection: 'row', gap: 12 },
  roleButton: { flex: 1, paddingVertical: 16, borderWidth: 2, borderColor: colors.border, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  roleButtonActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
  roleButtonText: { fontSize: 16, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
  roleButtonTextActive: { color: colors.primary },
  roleSubtext: { fontSize: 12, color: colors.textMuted },
  roleSubtextActive: { color: colors.primary },
  primaryButton: { height: 56, backgroundColor: colors.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  switchButton: { paddingVertical: 12 },
  switchButtonText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: colors.textMuted },
  tabBar: {
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: Platform.select({ web: 88, default: 78 }),
    paddingBottom: Platform.select({ ios: 20, default: 12 }),
    paddingTop: Platform.select({ web: 16, default: 8 }),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Platform.OS === 'web' ? 24 : 20,
    borderTopRightRadius: Platform.OS === 'web' ? 24 : 20,
    marginHorizontal: Platform.OS === 'web' ? 16 : 0,
  },
  tabBarItem: {
    paddingVertical: 6,
  },
  tabBarIcon: {
    marginBottom: 2,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  appRoot: { flex: 1, backgroundColor: colors.background },
  webAppRoot: { alignItems: 'center', paddingHorizontal: 16, width: '100%' },
  appContainer: { flex: 1, alignSelf: 'stretch' },
  webAppContainer: { width: '100%', maxWidth: 480, flex: 1, alignSelf: 'center' },
});
