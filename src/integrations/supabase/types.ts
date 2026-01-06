export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      documents: {
        Row: {
          created_at: string;
          document_type: string;
          extracted_data: Json | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          id: string;
          status: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          document_type?: string;
          extracted_data?: Json | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          document_type?: string;
          extracted_data?: Json | null;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      eligibility_criteria: {
        Row: {
          created_at: string | null;
          custom_requirements: Json | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          lender_id: string;
          max_anomaly_count: number | null;
          min_business_age_months: number | null;
          min_credibility_score: number | null;
          min_monthly_revenue: number | null;
          min_trust_tier: number | null;
          name: string;
          required_document_types: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_requirements?: Json | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          lender_id: string;
          max_anomaly_count?: number | null;
          min_business_age_months?: number | null;
          min_credibility_score?: number | null;
          min_monthly_revenue?: number | null;
          min_trust_tier?: number | null;
          name: string;
          required_document_types?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_requirements?: Json | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          lender_id?: string;
          max_anomaly_count?: number | null;
          min_business_age_months?: number | null;
          min_credibility_score?: number | null;
          min_monthly_revenue?: number | null;
          min_trust_tier?: number | null;
          name?: string;
          required_document_types?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "eligibility_criteria_lender_id_fkey";
            columns: ["lender_id"];
            isOneToOne: false;
            referencedRelation: "lenders";
            referencedColumns: ["id"];
          }
        ];
      };
      lenders: {
        Row: {
          contact_email: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          is_verified: boolean | null;
          logo_url: string | null;
          name: string;
          organization_type: Database["public"]["Enums"]["organization_type"];
          updated_at: string | null;
          user_id: string | null;
          website: string | null;
        };
        Insert: {
          contact_email?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_verified?: boolean | null;
          logo_url?: string | null;
          name: string;
          organization_type?: Database["public"]["Enums"]["organization_type"];
          updated_at?: string | null;
          user_id?: string | null;
          website?: string | null;
        };
        Update: {
          contact_email?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_verified?: boolean | null;
          logo_url?: string | null;
          name?: string;
          organization_type?: Database["public"]["Enums"]["organization_type"];
          updated_at?: string | null;
          user_id?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      marketplace_invitations: {
        Row: {
          created_at: string | null;
          criteria_id: string | null;
          expires_at: string | null;
          id: string;
          invitation_type: string;
          lender_id: string;
          message: string | null;
          offer_details: Json | null;
          sme_id: string;
          sme_response: string | null;
          status: Database["public"]["Enums"]["request_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          criteria_id?: string | null;
          expires_at?: string | null;
          id?: string;
          invitation_type: string;
          lender_id: string;
          message?: string | null;
          offer_details?: Json | null;
          sme_id: string;
          sme_response?: string | null;
          status?: Database["public"]["Enums"]["request_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          criteria_id?: string | null;
          expires_at?: string | null;
          id?: string;
          invitation_type?: string;
          lender_id?: string;
          message?: string | null;
          offer_details?: Json | null;
          sme_id?: string;
          sme_response?: string | null;
          status?: Database["public"]["Enums"]["request_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "marketplace_invitations_criteria_id_fkey";
            columns: ["criteria_id"];
            isOneToOne: false;
            referencedRelation: "eligibility_criteria";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marketplace_invitations_lender_id_fkey";
            columns: ["lender_id"];
            isOneToOne: false;
            referencedRelation: "lenders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marketplace_invitations_sme_id_fkey";
            columns: ["sme_id"];
            isOneToOne: false;
            referencedRelation: "sme_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      marketplace_requests: {
        Row: {
          amount_requested: number | null;
          created_at: string | null;
          credibility_snapshot: Json | null;
          criteria_id: string | null;
          id: string;
          lender_id: string;
          lender_response: string | null;
          message: string | null;
          purpose: string | null;
          request_type: string;
          sme_id: string;
          status: Database["public"]["Enums"]["request_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          amount_requested?: number | null;
          created_at?: string | null;
          credibility_snapshot?: Json | null;
          criteria_id?: string | null;
          id?: string;
          lender_id: string;
          lender_response?: string | null;
          message?: string | null;
          purpose?: string | null;
          request_type: string;
          sme_id: string;
          status?: Database["public"]["Enums"]["request_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          amount_requested?: number | null;
          created_at?: string | null;
          credibility_snapshot?: Json | null;
          criteria_id?: string | null;
          id?: string;
          lender_id?: string;
          lender_response?: string | null;
          message?: string | null;
          purpose?: string | null;
          request_type?: string;
          sme_id?: string;
          status?: Database["public"]["Enums"]["request_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "marketplace_requests_criteria_id_fkey";
            columns: ["criteria_id"];
            isOneToOne: false;
            referencedRelation: "eligibility_criteria";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marketplace_requests_lender_id_fkey";
            columns: ["lender_id"];
            isOneToOne: false;
            referencedRelation: "lenders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marketplace_requests_sme_id_fkey";
            columns: ["sme_id"];
            isOneToOne: false;
            referencedRelation: "sme_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      sme_profiles: {
        Row: {
          address: string | null;
          anomaly_count: number | null;
          business_name: string;
          business_type: string | null;
          compliance_score: number | null;
          created_at: string | null;
          credibility_score: number | null;
          email: string | null;
          established_date: string | null;
          evidence_quality_score: number | null;
          id: string;
          is_public: boolean | null;
          last_score_update: string | null;
          phone: string | null;
          registration_number: string | null;
          stability_score: number | null;
          total_documents: number | null;
          trust_tier: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          anomaly_count?: number | null;
          business_name: string;
          business_type?: string | null;
          compliance_score?: number | null;
          created_at?: string | null;
          credibility_score?: number | null;
          email?: string | null;
          established_date?: string | null;
          evidence_quality_score?: number | null;
          id?: string;
          is_public?: boolean | null;
          last_score_update?: string | null;
          phone?: string | null;
          registration_number?: string | null;
          stability_score?: number | null;
          total_documents?: number | null;
          trust_tier?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          address?: string | null;
          anomaly_count?: number | null;
          business_name?: string;
          business_type?: string | null;
          compliance_score?: number | null;
          created_at?: string | null;
          credibility_score?: number | null;
          email?: string | null;
          established_date?: string | null;
          evidence_quality_score?: number | null;
          id?: string;
          is_public?: boolean | null;
          last_score_update?: string | null;
          phone?: string | null;
          registration_number?: string | null;
          stability_score?: number | null;
          total_documents?: number | null;
          trust_tier?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      verification_proofs: {
        Row: {
          blockchain_network: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          included_data: Json;
          proof_hash: string;
          proof_name: string;
          shared_with: string | null;
          shared_with_email: string | null;
          status: string;
          tx_hash: string | null;
          updated_at: string;
          user_id: string | null;
          verification_url: string | null;
        };
        Insert: {
          blockchain_network?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          included_data: Json;
          proof_hash: string;
          proof_name: string;
          shared_with?: string | null;
          shared_with_email?: string | null;
          status?: string;
          tx_hash?: string | null;
          updated_at?: string;
          user_id?: string | null;
          verification_url?: string | null;
        };
        Update: {
          blockchain_network?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          included_data?: Json;
          proof_hash?: string;
          proof_name?: string;
          shared_with?: string | null;
          shared_with_email?: string | null;
          status?: string;
          tx_hash?: string | null;
          updated_at?: string;
          user_id?: string | null;
          verification_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      organization_type:
        | "bank"
        | "microfinance"
        | "cooperative"
        | "business"
        | "investor";
      request_status: "pending" | "accepted" | "rejected" | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      organization_type: [
        "bank",
        "microfinance",
        "cooperative",
        "business",
        "investor",
      ],
      request_status: ["pending", "accepted", "rejected", "expired"],
    },
  },
} as const;
