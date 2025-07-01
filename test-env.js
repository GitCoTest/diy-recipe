// Test environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Testing environment variables...');
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (process.env.OPENAI_API_KEY) {
  console.log('✅ OpenAI API key loaded successfully');
} else {
  console.log('❌ OpenAI API key not loaded');
}

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('✅ Supabase URL loaded successfully');
} else {
  console.log('❌ Supabase URL not loaded');
}
