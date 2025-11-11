# DingDongDog Native Mobile App - Product Requirements Document

## Executive Summary

**Product**: DingDongDog Native Mobile App (iOS & Android)  
**Version**: 1.0  
**Platform**: React Native (iOS 14+, Android 8+)  
**Backend**: Supabase (PostgreSQL + REST API + Real-time)  
**Design System**: Same as web app - playful, gamified, mobile-first

---

## 1. Product Overview

### Vision
A native mobile app for pet care coordination that allows pet owners (Fur Bosses) to schedule care sessions and caretakers (Fur Agents) to manage daily pet care tasks with photo updates and real-time check-ins.

### Goals
1. **Parity with Web App**: All features from web version
2. **Native Feel**: Platform-specific UI patterns and gestures
3. **Offline-First**: Core features work without internet
4. **Push Notifications**: Real-time updates for agents and bosses
5. **Camera Integration**: Quick photo capture for activity logs
6. **Performance**: Fast, smooth, 60fps animations

---

## 2. Technical Architecture

### Tech Stack

#### Frontend
- **Framework**: React Native 0.72+
- **Language**: TypeScript
- **UI Library**: React Native Paper + Custom Components
- **Navigation**: React Navigation v6
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form
- **Icons**: react-native-vector-icons (Lucide alternative)
- **Camera**: react-native-vision-camera
- **Image Picker**: react-native-image-picker
- **Notifications**: @notifee/react-native
- **Offline**: @tanstack/react-query with persistence

#### Backend (Existing)
- **Database**: Supabase (PostgreSQL)
- **API**: Auto-generated REST API
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (WebSockets)

#### DevOps
- **Build**: Expo Application Services (EAS) or native builds
- **CI/CD**: GitHub Actions
- **App Distribution**: TestFlight (iOS), Firebase App Distribution (Android)
- **Analytics**: PostHog or Mixpanel
- **Crash Reporting**: Sentry

### Architecture Diagram

```
┌─────────────────────────────────────────┐
│          Mobile App (React Native)       │
│  ┌─────────────────────────────────┐   │
│  │   UI Layer (React Components)   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  State Management (React Query)  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   API Client (Supabase SDK)     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓ HTTPS/WSS
┌─────────────────────────────────────────┐
│         Supabase Backend                 │
│  ┌─────────────────────────────────┐   │
│  │   PostgreSQL Database + RLS     │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   REST API (PostgREST)          │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Real-time (WebSockets)        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Storage (S3-compatible)       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 3. User Roles & Permissions

### Fur Boss (Pet Owner)
**Primary Goal**: Manage pets and coordinate care

**Capabilities**:
- ✅ Register as Fur Boss
- ✅ Add/edit/delete pets with photos
- ✅ Create care sessions with date ranges
- ✅ Set daily schedules (feed, walk, let out)
- ✅ Define pet care plans (meals, habits)
- ✅ Search and assign Fur Agents
- ✅ View activity logs with photos
- ✅ Delete sessions
- ✅ Switch to Agent mode (if owns pets AND is assigned as agent)

### Fur Agent (Caretaker)
**Primary Goal**: Care for assigned pets and log activities

**Capabilities**:
- ✅ Register as Fur Agent
- ✅ View assigned sessions
- ✅ See today's schedule checklist
- ✅ Mark activities complete with photos
- ✅ Undo completed activities
- ✅ View pet care instructions
- ✅ Earn paw points
- ✅ Add own pets (enables Boss mode)
- ✅ Switch to Boss mode (if owns pets)

### Dual-Role Users
**Capability**: Switch between Boss and Agent modes
- View assignments as Agent
- Manage own pets as Boss
- Clear mode indication

---

## 4. Core Features

### 4.1 Authentication & Onboarding

#### Sign Up Flow
1. **Welcome Screen**
   - App logo and tagline
   - "Sign Up" and "Sign In" buttons
   
2. **Role Selection** (Sign Up)
   - Choose role: Fur Boss or Fur Agent
   - Description of each role
   - Visual icons

3. **Account Creation**
   - Name input
   - Email input
   - Password input (with strength indicator)
   - Submit button

4. **Onboarding** (First Launch)
   - **Boss**: "Add Your First Pet"
   - **Agent**: "Explore Pet Care Opportunities"

#### Sign In Flow
1. Email/password input
2. "Forgot Password" link
3. Biometric authentication (Face ID/Touch ID) after first login
4. Remember me option

### 4.2 Boss Dashboard

#### Layout
```
┌─────────────────────────────┐
│  👤 Profile    🔄 Switch  📊 │  ← Header
├─────────────────────────────┤
│  Welcome back, [Name]! 🐕   │
│  Stats: 2 Pets | 3 Sessions │
├─────────────────────────────┤
│  Quick Actions              │
│  ┌──────────┐  ┌──────────┐│
│  │ Add Pet  │  │  New     ││
│  │    🐶     │  │ Session  ││
│  └──────────┘  └──────────┘│
├─────────────────────────────┤
│  My Pets                    │
│  ┌─────────────────────────┐│
│  │ 🐶 Buddy  →             ││  ← Pet Card
│  │ Golden Retriever        ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Care Sessions              │
│  ┌─────────────────────────┐│
│  │ Buddy - Jan 1-7  [●●○]  ││  ← Session Card
│  │ Agent: John             ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

