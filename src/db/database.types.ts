export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_challenges: {
        Row: {
          created_at: string | null
          date: string
          deleted_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          puzzle_string: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deleted_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          puzzle_string?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          puzzle_string?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_puzzle_string_fkey"
            columns: ["puzzle_string"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["puzzle_string"]
          },
        ]
      }
      game_states: {
        Row: {
          created_at: string | null
          current_state: Json
          hints_used: number | null
          id: string
          is_completed: boolean | null
          last_hint_at: string | null
          moves_history: Json[] | null
          notes: Json | null
          puzzle_string: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_state: Json
          hints_used?: number | null
          id?: string
          is_completed?: boolean | null
          last_hint_at?: string | null
          moves_history?: Json[] | null
          notes?: Json | null
          puzzle_string?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_state?: Json
          hints_used?: number | null
          id?: string
          is_completed?: boolean | null
          last_hint_at?: string | null
          moves_history?: Json[] | null
          notes?: Json | null
          puzzle_string?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_states_puzzle_string_fkey"
            columns: ["puzzle_string"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["puzzle_string"]
          },
        ]
      }
      puzzles: {
        Row: {
          clue_count: number
          created_at: string | null
          deleted_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          is_symmetric: boolean | null
          puzzle_string: string
          rating: number
          source: string | null
        }
        Insert: {
          clue_count: number
          created_at?: string | null
          deleted_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          is_symmetric?: boolean | null
          puzzle_string: string
          rating: number
          source?: string | null
        }
        Update: {
          clue_count?: number
          created_at?: string | null
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          is_symmetric?: boolean | null
          puzzle_string?: string
          rating?: number
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard" | "diabolical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ["easy", "medium", "hard", "diabolical"],
    },
  },
} as const
