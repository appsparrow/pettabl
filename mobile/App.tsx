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
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './src/lib/supabase';
import LandingScreen from './src/screens/LandingScreen';
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
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
const logo = require('./assets/logo-pettabl.png');

WebBrowser.maybeCompleteAuthSession();

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
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { role, name: name || email.split('@')[0] } }
    });
    if (error) Alert.alert('Error', error.message);
    else if (data?.user && !data.session) {
      // Email confirmation required
      Alert.alert(
        '📧 Confirm your email',
        'Please check your email and click the confirmation link to continue.',
        [{ text: 'OK', onPress: () => setIsSignUp(false) }]
      );
    } else {
      Alert.alert('Success! 🎉', 'Account created! You can now sign in.');
      setIsSignUp(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use Supabase's callback URL - it will redirect back to the app
      const supabaseUrl = 'https://cxnvsqkeifgbjzrelytl.supabase.co';
      const redirectTo = `${supabaseUrl}/auth/v1/callback`;
      
      console.log('OAuth Redirect:', redirectTo);
      
      // For mobile, we need to handle the OAuth differently
      if (Platform.OS !== 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            skipBrowserRedirect: true, // We'll handle it manually
          },
        });
        
        if (error) {
          Alert.alert('OAuth Error', error.message);
          console.error('OAuth error:', error);
          return;
        }
        
        // Open the OAuth URL in browser
        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo
          );
          
          console.log('Auth result:', result);
          
          if (result.type === 'success' && result.url) {
            // Extract the tokens from the callback URL
            const url = new URL(result.url);
            const access_token = url.searchParams.get('access_token');
            const refresh_token = url.searchParams.get('refresh_token');
            
            if (access_token && refresh_token) {
              // Set the session with the tokens
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              
              if (sessionError) {
                Alert.alert('Session Error', sessionError.message);
              } else if (sessionData.session) {
                onSignIn();
              }
            } else {
              // Fallback: try to get session
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                onSignIn();
              } else {
                Alert.alert('Error', 'Authentication succeeded but no session found');
              }
            }
          } else if (result.type === 'cancel') {
            console.log('User cancelled OAuth');
          }
        }
      } else {
        // Web OAuth flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            skipBrowserRedirect: false,
          },
        });
        
        if (error) {
          Alert.alert('OAuth Error', error.message);
          console.error('OAuth error:', error);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Sign in error:', error);
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
            <Text style={styles.subtitle}>Home pet sitting, simplified</Text>

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
                        🐶 Pet Boss
                      </Text>
                      <Text style={[styles.roleSubtext, role === 'fur_boss' && styles.roleSubtextActive]}>
                        (Leads care)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'fur_agent' && styles.roleButtonActive]}
                      onPress={() => setRole('fur_agent')}
                    >
                      <Text style={[styles.roleButtonText, role === 'fur_agent' && styles.roleButtonTextActive]}>
                        ❤️ Pet Agent
                      </Text>
                      <Text style={[styles.roleSubtext, role === 'fur_agent' && styles.roleSubtextActive]}>
                        (Provides care)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.primaryButton} onPress={isSignUp ? signUp : signIn}>
                <Text style={styles.primaryButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
              </TouchableOpacity>

              {/* Google OAuth - Temporarily disabled
              {!isSignUp && (
                <>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
                    <Text style={styles.googleButtonText}>🔐 Sign in with Google</Text>
                  </TouchableOpacity>
                </>
              )}
              */}

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
        name="PetWatch" 
        component={AgentDashboard}
        options={{
          tabBarLabel: 'Pet Watch',
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
  const [initialRoute, setInitialRoute] = useState<string | undefined>(undefined);

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

  // Determine initial route based on URL path (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/auth' || path.startsWith('/auth/')) {
        setInitialRoute('Auth');
      } else {
        setInitialRoute('Landing');
      }
    }
  }, []);

  // Redirect authenticated users from / to /auth (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && session) {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        window.history.replaceState({}, '', '/auth');
      }
    }
  }, [session]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Web linking configuration
  const linking = Platform.OS === 'web' ? {
    prefixes: ['/'],
    config: {
      screens: {
        Landing: '/',
        Auth: '/auth',
      },
    },
  } : undefined;

  const AppContent = () => {
    // If on web and at /auth, show auth/app regardless of session
    // If on web and at /, show landing page if no session
    const isWeb = Platform.OS === 'web';
    const isAuthRoute = isWeb && typeof window !== 'undefined' && 
                        (window.location.pathname === '/auth' || window.location.pathname.startsWith('/auth/'));

    if (!session) {
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer linking={linking}>
            <Stack.Navigator 
              screenOptions={{ headerShown: false }}
              initialRouteName={initialRoute}
            >
              {isWeb ? (
                <>
                  <Stack.Screen name="Landing" component={LandingScreen} />
                  <Stack.Screen name="Auth">
                    {(props) => <AuthScreen {...props} onSignIn={() => setSession(true)} />}
                  </Stack.Screen>
                </>
              ) : (
                <Stack.Screen name="Auth">
                  {(props) => <AuthScreen {...props} onSignIn={() => setSession(true)} />}
                </Stack.Screen>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      );
    }


    return (
      <RoleProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={[styles.appRoot, Platform.OS === 'web' && styles.webAppRoot]}>
            <View style={[styles.appContainer, Platform.OS === 'web' && styles.webAppContainer]}>
              <NavigationContainer linking={linking}>
                <MainStack />
              </NavigationContainer>
            </View>
          </View>
        </GestureHandlerRootView>
      </RoleProvider>
    );
  };

  // Wrap with HelmetProvider for web SEO support
  if (Platform.OS === 'web') {
    return (
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    );
  }

  return <AppContent />;
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
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, color: colors.textMuted, fontSize: 12, textTransform: 'uppercase' },
  googleButton: { height: 56, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.border, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  googleButtonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
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
    height: Platform.select({ web: 80, default: 78 }),
    paddingBottom: Platform.select({ 
      ios: 20, 
      web:8,
      default: 12 
    }),
    paddingTop: Platform.select({ web: 12, default: 8 }),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Platform.OS === 'web' ? 24 : 20,
    borderTopRightRadius: Platform.OS === 'web' ? 24 : 20,
    marginHorizontal: Platform.OS === 'web' ? 16 : 0,
    marginBottom: Platform.OS === 'web' ? 0 : 0,
  },
  tabBarItem: {
    paddingVertical: Platform.select({ web: 4, default: 6 }),
  },
  tabBarIcon: {
    marginBottom: Platform.select({ web: 0, default: 2 }),
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Platform.select({ web: 0, default: 4 }),
    marginTop: Platform.select({ web: 2, default: 0 }),
  },
  appRoot: { flex: 1, backgroundColor: colors.background },
  webAppRoot: { alignItems: 'center', paddingHorizontal: 0, width: '100%', backgroundColor: '#FFFFFF' },
  appContainer: { flex: 1, alignSelf: 'stretch' },
  webAppContainer: { width: '100%', maxWidth: 480, flex: 1, alignSelf: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: Platform.OS === 'web' ? 16 : 0 },
});
