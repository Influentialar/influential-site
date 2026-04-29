// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = 'https://lbcgqkoyhhiywfwjvqth.supabase.co'
const supabaseAnon = 'sb_publishable_Bj03G1dqyfpp9fWeCCBa3w_6XltZ3EJ'

export const supabase = createClient(supabaseUrl, supabaseAnon)
