import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = "https://gcqowfeztnnqgbfwwqwd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcW93ZmV6dG5ucWdiZnd3cXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTQ5NTQsImV4cCI6MjA3MzA3MDk1NH0.GmMhyUj_NiB8cGEVFB1-vsLOSG6vjUxQRKrEAfXYuw4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
