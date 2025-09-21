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
      routes: {
        Row: {
          ac_price: number
          created_at: string | null
          distance: number
          from_station_id: string | null
          general_price: number
          id: string
          sleeper_price: number
          to_station_id: string | null
        }
        Insert: {
          ac_price: number
          created_at?: string | null
          distance: number
          from_station_id?: string | null
          general_price: number
          id?: string
          sleeper_price: number
          to_station_id?: string | null
        }
        Update: {
          ac_price?: number
          created_at?: string | null
          distance?: number
          from_station_id?: string | null
          general_price?: number
          id?: string
          sleeper_price?: number
          to_station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_from_station_id_fkey"
            columns: ["from_station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_to_station_id_fkey"
            columns: ["to_station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          password: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_id: string
          updated_at: string
          working_station: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          password: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_id: string
          updated_at?: string
          working_station?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          password?: string
          role?: Database["public"]["Enums"]["staff_role"]
          staff_id?: string
          updated_at?: string
          working_station?: string | null
        }
        Relationships: []
      }
      stations: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          id: string
          name: string
          working_station: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          working_station?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          working_station?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          arrival_time: string | null
          class_type: string | null
          created_at: string | null
          created_by: string
          created_time: string
          departure_time: string | null
          expires_at: string
          from_station_id: string | null
          id: string
          is_verified: boolean | null
          kilometres: number
          passenger_count: number
          passenger_name: string
          price: number
          route_id: string | null
          seat_number: string | null
          ticket_class: string
          to_station_id: string | null
          total_price: number
          train_id: string | null
          travel_date: string
          travel_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          arrival_time?: string | null
          class_type?: string | null
          created_at?: string | null
          created_by: string
          created_time: string
          departure_time?: string | null
          expires_at: string
          from_station_id?: string | null
          id?: string
          is_verified?: boolean | null
          kilometres: number
          passenger_count?: number
          passenger_name: string
          price: number
          route_id?: string | null
          seat_number?: string | null
          ticket_class: string
          to_station_id?: string | null
          total_price: number
          train_id?: string | null
          travel_date: string
          travel_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          arrival_time?: string | null
          class_type?: string | null
          created_at?: string | null
          created_by?: string
          created_time?: string
          departure_time?: string | null
          expires_at?: string
          from_station_id?: string | null
          id?: string
          is_verified?: boolean | null
          kilometres?: number
          passenger_count?: number
          passenger_name?: string
          price?: number
          route_id?: string | null
          seat_number?: string | null
          ticket_class?: string
          to_station_id?: string | null
          total_price?: number
          train_id?: string | null
          travel_date?: string
          travel_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_from_station_id_fkey"
            columns: ["from_station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_to_station_id_fkey"
            columns: ["to_station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "trains"
            referencedColumns: ["id"]
          },
        ]
      }
      train_classes: {
        Row: {
          base_price: number
          class_type: string
          created_at: string
          id: string
          price_per_km: number
          total_seats: number
          train_id: string
        }
        Insert: {
          base_price?: number
          class_type: string
          created_at?: string
          id?: string
          price_per_km?: number
          total_seats?: number
          train_id: string
        }
        Update: {
          base_price?: number
          class_type?: string
          created_at?: string
          id?: string
          price_per_km?: number
          total_seats?: number
          train_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "train_classes_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "trains"
            referencedColumns: ["id"]
          },
        ]
      }
      train_routes: {
        Row: {
          ac_1_tier_price: number | null
          ac_2_tier_price: number | null
          ac_3_economy_price: number | null
          ac_3_tier_price: number | null
          arrival_time: string | null
          chair_car_price: number | null
          created_at: string
          departure_time: string | null
          distance_from_start: number
          general_price: number | null
          halt_duration: number | null
          halt_order: number
          id: string
          second_sitting_price: number | null
          sleeper_price: number | null
          station_id: string
          train_id: string
        }
        Insert: {
          ac_1_tier_price?: number | null
          ac_2_tier_price?: number | null
          ac_3_economy_price?: number | null
          ac_3_tier_price?: number | null
          arrival_time?: string | null
          chair_car_price?: number | null
          created_at?: string
          departure_time?: string | null
          distance_from_start: number
          general_price?: number | null
          halt_duration?: number | null
          halt_order: number
          id?: string
          second_sitting_price?: number | null
          sleeper_price?: number | null
          station_id: string
          train_id: string
        }
        Update: {
          ac_1_tier_price?: number | null
          ac_2_tier_price?: number | null
          ac_3_economy_price?: number | null
          ac_3_tier_price?: number | null
          arrival_time?: string | null
          chair_car_price?: number | null
          created_at?: string
          departure_time?: string | null
          distance_from_start?: number
          general_price?: number | null
          halt_duration?: number | null
          halt_order?: number
          id?: string
          second_sitting_price?: number | null
          sleeper_price?: number | null
          station_id?: string
          train_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "train_routes_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "train_routes_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "trains"
            referencedColumns: ["id"]
          },
        ]
      }
      train_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_active: boolean
          train_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_active?: boolean
          train_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          train_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "train_schedules_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "trains"
            referencedColumns: ["id"]
          },
        ]
      }
      trains: {
        Row: {
          created_at: string
          id: string
          name: string
          number: string
          working_station: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          number: string
          working_station?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          number?: string
          working_station?: string | null
        }
        Relationships: []
      }
      verification_logs: {
        Row: {
          details: string | null
          fraud_attempt: boolean | null
          id: string
          status: string
          ticket_id: string | null
          travel_id: string
          verified_at: string | null
          verified_by: string
        }
        Insert: {
          details?: string | null
          fraud_attempt?: boolean | null
          id?: string
          status: string
          ticket_id?: string | null
          travel_id: string
          verified_at?: string | null
          verified_by: string
        }
        Update: {
          details?: string | null
          fraud_attempt?: boolean | null
          id?: string
          status?: string
          ticket_id?: string | null
          travel_id?: string
          verified_at?: string | null
          verified_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      voters: {
        Row: {
          aadhaar_number: string
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          has_voted: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_login: string | null
          name: string
          password: string
          phone_number: string | null
          registration_date: string | null
          updated_at: string | null
          voter_id: string
        }
        Insert: {
          aadhaar_number: string
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          has_voted?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          name: string
          password: string
          phone_number?: string | null
          registration_date?: string | null
          updated_at?: string | null
          voter_id: string
        }
        Update: {
          aadhaar_number?: string
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          has_voted?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          name?: string
          password?: string
          phone_number?: string | null
          registration_date?: string | null
          updated_at?: string | null
          voter_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          candidate_id: string
          candidate_name: string
          election_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          voted_at: string | null
          voter_id: string | null
        }
        Insert: {
          candidate_id: string
          candidate_name: string
          election_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          voted_at?: string | null
          voter_id?: string | null
        }
        Update: {
          candidate_id?: string
          candidate_name?: string
          election_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          voted_at?: string | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "voters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_voter_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      staff_role: "ticket_creator" | "tte"
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
      staff_role: ["ticket_creator", "tte"],
    },
  },
} as const
