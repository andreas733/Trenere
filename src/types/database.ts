export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trainers: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          name: string;
          national_identity_number: string | null;
          birthdate: string | null;
          bank_account_number: string | null;
          phone: string | null;
          street: string | null;
          street2: string | null;
          zip: string | null;
          city: string | null;
          tripletex_id: number | null;
          wage_level_id: string | null;
          minimum_hours: number;
          contract_from_date: string | null;
          contract_to_date: string | null;
          contract_fast: boolean;
          contract_etch_packet_eid: string | null;
          contract_status: string | null;
          contract_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          name: string;
          national_identity_number?: string | null;
          birthdate?: string | null;
          bank_account_number?: string | null;
          phone?: string | null;
          street?: string | null;
          street2?: string | null;
          zip?: string | null;
          city?: string | null;
          tripletex_id?: number | null;
          wage_level_id?: string | null;
          minimum_hours?: number;
          contract_from_date?: string | null;
          contract_to_date?: string | null;
          contract_fast?: boolean;
          contract_etch_packet_eid?: string | null;
          contract_status?: string | null;
          contract_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trainers"]["Insert"]>;
      };
      trainer_levels: {
        Row: {
          id: string;
          name: string;
          sequence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trainer_levels"]["Insert"]>;
      };
      trainer_certifications: {
        Row: {
          trainer_id: string;
          level_id: string;
        };
        Insert: {
          trainer_id: string;
          level_id: string;
        };
        Update: never;
      };
      wage_levels: {
        Row: {
          id: string;
          name: string;
          hourly_wage: number;
          minimum_hours: number;
          sequence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          hourly_wage?: number;
          minimum_hours?: number;
          sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wage_levels"]["Insert"]>;
      };
      admin_users: {
        Row: {
          id: string;
          auth_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
      };
      parties: {
        Row: {
          id: string;
          name: string;
          slug: string;
          has_planner: boolean;
          sequence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          has_planner?: boolean;
          sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["parties"]["Insert"]>;
      };
      trainer_parties: {
        Row: {
          trainer_id: string;
          party_id: string;
        };
        Insert: {
          trainer_id: string;
          party_id: string;
        };
        Update: never;
      };
      training_sessions: {
        Row: {
          id: string;
          title: string;
          content: string;
          total_meters: string | null;
          focus_stroke: string | null;
          intensity: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string;
          total_meters?: string | null;
          focus_stroke?: string | null;
          intensity?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["training_sessions"]["Insert"]>;
      };
      planned_sessions: {
        Row: {
          id: string;
          session_id: string | null;
          planned_date: string;
          planned_by: string | null;
          party_id: string;
          created_at: string;
          ai_title: string | null;
          ai_content: string | null;
          ai_total_meters: string | null;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          planned_date: string;
          planned_by?: string | null;
          party_id: string;
          created_at?: string;
          ai_title?: string | null;
          ai_content?: string | null;
          ai_total_meters?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["planned_sessions"]["Insert"]>;
      };
    };
  };
}

export type Trainer = Database["public"]["Tables"]["trainers"]["Row"];
export type TrainerLevel = Database["public"]["Tables"]["trainer_levels"]["Row"];
export type TrainerCertification = Database["public"]["Tables"]["trainer_certifications"]["Row"];
export type TrainerParty = Database["public"]["Tables"]["trainer_parties"]["Row"];
export type WageLevel = Database["public"]["Tables"]["wage_levels"]["Row"];
export type Party = Database["public"]["Tables"]["parties"]["Row"];
export type TrainingSession = Database["public"]["Tables"]["training_sessions"]["Row"];
export type PlannedSession = Database["public"]["Tables"]["planned_sessions"]["Row"];
