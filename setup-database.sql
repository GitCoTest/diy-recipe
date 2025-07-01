-- 🗄️ DIY Recipe App - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cook_time TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  servings INTEGER NOT NULL,
  image TEXT,
  ingredients TEXT NOT NULL, -- JSON string
  instructions TEXT NOT NULL, -- JSON string
  source TEXT,
  meal_type TEXT,
  dietary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_ingredients table
CREATE TABLE IF NOT EXISTS public.custom_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  validated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create recipe_history table
CREATE TABLE IF NOT EXISTS public.recipe_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  base_ingredients TEXT NOT NULL, -- JSON string
  main_ingredients TEXT NOT NULL, -- JSON string
  meal_type TEXT,
  dietary TEXT,
  customizations TEXT NOT NULL, -- JSON string
  surprise_mode BOOLEAN DEFAULT FALSE,
  recipes_generated INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'gpt' or 'fallback'
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can insert own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can update own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can delete own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can view own custom ingredients" ON public.custom_ingredients;
DROP POLICY IF EXISTS "Users can insert own custom ingredients" ON public.custom_ingredients;
DROP POLICY IF EXISTS "Users can update own custom ingredients" ON public.custom_ingredients;
DROP POLICY IF EXISTS "Users can delete own custom ingredients" ON public.custom_ingredients;
DROP POLICY IF EXISTS "Users can view own recipe history" ON public.recipe_history;
DROP POLICY IF EXISTS "Users can insert own recipe history" ON public.recipe_history;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own saved recipes" ON public.saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved recipes" ON public.saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved recipes" ON public.saved_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved recipes" ON public.saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own custom ingredients" ON public.custom_ingredients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom ingredients" ON public.custom_ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom ingredients" ON public.custom_ingredients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom ingredients" ON public.custom_ingredients
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recipe history" ON public.recipe_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe history" ON public.recipe_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON public.saved_recipes(created_at);
CREATE INDEX IF NOT EXISTS idx_custom_ingredients_user_id ON public.custom_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_history_user_id ON public.recipe_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_history_created_at ON public.recipe_history(created_at);

-- Show success message
SELECT 'Database schema setup complete! 🎉' as message;