#### Features
- Pull-to-refresh
- Floating action button (FAB) for quick actions
- Session timeline with visual status
- Pet cards with photos

### 4.3 Agent Dashboard

#### Layout
```
┌─────────────────────────────┐
│  👤 Profile    🔄 Switch  ⭐ │  ← Header
├─────────────────────────────┤
│  Hello, [Name]! 🐾          │
│  Paw Points: 150 ⭐          │
├─────────────────────────────┤
│  Tabs: Current | Upcoming   │
├─────────────────────────────┤
│  Pets I'm Caring For        │
│  ┌─────────────────────────┐│
│  │ 🐶 Buddy                ││
│  │ Jan 1-7 [●●●○○○○]       ││  ← Timeline
│  │ Today: ✓ Feed  ○ Walk   ││
│  │         View Details →  ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

#### Features
- Real-time activity updates
- Visual timeline (grey=planned, green=done, orange=missed)
- Quick mark complete
- Push notification on new assignments

### 4.4 Pet Detail (Boss View)

#### Sections
1. **Header**
   - Pet photo (large, circular)
   - Pet name and type icon
   - Edit/Delete buttons

2. **Quick Stats**
   - Breed, Age
   - Active sessions count

3. **Tabs**
   - **Info**: Medical info, vet contact, food preferences
   - **Schedule**: Daily schedule with time periods
   - **Care Plan**: Meal plan, habits
   - **Activity Log**: All completed activities with photos

4. **Actions**
   - Create New Session
   - Edit Pet
   - Delete Pet (with confirmation)

### 4.5 Pet Detail (Agent View)

#### Sections
1. **Header**
   - Pet photo
   - Pet name and session dates
   - Visual timeline

2. **Today's Schedule** (Primary View)
   ```
   ☀️ Morning
   ✓ Feed (Completed by You at 8:30 AM) 📷
   ○ Walk (Mark Complete)
   
   🌤️ Afternoon
   ○ Feed (Mark Complete)
   
   🌙 Evening
   ○ Let Out (Mark Complete)
   ```

3. **Care Instructions**
   - Feeding schedule and amounts
   - Special habits and notes
   - Emergency contact info

4. **Actions**
   - Mark activity complete
   - Undo activity
   - View full activity history

### 4.6 Activity Logging (Agent)

#### Flow
1. **Tap "Mark Complete"** on schedule item
2. **Confirm Dialog**:
   ```
   ┌─────────────────────────────┐
   │ Mark Activity Complete       │
   ├─────────────────────────────┤
   │ 🍽️ Feed - Morning            │
   │                             │
   │ When did you complete this? │
   │ ○ Today                     │
   │ ○ Yesterday                 │
   │                             │
   │ 📷 Add Photo (Optional)      │
   │ [Camera Button] [Gallery]   │
   │                             │
   │ 📝 Notes (Optional)          │
   │ [Text input]                │
   │                             │
   │ [Cancel] [Mark Complete]    │
   └─────────────────────────────┘
   ```

3. **Photo Capture**:
   - In-app camera with preview
   - Auto-compress before upload
   - Low-res for fast upload

4. **Success**:
   - Happy pet animation
   - Paw points earned notification
   - Return to schedule

### 4.7 Create Session (Boss)

#### Flow
1. **Select Pet** (if multiple)
   - Grid of pet cards with photos
   - Visual selection state

2. **Date Selection**
   - From/To date pickers
   - Calendar view
   - Auto-suggest 7-day period

3. **Assign Agents**
   - Search by email
   - Show agent profile
   - Can assign multiple agents
   - Cannot assign self

4. **Notes** (Optional)
   - Special instructions
   - Multi-line text input

5. **Create**
   - Loading indicator
   - Success animation
   - Navigate to session detail

### 4.8 Profile Management

#### Boss Profile
- Profile photo (tap to change)
- Name, email, phone, address
- Bio
- My Pets section (always visible)
- Edit mode

#### Agent Profile
- Profile photo
- Name, email, phone, address
- Bio
- Paw Points badge
- My Pets section (enables Boss mode)
- Edit mode

### 4.9 Schedule Setup (Boss)

#### UI
```
Daily Schedule for Buddy

