# Database Backups

## Backup Created: November 11, 2025

This backup was created before implementing the Role-Switching System with Agent Pet Ownership feature.

### Backup Files

1. **`backup_20251111_000548.sql`** - Full schema backup
   - All tables, functions, triggers, RLS policies
   - Complete database structure
   
2. **`backup_data_20251111_000609.sql`** - Data-only backup
   - All data from all tables
   - User profiles, pets, sessions, activities, etc.

### How to Restore

#### Full Restore (Schema + Data)
```bash
# Stop current database
npx supabase stop

# Start fresh
npx supabase start

# Restore schema
npx supabase db reset

# Apply backup
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_20251111_000548.sql

# Restore data
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_data_20251111_000609.sql
```

#### Schema Only Restore
```bash
npx supabase db reset
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_20251111_000548.sql
```

#### Data Only Restore
```bash
# After schema is set up
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_data_20251111_000609.sql
```

### What Changed After This Backup

The Role-Switching System implementation includes:
- RoleContext provider for managing active role
- RoleSwitcher component in dashboards
- Updated RLS policies to allow agents to own pets
- Self-assignment prevention trigger
- Profile page pets section for Boss mode
- Role guards on dashboards

### Database Changes
- Modified RLS policies on: pets, sessions, schedules, schedule_times, activities, pet_care_plans
- Added trigger: `prevent_self_assignment` on `session_agents`
- No schema changes (tables remain the same)

### Rollback Instructions

If you need to revert to the pre-role-switching state:

1. **Stop Supabase**:
   ```bash
   npx supabase stop
   ```

2. **Start fresh**:
   ```bash
   npx supabase start
   ```

3. **Restore from backup**:
   ```bash
   psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_20251111_000548.sql
   psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/backups/backup_data_20251111_000609.sql
   ```

4. **Revert code changes**:
   ```bash
   git checkout HEAD~1  # or specific commit before role-switching
   ```

### Notes

- These backups are for LOCAL development only
- Production backups should be managed through Supabase dashboard
- Keep these files safe - they contain your complete database state
- The backup includes all RLS policies, functions, and triggers as they were before the role-switching feature

### Version Info

- **App Version**: Pre-role-switching
- **Supabase CLI**: Latest
- **PostgreSQL**: 15.8.1.085
- **Migration State**: Up to `20251111140000_add_profile_fields.sql`

