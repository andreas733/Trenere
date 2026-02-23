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
          contract_fasat?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trainers"]["Insert"]>;
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
    };
  };
}

export type Trainer = Database["public"]["Tables"]["trainers"]["Row"];
export type WageLevel = Database["public"]["Tables"]["wage_levels"]["Row"];
