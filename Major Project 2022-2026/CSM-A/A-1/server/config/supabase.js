import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for backend

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

// Debug: Check if using service role key (starts with 'eyJ' and contains 'service_role')
const isServiceKey = supabaseKey.includes('service_role') || supabaseKey.length > 200;
console.log('Using Supabase Service Key:', isServiceKey ? 'YES ✓' : 'NO - Check your .env file!');

// Create client with service role key - bypasses RLS
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export default supabase;
