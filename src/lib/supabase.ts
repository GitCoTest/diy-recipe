import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing from environment variables')
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (will be updated after Supabase setup)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          cook_time: string
          difficulty: string
          servings: number
          image: string | null
          ingredients: string
          instructions: string
          source: string | null
          meal_type: string | null
          dietary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          cook_time: string
          difficulty: string
          servings: number
          image?: string | null
          ingredients: string
          instructions: string
          source?: string | null
          meal_type?: string | null
          dietary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          cook_time?: string
          difficulty?: string
          servings?: number
          image?: string | null
          ingredients?: string
          instructions?: string
          source?: string | null
          meal_type?: string | null
          dietary?: string | null
          created_at?: string
        }
      }
      custom_ingredients: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          validated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          validated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          validated?: boolean
          created_at?: string
        }
      }
      recipe_history: {
        Row: {
          id: string
          user_id: string | null
          base_ingredients: string
          main_ingredients: string
          meal_type: string | null
          dietary: string | null
          customizations: string
          surprise_mode: boolean
          recipes_generated: number
          source: string
          success: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          base_ingredients: string
          main_ingredients: string
          meal_type?: string | null
          dietary?: string | null
          customizations: string
          surprise_mode?: boolean
          recipes_generated: number
          source: string
          success?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          base_ingredients?: string
          main_ingredients?: string
          meal_type?: string | null
          dietary?: string | null
          customizations?: string
          surprise_mode?: boolean
          recipes_generated?: number
          source?: string
          success?: boolean
          created_at?: string
        }
      }
    }
  }
}
