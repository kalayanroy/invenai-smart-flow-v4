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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          ai_recommendation: string | null
          barcode: string | null
          category: string
          created_at: string | null
          id: string
          image: string | null
          name: string
          opening_stock: number
          price: string
          purchase_price: string
          reorder_point: number
          sell_price: string
          sku: string
          status: string
          stock: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          ai_recommendation?: string | null
          barcode?: string | null
          category: string
          created_at?: string | null
          id: string
          image?: string | null
          name: string
          opening_stock?: number
          price: string
          purchase_price: string
          reorder_point?: number
          sell_price: string
          sku: string
          status?: string
          stock?: number
          unit?: string
          updated_at?: string | null
        }
        Update: {
          ai_recommendation?: string | null
          barcode?: string | null
          category?: string
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          opening_stock?: number
          price?: string
          purchase_price?: string
          reorder_point?: number
          sell_price?: string
          sku?: string
          status?: string
          stock?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          product_id: string
          product_name: string
          quantity: number
          status: string
          supplier: string
          total_amount: string
          unit_price: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id: string
          notes?: string | null
          product_id: string
          product_name: string
          quantity: number
          status?: string
          supplier: string
          total_amount: string
          unit_price: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          status?: string
          supplier?: string
          total_amount?: string
          unit_price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          customer_name: string | null
          date: string
          id: string
          notes: string | null
          product_id: string
          product_name: string
          quantity: number
          status: string
          total_amount: string
          unit_price: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          date: string
          id: string
          notes?: string | null
          product_id: string
          product_name: string
          quantity: number
          status?: string
          total_amount: string
          unit_price: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          date?: string
          id?: string
          notes?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          status?: string
          total_amount?: string
          unit_price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_returns: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string
          notes: string | null
          original_quantity: number
          original_sale_id: string
          processed_by: string | null
          processed_date: string | null
          product_id: string
          product_name: string
          reason: string
          return_date: string
          return_quantity: number
          status: string
          total_refund: string
          unit_price: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id: string
          notes?: string | null
          original_quantity: number
          original_sale_id: string
          processed_by?: string | null
          processed_date?: string | null
          product_id: string
          product_name: string
          reason: string
          return_date: string
          return_quantity: number
          status?: string
          total_refund: string
          unit_price: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          original_quantity?: number
          original_sale_id?: string
          processed_by?: string | null
          processed_date?: string | null
          product_id?: string
          product_name?: string
          reason?: string
          return_date?: string
          return_quantity?: number
          status?: string
          total_refund?: string
          unit_price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_returns_original_sale_id_fkey"
            columns: ["original_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
