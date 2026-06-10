export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          categoria: string
          created_at: string
          criado_por: string
          descricao: string
          id: string
          pontos: number
          prazo: string | null
          publicada: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          criado_por: string
          descricao: string
          id?: string
          pontos?: number
          prazo?: string | null
          publicada?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          criado_por?: string
          descricao?: string
          id?: string
          pontos?: number
          prazo?: string | null
          publicada?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      avaliacoes_cha: {
        Row: {
          atitudes: number
          conhecimentos: number
          created_at: string
          habilidades: number
          id: string
          oportunidades: string[] | null
          pontos_fortes: string[] | null
          pontuacao_geral: number
          respostas: Json
          user_id: string
        }
        Insert: {
          atitudes: number
          conhecimentos: number
          created_at?: string
          habilidades: number
          id?: string
          oportunidades?: string[] | null
          pontos_fortes?: string[] | null
          pontuacao_geral: number
          respostas: Json
          user_id: string
        }
        Update: {
          atitudes?: number
          conhecimentos?: number
          created_at?: string
          habilidades?: number
          id?: string
          oportunidades?: string[] | null
          pontos_fortes?: string[] | null
          pontuacao_geral?: number
          respostas?: Json
          user_id?: string
        }
        Relationships: []
      }
      desafios: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string
          id: string
          pontos: number
          semana: number | null
          titulo: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          descricao: string
          id?: string
          pontos?: number
          semana?: number | null
          titulo: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string
          id?: string
          pontos?: number
          semana?: number | null
          titulo?: string
        }
        Relationships: []
      }
      desafios_concluidos: {
        Row: {
          concluido_em: string
          desafio_id: string
          id: string
          user_id: string
        }
        Insert: {
          concluido_em?: string
          desafio_id: string
          id?: string
          user_id: string
        }
        Update: {
          concluido_em?: string
          desafio_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "desafios_concluidos_desafio_id_fkey"
            columns: ["desafio_id"]
            isOneToOne: false
            referencedRelation: "desafios"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_lider: {
        Row: {
          aplicarei: string | null
          aprendi: string
          created_at: string
          habilidade: string | null
          id: string
          insight: string | null
          user_id: string
        }
        Insert: {
          aplicarei?: string | null
          aprendi: string
          created_at?: string
          habilidade?: string | null
          id?: string
          insight?: string | null
          user_id: string
        }
        Update: {
          aplicarei?: string | null
          aprendi?: string
          created_at?: string
          habilidade?: string | null
          id?: string
          insight?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pdi: {
        Row: {
          acao: string
          competencia: string
          created_at: string
          id: string
          objetivo: string
          pontos_creditados: boolean
          prazo: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acao: string
          competencia: string
          created_at?: string
          id?: string
          objetivo: string
          pontos_creditados?: boolean
          prazo?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acao?: string
          competencia?: string
          created_at?: string
          id?: string
          objetivo?: string
          pontos_creditados?: boolean
          prazo?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area_atuacao: string | null
          cargo: string | null
          created_at: string
          email: string | null
          empresa: string | null
          id: string
          is_admin: boolean
          nome: string | null
          pontuacao: number
          tempo_experiencia: string | null
          updated_at: string
        }
        Insert: {
          area_atuacao?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          id: string
          is_admin?: boolean
          nome?: string | null
          pontuacao?: number
          tempo_experiencia?: string | null
          updated_at?: string
        }
        Update: {
          area_atuacao?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          id?: string
          is_admin?: boolean
          nome?: string | null
          pontuacao?: number
          tempo_experiencia?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      respostas_atividades: {
        Row: {
          atividade_id: string
          avaliado_em: string | null
          created_at: string
          feedback: string | null
          id: string
          nota: number | null
          resposta: string
          updated_at: string
          user_id: string
        }
        Insert: {
          atividade_id: string
          avaliado_em?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          nota?: number | null
          resposta: string
          updated_at?: string
          user_id: string
        }
        Update: {
          atividade_id?: string
          avaliado_em?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          nota?: number | null
          resposta?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_atividades_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      testes_lideranca: {
        Row: {
          created_at: string
          id: string
          perfil_predominante: string
          pontuacoes: Json
          respostas: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfil_predominante: string
          pontuacoes: Json
          respostas: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfil_predominante?: string
          pontuacoes?: Json
          respostas?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_pontos: {
        Args: { p_pontos: number; p_user: string }
        Returns: undefined
      }
      is_admin: { Args: { _user: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