☀️ Morning
[ ] Feed
[ ] Walk
[ ] Let Out

🌤️ Afternoon
[ ] Feed
[ ] Walk
[ ] Let Out

🌙 Evening
[ ] Feed
[ ] Walk
[ ] Let Out

[Save Schedule]
```

#### Features
- Toggle checkboxes
- Visual time period icons
- Save to pet (applies to all sessions)

### 4.10 Care Plan (Boss)

#### Sections
1. **Meal Plan**
   - Add meals with time, food type, amount
   - Multiple meals per day
   - Notes per meal

2. **Daily Frequency**
   - Number input
   - Default: 2

3. **Feeding Notes**
   - Special instructions
   - Allergies
   - Preferences

4. **Habits**
   - Add habits with descriptions
   - e.g., "Likes belly rubs before bed"

### 4.11 Role Switching

#### Trigger Conditions
- **Agent → Boss**: After adding first pet
- **Boss → Agent**: After being assigned to a session

#### UI
- Button in header (only when available)
- Icon changes based on current mode:
  - Boss mode: ❤️ "Switch to Agent"
  - Agent mode: 🐶 "Switch to Boss"
- Toast notification on switch
- Dashboard changes immediately

---

## 5. Native Features

### 5.1 Camera Integration
- **Library**: react-native-vision-camera
- **Features**:
  - In-app camera for activity photos
  - Photo from gallery
  - Image compression before upload
  - Crop/edit functionality

### 5.2 Push Notifications
- **Library**: @notifee/react-native
- **Triggers**:
  - **Boss**: Agent completes activity (with photo)
  - **Boss**: Session date approaching
  - **Agent**: New session assigned
  - **Agent**: Reminder for incomplete activities (evening)
  - **Dual-role**: Depends on active role

### 5.3 Biometric Authentication
- **Library**: react-native-biometrics
- **Features**:
  - Face ID (iOS)
  - Touch ID (iOS)
  - Fingerprint (Android)
  - Fallback to password

### 5.4 Deep Linking
- **Library**: react-native-deep-linking
- **Routes**:
  - `dingdongdog://session/{session_id}` - Open session detail
  - `dingdongdog://pet/{pet_id}` - Open pet detail
  - `dingdongdog://profile` - Open profile
  - `dingdongdog://switch-role` - Trigger role switch

