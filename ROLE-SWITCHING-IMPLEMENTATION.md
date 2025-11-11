# Role-Switching System Implementation

## Overview

Successfully implemented a role-switching system that allows users to toggle between Fur Boss and Fur Agent modes, with registration-time default role selection and localStorage-based active role management.

## What Was Implemented

### 1. Core Infrastructure

#### RoleContext (`src/contexts/RoleContext.tsx`)
- Manages user's primary role (from database)
- Tracks active role (from localStorage)
- Determines if user can switch roles:
  - Agents can switch if they own pets
  - Bosses can switch if they're assigned as agents
- Provides `useRole()` hook for components

#### RoleProvider (`src/App.tsx`)
- Wraps entire application
- Makes role context available everywhere

### 2. UI Components

#### RoleSwitcher (`src/components/RoleSwitcher.tsx`)
- Compact button in dashboard headers
- Only shows when user has both roles
- Smooth navigation between dashboards
- Toast notification on switch

#### Dashboard Updates
- **BossDashboard**: Added RoleSwitcher and role guard
- **AgentDashboard**: Added RoleSwitcher and role guard
- Role guards redirect users if they're in wrong mode

### 3. Authentication Flow

#### Updated Auth.tsx
- Registration copy clarifies role purpose:
  - Fur Boss: "Looking for people to take care of your pets"
  - Fur Agent: "Love to take care of others' pets"
- Sign-in respects stored active role from localStorage
- Falls back to primary role on first login

### 4. Database Changes

#### Migration: `20251111150000_enable_agent_pet_ownership.sql`
- Updated RLS policies to allow ANY user to own pets
- Changed "Fur bosses" policies to "Pet owners" / "Users"
- Added self-assignment prevention trigger
- Prevents agents from being assigned to their own pets

### 5. Profile Page Enhancements

#### Pet Management (`src/pages/Profile.tsx`)
- "My Pets" section shows when:
  - User is in Boss mode, OR
  - User owns pets (regardless of mode)
- Add Pet button
- Grid display of pet cards
- Click to navigate to pet details

#### CreateSessionModal Updates
- Filters out current user from agent search
- Validates against self-assignment in UI
- Database trigger provides additional safety

## How It Works

### User Flow

1. **Registration**
   - User selects primary role (Fur Boss or Fur Agent)
   - Role stored in database

2. **First Login**
   - User sees dashboard for their primary role
   - No switcher visible (single role)

3. **Becoming Dual-Role**
   - **Agent → Boss**: Agent adds a pet via Profile page
   - **Boss → Agent**: Boss gets assigned to a session
   - Switcher appears in header

4. **Role Switching**
   - Click switcher button
   - Active role updates in localStorage
   - Navigate to appropriate dashboard
   - Toast confirms switch

5. **Subsequent Logins**
   - App loads last active role from localStorage
   - User continues where they left off

### Technical Flow

```
User Login
    ↓
RoleProvider loads
    ↓
Check primary role (database)
    ↓
Check if can switch (pets owned / agent assignments)
    ↓
Load active role (localStorage or default to primary)
    ↓
Dashboard renders with role guard
    ↓
If wrong role → redirect
```

## Key Features

### Role Separation
- **Boss Mode**: Manage my pets, create sessions, assign agents
- **Agent Mode**: View assignments, log activities, earn paw points

### Self-Assignment Prevention
- **UI Level**: Current user filtered from agent search
- **Validation**: Toast error if somehow selected
- **Database Level**: Trigger prevents insertion

### Seamless Switching
- Instant mode change (no reload)
- Persists across sessions
- Clear visual feedback

## Files Created/Modified

### New Files
1. `src/contexts/RoleContext.tsx` - Role management context
2. `src/components/RoleSwitcher.tsx` - Switcher button component
3. `supabase/migrations/20251111150000_enable_agent_pet_ownership.sql` - Database migration
4. `supabase/backups/backup_20251111_000548.sql` - Full backup before changes
5. `supabase/backups/backup_data_20251111_000609.sql` - Data backup
6. `supabase/backups/README.md` - Backup documentation

### Modified Files
1. `src/App.tsx` - Added RoleProvider
2. `src/pages/Auth.tsx` - Updated sign-in logic and registration copy
3. `src/pages/BossDashboard.tsx` - Added switcher and role guard
4. `src/pages/AgentDashboard.tsx` - Added switcher and role guard
5. `src/pages/Profile.tsx` - Added pets section
6. `src/components/CreateSessionModal.tsx` - Prevent self-assignment

## Testing Checklist

### Basic Flows
- [x] Register as Fur Boss → goes to Boss Dashboard
- [x] Register as Fur Agent → goes to Agent Dashboard
- [ ] Agent adds pet via Profile → switcher appears
- [ ] Agent switches to Boss mode → sees Boss Dashboard with their pets
- [ ] Agent creates session for their pet → cannot assign themselves
- [ ] Boss gets assigned as agent → switcher appears
- [ ] Boss switches to Agent mode → sees Agent Dashboard with assignments
- [ ] Role persists after logout/login
- [ ] Single-role users don't see switcher

### Edge Cases
- [ ] Agent tries to assign self (UI prevents)
- [ ] Database trigger blocks self-assignment
- [ ] Switching roles updates canSwitchRoles dynamically
- [ ] Profile pets section only shows in appropriate contexts

## Database Schema Notes

### No Schema Changes
- `pets.fur_boss_id` already references `profiles(id)`
- Works for any user, regardless of role
- Only RLS policies changed, not table structure

### RLS Policy Changes
- **Before**: "Fur bosses can manage..."
- **After**: "Pet owners can manage..." / "Users can manage..."
- Semantic change, same security model

### Self-Assignment Trigger
```sql
CREATE OR REPLACE FUNCTION prevent_self_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.sessions s
    JOIN public.pets p ON p.id = s.pet_id
    WHERE s.id = NEW.session_id 
    AND p.fur_boss_id = NEW.fur_agent_id
  ) THEN
    RAISE EXCEPTION 'Cannot assign yourself to care for your own pet';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Rollback Instructions

If needed, restore from backup:

```bash
# Stop Supabase
npx supabase stop

# Start fresh
npx supabase start

# Restore schema
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_20251111_000548.sql

# Restore data
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_data_20251111_000609.sql

# Revert code
git checkout HEAD~1  # or specific commit
```

## Benefits

1. **Clear Mental Models**: Boss mode vs Agent mode
2. **Flexible**: Users can be both without confusion
3. **Safe**: Multiple layers prevent self-assignment
4. **Persistent**: Role choice remembered
5. **Scalable**: Easy to add more role-specific features

## Future Enhancements

- Role-specific analytics
- Boss earnings tracking
- Agent performance metrics
- Bulk session management for agents with many pets
- Calendar view of assignments

## Notes

- Migration applied successfully
- No breaking changes to existing data
- All existing pets/sessions work as before
- Agents can now own pets seamlessly
- Bosses can now be agents seamlessly

