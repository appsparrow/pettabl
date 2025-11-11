# DingDongDog API Documentation

## Overview

DingDongDog uses **Supabase** as its backend, which provides:
- PostgreSQL database with Row Level Security (RLS)
- RESTful API (auto-generated from database schema)
- Real-time subscriptions via WebSockets
- Authentication & Authorization
- File storage for photos
- Server-side functions (PostgreSQL functions)

## Base URL

```
Production: https://[your-project].supabase.co
Local Dev:  http://localhost:54321
```

## Authentication

All API requests require authentication via Supabase Auth.

### Headers
```
Authorization: Bearer <access_token>
apikey: <your-supabase-anon-key>
Content-Type: application/json
```

### Authentication Endpoints

#### Sign Up
```
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "name": "User Name",
    "role": "fur_boss" | "fur_agent"
  }
}

Response: {
  "user": { ... },
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

#### Sign In
```
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: {
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": { ... }
}
```

#### Sign Out
```
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

#### Refresh Token
```
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "..."
}
```

---

## Core API Endpoints

All endpoints follow Supabase PostgREST conventions:
- Base: `/rest/v1/`
- Auto-generated from database tables
- RLS policies enforce permissions

### Common Query Parameters

- `select` - Specify columns: `?select=id,name,email`
- `eq` - Equality: `?id=eq.123`
- `neq` - Not equal: `?status=neq.completed`
- `gt`/`gte` - Greater than: `?created_at=gte.2024-01-01`
- `lt`/`lte` - Less than: `?created_at=lt.2024-12-31`
- `like`/`ilike` - Pattern match: `?name=ilike.*dog*`
- `order` - Sort: `?order=created_at.desc`
- `limit` - Limit results: `?limit=10`
- `offset` - Pagination: `?offset=20`

---

## 1. Profiles

### Get Current User Profile
```http
GET /rest/v1/profiles?id=eq.<user_id>&select=*
Authorization: Bearer <token>

Response: {
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "fur_boss",
  "avatar_url": "https://...",
  "paw_points": 100,
  "photo_url": "https://...",
  "phone": "+1234567890",
  "address": "123 Main St",
  "bio": "Love pets!",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Update Profile
```http
PATCH /rest/v1/profiles?id=eq.<user_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890",
  "address": "New Address",
  "bio": "Updated bio"
}

Response: Profile object
```

---

## 2. Pets

### Get All Pets (Owner)
```http
GET /rest/v1/pets?fur_boss_id=eq.<user_id>&select=*&order=created_at.desc
Authorization: Bearer <token>