### 5.5 Offline Support
- **Strategy**: Cache-first with background sync
- **Implementation**:
  - React Query with persistent cache
  - Queue mutations when offline
  - Sync when back online
  - Visual indicator for offline mode

### 5.6 Haptic Feedback
- **Library**: react-native-haptic-feedback
- **Triggers**:
  - Activity marked complete
  - Pet added
  - Error occurred
  - Button press

---

## 6. UI/UX Design

### Design System

#### Colors
```
Primary: #FF6B6B (Coral Red)
Secondary: #FFD93D (Sunny Yellow)
Accent: #4ECDC4 (Teal)
Peach: #FFB4A2
Success: #51CF66
Warning: #FFA94D
Error: #FF6B6B
```

#### Typography
- **Headings**: Poppins Bold
- **Body**: Inter Regular
- **Buttons**: Inter SemiBold

#### Components
- **Buttons**: Rounded (border-radius: 24px)
- **Cards**: Rounded (border-radius: 16px), shadow
- **Inputs**: Rounded (border-radius: 12px), border
- **Avatars**: Circular
- **Icons**: Lucide icons (react-native-vector-icons alternative)

#### Animations
- **Page transitions**: Fade + slide
- **Button press**: Scale down (0.95)
- **Activity complete**: Confetti or checkmark animation
- **Loading**: Skeleton screens
- **Pull-to-refresh**: Custom indicator

### Platform-Specific
- **iOS**: Native navigation bar, swipe gestures
- **Android**: Material Design FAB, bottom sheets

---

## 7. Data Models

See `API-DOCUMENTATION.md` for complete API reference.

### Key Entities
1. **Profile**: User account and preferences
2. **Pet**: Pet information and photos
3. **Session**: Care period with dates
4. **SessionAgent**: Assignment junction table
5. **Schedule**: Daily routine for a pet
6. **ScheduleTime**: Individual schedule items
7. **Activity**: Completed tasks with photos
8. **PetCarePlan**: Feeding and care instructions

### Relationships
```
Profile 1──────* Pet
  │              │
  │              │
  │         1────*──── Session
  │              │         │
  └──────*────────┘         │
   (SessionAgent)           │
                            │
                       1────*──── Activity
```

---

## 8. API Integration

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

### API Patterns

#### Queries (React Query)
```typescript
const { data: pets, isLoading } = useQuery({
  queryKey: ['pets', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('fur_boss_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
})
```

#### Mutations
```typescript
const createPet = useMutation({
  mutationFn: async (pet: NewPet) => {
    const { data, error } = await supabase
      .from('pets')
      .insert(pet)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['pets'])
  }
})
```

#### Real-time
```typescript
useEffect(() => {
  const channel = supabase
    .channel('activities')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'activities',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      // Update UI
      queryClient.invalidateQueries(['activities'])
    })
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}, [sessionId])
```

---

## 9. Security

### Authentication
- JWT tokens from Supabase Auth
- Refresh tokens stored securely (Keychain/Keystore)
- Biometric authentication option
- Auto-logout after inactivity

### Authorization
- Row Level Security (RLS) on all tables
- User can only access their own data
- Agents can only view assigned sessions
- Bosses can only manage their own pets

### Data Protection
- HTTPS only
- Encrypted storage for sensitive data
- No sensitive data in logs
- Secure image upload

---

## 10. Performance

### Targets
- **App Launch**: < 2s
- **Screen Transitions**: < 300ms
- **API Calls**: < 1s
- **Image Loading**: < 2s (with skeleton)
- **Smooth Animations**: 60fps

### Optimization
- Image optimization and caching
- Lazy loading for lists
- Virtual lists for long scrolls
- Code splitting
- Bundle size optimization

