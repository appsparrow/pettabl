# DingDongDog Native App - Quick Start Guide

## 🚀 Get Started in 30 Minutes

This guide will help you set up a native mobile app using the existing Supabase backend.

---

## Prerequisites

- Node.js 18+ installed
- Xcode (for iOS development on Mac)
- Android Studio (for Android development)
- Supabase account with project created
- Basic knowledge of React Native

---

## Option 1: React Native CLI (Recommended)

### Step 1: Create New Project

```bash
# Create new React Native project
npx react-native@latest init DingDongDogMobile --template react-native-template-typescript

cd DingDongDogMobile
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install zustand
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens

# UI Components
npm install react-native-paper
npm install react-native-vector-icons

# Forms
npm install react-hook-form

# Image handling
npm install react-native-image-picker
npm install react-native-vision-camera
npm install react-native-fast-image

# Notifications
npm install @notifee/react-native

# Other utilities
npm install date-fns
npm install react-native-dotenv
```

### Step 3: Configure Supabase

Create `.env` file:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Step 4: Set Up Navigation

Create `src/navigation/RootNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens (create these)
import AuthScreen from '../screens/AuthScreen';
import BossDashboard from '../screens/BossDashboard';
import AgentDashboard from '../screens/AgentDashboard';
import PetDetailScreen from '../screens/PetDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BossTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={BossDashboard} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AgentTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={AgentDashboard} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="BossHome" component={BossTabNavigator} />
        <Stack.Screen name="AgentHome" component={AgentTabNavigator} />
        <Stack.Screen name="PetDetail" component={PetDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Step 5: Create Auth Screen

Create `src/screens/AuthScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'fur_boss' | 'fur_agent'>('fur_boss');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    // Navigate based on role
    if (profile?.role === 'fur_boss') {
      navigation.replace('BossHome');
    } else {
      navigation.replace('AgentHome');
    }
  };

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Account created! Please sign in.');
    setIsSignUp(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        DingDongDog 🐕
      </Text>

      {isSignUp && (
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {isSignUp && (
        <View style={styles.roleSelector}>
          <Text>I am a:</Text>
          <Button
            mode={role === 'fur_boss' ? 'contained' : 'outlined'}
            onPress={() => setRole('fur_boss')}
          >
            Fur Boss
          </Button>
          <Button
            mode={role === 'fur_agent' ? 'contained' : 'outlined'}
            onPress={() => setRole('fur_agent')}
          >
            Fur Agent
          </Button>
        </View>
      )}

      <Button
        mode="contained"
        onPress={isSignUp ? handleSignUp : handleSignIn}
        style={styles.button}
      >
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </Button>

      <Button onPress={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  roleSelector: {
    marginVertical: 16,
  },
});
```

### Step 6: Create Boss Dashboard

Create `src/screens/BossDashboard.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';
import { supabase } from '../lib/supabase';

interface Pet {
  id: string;
  name: string;
  pet_type: string;
  photo_url: string | null;
}

export default function BossDashboard({ navigation }) {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('fur_boss_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setPets(data);
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <Card
      style={styles.petCard}
      onPress={() => navigation.navigate('PetDetail', { petId: item.id })}
    >
      <Card.Title
        title={item.name}
        subtitle={item.pet_type}
        left={(props) => <Avatar.Icon {...props} icon="dog" />}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        My Pets
      </Text>

      <FlatList
        data={pets}
        renderItem={renderPet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPet')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
  },
  list: {
    padding: 16,
  },
  petCard: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
```

### Step 7: Run the App

```bash
# iOS
npm run ios
# or
npx react-native run-ios

# Android
npm run android
# or
npx react-native run-android
```

---

## Option 2: Expo (Faster Setup)

### Step 1: Create Expo Project

```bash
npx create-expo-app DingDongDogMobile --template tabs
cd DingDongDogMobile
```

### Step 2: Install Dependencies

```bash
npx expo install @supabase/supabase-js
npx expo install @tanstack/react-query
npx expo install expo-camera expo-image-picker
npx expo install expo-notifications
npx expo install expo-secure-store
```

### Step 3: Configure Supabase

Same as React Native CLI (Step 3 above)

### Step 4: Run

```bash
npx expo start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

---

## Testing the API

### Test Authentication

```typescript
// In any component
import { supabase } from './lib/supabase';

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123',
  });
  
  console.log('User:', data.user);
}
```

### Test Data Fetching

```typescript
async function testPets() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('fur_boss_id', user?.id);
  
  console.log('Pets:', data);
}
```

---

## Project Structure

```
DingDongDogMobile/
├── src/
│   ├── components/
│   │   ├── PetCard.tsx
│   │   ├── ActivityItem.tsx
│   │   └── RoleSwitcher.tsx
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── BossDashboard.tsx
│   │   ├── AgentDashboard.tsx
│   │   ├── PetDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── hooks/
│   │   ├── usePets.ts
│   │   ├── useSessions.ts
│   │   └── useActivities.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── .env
├── App.tsx
└── package.json
```

---

## Next Steps

1. **Complete All Screens**: Implement remaining screens from PRD
2. **Add Camera**: Integrate photo capture for activities
3. **Add Notifications**: Set up push notifications
4. **Add Offline Support**: Implement React Query persistence
5. **Polish UI**: Add animations and transitions
6. **Test on Devices**: Test on real iOS and Android devices
7. **Submit to Stores**: Follow app store guidelines

---

## Common Issues & Solutions

### Issue: Supabase not connecting
**Solution**: Check `.env` file has correct URL and key

### Issue: Navigation not working
**Solution**: Ensure all navigation dependencies are installed and linked

### Issue: Images not loading
**Solution**: Use `react-native-fast-image` for better performance

### Issue: Android build fails
**Solution**: Update `android/build.gradle` with correct SDK versions

### Issue: iOS build fails
**Solution**: Run `cd ios && pod install` and rebuild

---

## Resources

- **API Docs**: See `API-DOCUMENTATION.md`
- **PRD**: See `NATIVE-APP-PRD.md`
- **Supabase Docs**: https://supabase.com/docs
- **React Native Docs**: https://reactnative.dev
- **React Navigation**: https://reactnavigation.org

---

## Support

For questions or issues:
1. Check API documentation
2. Review PRD for feature specs
3. Check Supabase dashboard for data
4. Use React Native debugger
5. Check console logs

---

## Summary

You now have:
✅ Complete API documentation  
✅ Comprehensive PRD for native app  
✅ Quick start guide  
✅ Example code for auth and data fetching  
✅ Project structure  
✅ Next steps

**Start building your native mobile app today!** 🚀

