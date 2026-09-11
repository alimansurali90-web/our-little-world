const SUPABASE_URL = "https://vfydzwdkxrbivkgzzfoq.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable__y97lokGPidObPWM9MOTZQ_ktden-yT";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);