Response: [
  {
    "id": "uuid",
    "fur_boss_id": "uuid",
    "name": "Buddy",
    "breed": "Golden Retriever",
    "age": 3,
    "photo_url": "https://...",
    "pet_type": "dog",
    "medical_info": "Vaccinated",
    "vet_contact": "Dr. Smith: +1234567890",
    "food_preferences": "Dry food, no chicken",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Single Pet
```http
GET /rest/v1/pets?id=eq.<pet_id>&select=*
Authorization: Bearer <token>

Response: Pet object
```

### Create Pet
```http
POST /rest/v1/pets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "pet_type": "dog",
  "medical_info": "Vaccinated",
  "vet_contact": "Dr. Smith",
  "food_preferences": "Dry food"
}

Response: Created pet object
```

### Update Pet
```http
PATCH /rest/v1/pets?id=eq.<pet_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "age": 4
}

Response: Updated pet object
```

### Delete Pet
```http
DELETE /rest/v1/pets?id=eq.<pet_id>
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 3. Care Sessions

### Get Sessions (Owner)
```http
GET /rest/v1/sessions?select=*,pets(name,photo_url,pet_type),session_agents(fur_agent_id,profiles(name))&order=created_at.desc
Authorization: Bearer <token>

Response: [
  {
    "id": "uuid",
    "fur_boss_id": "uuid",
    "pet_id": "uuid",
    "start_date": "2024-01-01",
    "end_date": "2024-01-07",
    "status": "active",
    "notes": "Feed twice daily",
    "pets": {
      "name": "Buddy",
      "photo_url": "https://...",
      "pet_type": "dog"
    },
    "session_agents": [
      {
        "fur_agent_id": "uuid",
        "profiles": {
          "name": "Agent Name"
        }
      }
    ],
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Sessions (Agent - Assigned to me)
```http
GET /rest/v1/session_agents?fur_agent_id=eq.<user_id>&select=session_id,sessions(id,start_date,end_date,status,pet_id,pets(name,photo_url,pet_type))
Authorization: Bearer <token>

Response: Assigned sessions
```

### Create Session
```http
POST /rest/v1/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "pet_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "status": "planned",
  "notes": "Special instructions"
}

Response: Created session object
```

### Update Session
```http
PATCH /rest/v1/sessions?id=eq.<session_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "end_date": "2024-01-10",
  "notes": "Updated notes"
}

Response: Updated session object
```

### Delete Session
```http
DELETE /rest/v1/sessions?id=eq.<session_id>
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 4. Session Agents (Assignments)

### Assign Agents to Session
```http
POST /rest/v1/session_agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_id": "uuid",
  "fur_agent_id": "uuid"
}

Response: Created assignment
```

### Remove Agent from Session
```http
DELETE /rest/v1/session_agents?session_id=eq.<session_id>&fur_agent_id=eq.<agent_id>
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 5. Pet Schedules

### Get Pet Schedule
```http
GET /rest/v1/schedules?pet_id=eq.<pet_id>&select=*,schedule_times(*)
Authorization: Bearer <token>

Response: {
  "id": "uuid",
  "pet_id": "uuid",
  "schedule_times": [
    {
      "id": "uuid",
      "schedule_id": "uuid",
      "activity_type": "feed",
      "time_period": "morning"
    },
    {
      "id": "uuid",
      "schedule_id": "uuid",
      "activity_type": "walk",
      "time_period": "afternoon"
    }
  ]
}
```

### Create/Update Schedule
```http
POST /rest/v1/schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "pet_id": "uuid"
}

Response: Created schedule

Then add schedule times:
POST /rest/v1/schedule_times
{
  "schedule_id": "uuid",
  "activity_type": "feed",
  "time_period": "morning"
}
```

---

## 6. Activities (Completed Tasks)

### Get Activities for Session
```http
GET /rest/v1/activities?session_id=eq.<session_id>&select=*,profiles!activities_caretaker_id_fkey(name)&order=created_at.desc
Authorization: Bearer <token>

Response: [
  {
    "id": "uuid",
    "session_id": "uuid",
    "pet_id": "uuid",
    "caretaker_id": "uuid",
    "activity_type": "feed",
    "time_period": "morning",
    "date": "2024-01-01",
    "photo_url": "https://...",
    "notes": "Fed dry food",
    "profiles": {
      "name": "Agent Name"
    },
    "created_at": "2024-01-01T08:30:00Z"
  }
]
```

### Get Today's Activities (Agent Dashboard)
```http
GET /rest/v1/activities?session_id=eq.<session_id>&date=eq.<today>&select=*
Authorization: Bearer <token>

Response: Today's completed activities
```

### Log Activity
```http
POST /rest/v1/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_id": "uuid",
  "pet_id": "uuid",
  "activity_type": "feed",
  "time_period": "morning",
  "date": "2024-01-01",
  "notes": "Fed dry food",
  "photo_url": "https://..."
}

Response: Created activity
```

### Delete Activity (Undo)
```http
DELETE /rest/v1/activities?id=eq.<activity_id>
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 7. Pet Care Plans

### Get Care Plan
```http
GET /rest/v1/pet_care_plans?pet_id=eq.<pet_id>&select=*
Authorization: Bearer <token>

Response: {
  "id": "uuid",
  "pet_id": "uuid",
  "meal_plan": [
    {
      "time": "morning",
      "food": "Dry food",
      "amount": "1 cup"
    }
  ],
  "daily_frequency": 2,
  "feeding_notes": "No chicken",
  "habits": [
    {
      "habit": "Likes morning walks",
      "notes": "Before 9am"
    }
  ],
  "updated_by": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Create/Update Care Plan
```http
POST /rest/v1/pet_care_plans
Authorization: Bearer <token>
Content-Type: application/json
Prefer: resolution=merge-duplicates

{
  "pet_id": "uuid",
  "meal_plan": [...],
  "daily_frequency": 2,
  "feeding_notes": "Special instructions",
  "habits": [...]
}

Response: Care plan object
```

---

## 8. File Storage (Photos)

### Upload Pet Photo
```http
POST /storage/v1/object/pet-photos/<filename>
Authorization: Bearer <token>
Content-Type: image/jpeg

[binary file data]

Response: {
  "Key": "pet-photos/filename.jpg",
  "Id": "..."
}

Get public URL:
GET /storage/v1/object/public/pet-photos/<filename>
```

### Upload Activity Photo
```http
POST /storage/v1/object/activity-photos/<filename>
Authorization: Bearer <token>
Content-Type: image/jpeg

[binary file data]

Response: Photo object
```

### Upload Profile Photo
```http
POST /storage/v1/object/profile-photos/<filename>
Authorization: Bearer <token>
Content-Type: image/jpeg

[binary file data]

Response: Photo object
```

---

## 9. Real-time Subscriptions

Supabase supports real-time updates via WebSockets.

### Subscribe to Activities
```javascript
const channel = supabase
  .channel('activities')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'activities',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    console.log('New activity:', payload.new)
  })
  .subscribe()
```

### Subscribe to Session Updates
```javascript
const channel = supabase
  .channel('sessions')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sessions'
  }, (payload) => {
    console.log('Session updated:', payload.new)
  })
  .subscribe()
```

---

## Security & Permissions

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:

**Pets:**
- Users can only CRUD their own pets
- Assigned agents can view pets

**Sessions:**
- Pet owners can CRUD sessions for their pets
- Assigned agents can view sessions

**Activities:**
- Pet owners can view all activities
- Assigned agents can create/update activities
- Cannot assign yourself to your own pet

**Profiles:**
- Users can view all profiles
- Users can only update their own profile

### Self-Assignment Prevention

Database trigger prevents agents from being assigned to sessions for their own pets.

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (Delete success)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (RLS policy violation)
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

### Error Response Format
```json
{
  "code": "PGRST116",
  "message": "Error message",
  "details": "Additional details",
  "hint": "Suggestion to fix"
}
```

---

## Rate Limiting

Supabase has built-in rate limiting:
- Anonymous requests: 100/hour
- Authenticated requests: 1000/hour

---

## SDK Support

### Official SDKs
- **JavaScript/TypeScript**: `@supabase/supabase-js`
- **Flutter/Dart**: `supabase_flutter`
- **Swift (iOS)**: `supabase-swift`
- **Kotlin (Android)**: `supabase-kt`
- **Python**: `supabase-py`

### Example (JavaScript)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Query
const { data, error } = await supabase
  .from('pets')
  .select('*')
  .eq('fur_boss_id', userId)

// Insert
const { data, error } = await supabase
  .from('activities')
  .insert({ ... })

// Real-time
supabase
  .channel('activities')
  .on('postgres_changes', { ... }, callback)
  .subscribe()
```

### Example (Swift - iOS)
```swift
import Supabase

let client = SupabaseClient(
  supabaseURL: URL(string: SUPABASE_URL)!,
  supabaseKey: SUPABASE_ANON_KEY
)

// Query
let pets: [Pet] = try await client
  .from("pets")
  .select()
  .eq("fur_boss_id", userId)
  .execute()
  .value

// Insert
try await client
  .from("activities")
  .insert(activity)
  .execute()
```

### Example (Kotlin - Android)
```kotlin
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.from

val client = createSupabaseClient(
  supabaseUrl = SUPABASE_URL,
  supabaseKey = SUPABASE_ANON_KEY
)

// Query
val pets = client.from("pets")
  .select()
  .eq("fur_boss_id", userId)
  .decodeList<Pet>()

// Insert
client.from("activities")
  .insert(activity)
```

---

## Database Schema

See `supabase/migrations/` for complete schema.

### Key Tables
1. **profiles** - User profiles
2. **pets** - Pet information
3. **sessions** - Care sessions
4. **session_agents** - Agent assignments
5. **schedules** - Daily schedules
6. **schedule_times** - Schedule items
7. **activities** - Completed tasks
8. **pet_care_plans** - Feeding & care instructions

### Enums
- **app_role**: `fur_boss`, `fur_agent`, `super_admin`
- **session_status**: `planned`, `active`, `completed`
- **task_type**: `feed`, `walk`, `play`, `medication`, `groom`, `other`

---

## Testing

### Postman Collection
Import the Supabase API into Postman:
- Base URL: Your Supabase project URL
- Add headers: `apikey` and `Authorization`
- Test all endpoints

### cURL Examples

```bash
# Get pets
curl -X GET \
  'https://[project].supabase.co/rest/v1/pets' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'

# Create pet
curl -X POST \
  'https://[project].supabase.co/rest/v1/pets' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Buddy","pet_type":"dog"}'
```

---

## Support

For native app development:
- Use appropriate Supabase SDK for your platform
- All endpoints are auto-generated from database schema
- RLS policies handle permissions automatically
- Real-time subscriptions work across all platforms

## Next Steps

1. Choose your platform (iOS, Android, Flutter)
2. Install appropriate Supabase SDK
3. Configure Supabase client with project URL and anon key
4. Implement authentication flow
5. Start building screens with API calls
6. Add real-time subscriptions for live updates

