import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For development/testing without Supabase setup
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  console.warn('⚠️ Supabase not configured - using mock client for development')
  
  // Mock Supabase client for development
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      insert: async () => ({ error: null }),
      select: async () => ({ data: [], error: null }),
      update: async () => ({ error: null }),
      delete: async () => ({ error: null })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

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
