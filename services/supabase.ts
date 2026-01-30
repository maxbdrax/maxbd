
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://etcnunymawlopmrwqhkn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y251bnltYXdsb3BtcndxaGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDcxNTAsImV4cCI6MjA4NTMyMzE1MH0.wPvxi7g-ZOLzrX51d5-2B4_LfqZgXw_1Otw0ZIts-_A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