---

## 11. Testing

### Unit Tests
- Business logic
- Utilities
- Hooks
- 80% coverage target

### Integration Tests
- API calls
- Navigation flows
- State management

### E2E Tests (Detox)
- Critical user flows
- Sign up/sign in
- Create pet
- Log activity
- Switch roles

### Manual Testing
- iOS devices (iPhone 12+)
- Android devices (Pixel 4+)
- Different screen sizes
- Light/dark mode
- Offline scenarios

---

## 12. Deployment

### Build Process
1. **Development**: Local builds
2. **Staging**: EAS builds to TestFlight/Firebase
3. **Production**: App Store + Google Play

### CI/CD Pipeline
```
Push to main
  ↓
GitHub Actions
  ↓
Run tests
  ↓
Build app
  ↓
Deploy to TestFlight/Firebase
  ↓
(Manual approval)
  ↓
Deploy to production
```

### App Store Requirements
- **iOS**: App Store guidelines compliance
- **Android**: Google Play policies compliance
- Privacy policy
- Terms of service
- App screenshots and description

---

## 13. Analytics & Monitoring

### Metrics
- Daily active users (DAU)
- Session duration
- Feature usage
- Crash rate
- API response times

### Events to Track
- User sign up (role)
- Pet added
- Session created
- Activity logged
- Role switched
- Photo uploaded
- Push notification opened

---

## 14. Roadmap

### Phase 1: MVP (Weeks 1-6)
- [ ] Project setup and architecture
- [ ] Authentication flows
- [ ] Boss dashboard
- [ ] Agent dashboard
- [ ] Pet CRUD
- [ ] Session CRUD
- [ ] Activity logging
- [ ] Basic notifications

### Phase 2: Enhanced Features (Weeks 7-10)
- [ ] Camera integration
- [ ] Image optimization
- [ ] Role switching
- [ ] Schedule setup
- [ ] Care plans
- [ ] Profile management
- [ ] Offline support

### Phase 3: Polish (Weeks 11-12)
- [ ] Animations and transitions
- [ ] Push notifications (rich)
- [ ] Biometric auth
- [ ] Deep linking
- [ ] Analytics integration
- [ ] Performance optimization

### Phase 4: Launch (Week 13+)
- [ ] Beta testing
- [ ] Bug fixes
- [ ] App Store submission
- [ ] Marketing materials
- [ ] Public launch

---

## 15. Success Metrics

### Primary KPIs
1. **User Adoption**: 1000+ downloads in first month
2. **Engagement**: 70% weekly active users
3. **Retention**: 60% 30-day retention
4. **Activity Logging**: 5+ activities per session average
5. **Session Completion**: 90% of sessions completed

### Secondary KPIs
1. Photo upload rate: 70%+ of activities
2. Push notification engagement: 50%+ open rate
3. Role switching usage: 30% of eligible users
4. Crash-free rate: 99.5%+
5. App Store rating: 4.5+ stars

---

## 16. Support & Maintenance

### Support Channels
- In-app feedback
- Email support
- FAQ section
- Video tutorials

### Maintenance
- Weekly bug fixes
- Monthly feature updates
- Quarterly major releases
- Continuous performance monitoring

---

## 17. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limiting | High | Implement caching, offline queue |
| Large photo uploads | Medium | Image compression, size limits |
| Push notification failures | High | Fallback to email, in-app alerts |
| Offline data conflicts | Medium | Conflict resolution strategy |
| App Store rejection | High | Follow guidelines, thorough testing |

---

## Appendix

### Resources
- [API Documentation](./API-DOCUMENTATION.md)
- [Database Schema](./supabase/migrations/)
- [Role Switching Guide](./ROLE-SWITCHING-IMPLEMENTATION.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)

### Contact
- Product Manager: [Name]
- Tech Lead: [Name]
- Design Lead: [Name]

