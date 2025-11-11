export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          caretaker_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          pet_id: string
          photo_url: string | null
          session_id: string
          time_period: Database["public"]["Enums"]["time_period"]
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          caretaker_id: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          pet_id: string
          photo_url?: string | null
          session_id: string
          time_period: Database["public"]["Enums"]["time_period"]
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          caretaker_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          pet_id?: string
          photo_url?: string | null
          session_id?: string
          time_period?: Database["public"]["Enums"]["time_period"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      care_logs: {
        Row: {
          care_task_id: string
          completed_at: string
          fur_agent_id: string
          id: string
          notes: string | null
          paw_points_earned: number | null
          photo_url: string | null
          session_id: string
        }
        Insert: {
          care_task_id: string
          completed_at?: string
          fur_agent_id: string
          id?: string
          notes?: string | null
          paw_points_earned?: number | null
          photo_url?: string | null
          session_id: string
        }
        Update: {
          care_task_id?: string
          completed_at?: string
          fur_agent_id?: string
          id?: string
          notes?: string | null
          paw_points_earned?: number | null
          photo_url?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_logs_care_task_id_fkey"
            columns: ["care_task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_logs_fur_agent_id_fkey"
            columns: ["fur_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      care_tasks: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          session_id: string
          task_type: Database["public"]["Enums"]["task_type"]
          time_period: string | null
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          session_id: string
          task_type: Database["public"]["Enums"]["task_type"]
          time_period?: string | null
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          session_id?: string
          task_type?: Database["public"]["Enums"]["task_type"]
          time_period?: string | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          recipient_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          recipient_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_care_plans: {
        Row: {
          created_at: string
          daily_frequency: number | null
          feeding_notes: string | null
          habits: Json
          id: string
          meal_plan: Json
          pet_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          daily_frequency?: number | null
          feeding_notes?: string | null
          habits?: Json
          id?: string
          meal_plan?: Json
          pet_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          daily_frequency?: number | null
          feeding_notes?: string | null
          habits?: Json
          id?: string
          meal_plan?: Json
          pet_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_care_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_care_plans_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: number | null
          breed: string | null
          created_at: string
          food_preferences: string | null
          fur_boss_id: string
          id: string
          medical_info: string | null
          name: string
          photo_url: string | null
          updated_at: string
          vet_contact: string | null
        }
        Insert: {
          age?: number | null
          breed?: string | null
          created_at?: string
          food_preferences?: string | null
          fur_boss_id: string
          id?: string
          medical_info?: string | null
          name: string
          photo_url?: string | null
          updated_at?: string
          vet_contact?: string | null
        }
        Update: {
          age?: number | null
          breed?: string | null
          created_at?: string
          food_preferences?: string | null
          fur_boss_id?: string
          id?: string
          medical_info?: string | null
          name?: string
          photo_url?: string | null
          updated_at?: string
          vet_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_fur_boss_id_fkey"
            columns: ["fur_boss_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          paw_points: number | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          paw_points?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          paw_points?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      schedule_times: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          id: string
          schedule_id: string
          time_period: Database["public"]["Enums"]["time_period"]
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          schedule_id: string
          time_period: Database["public"]["Enums"]["time_period"]
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          schedule_id?: string
          time_period?: Database["public"]["Enums"]["time_period"]
        }
        Relationships: [
          {
            foreignKeyName: "schedule_times_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          feeding_instruction: string | null
          id: string
          letout_instruction: string | null
          pet_id: string
          session_id: string | null
          updated_at: string
          walking_instruction: string | null
        }
        Insert: {
          created_at?: string
          feeding_instruction?: string | null
          id?: string
          letout_instruction?: string | null
          pet_id: string
          session_id?: string | null
          updated_at?: string
          walking_instruction?: string | null
        }
        Update: {
          created_at?: string
          feeding_instruction?: string | null
          id?: string
          letout_instruction?: string | null
          pet_id?: string
          session_id?: string | null
          updated_at?: string
          walking_instruction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_agents: {
        Row: {
          created_at: string
          fur_agent_id: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          fur_agent_id: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          fur_agent_id?: string
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_agents_fur_agent_id_fkey"
            columns: ["fur_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_agents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          end_date: string
          fur_boss_id: string
          id: string
          notes: string | null
          pet_id: string
          recurrence_rule: string | null
          start_date: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          fur_boss_id: string
          id?: string
          notes?: string | null
          pet_id: string
          recurrence_rule?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          fur_boss_id?: string
          id?: string
          notes?: string | null
          pet_id?: string
          recurrence_rule?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_fur_boss_id_fkey"
            columns: ["fur_boss_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_pet_agent: {
        Args: { pet_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_session_agent: {
        Args: { session_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_session_owner: {
        Args: { session_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type: "feed" | "walk" | "letout"
      app_role: "fur_boss" | "fur_agent" | "super_admin"
      session_status: "planned" | "active" | "completed"
      task_type: "feed" | "walk" | "play" | "medication" | "groom" | "other"
      time_period: "morning" | "afternoon" | "evening"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type: ["feed", "walk", "letout"],
      app_role: ["fur_boss", "fur_agent", "super_admin"],
      session_status: ["planned", "active", "completed"],
      task_type: ["feed", "walk", "play", "medication", "groom", "other"],
      time_period: ["morning", "afternoon", "evening"],
    },
  },
} as const

