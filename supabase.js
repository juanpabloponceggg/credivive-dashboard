import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ouuhdxncyvfxgbktpane.supabase.co";
const supabaseAnonKey = "sb_publishable_ByM8KekwregB47APZbQRDA_pmguEhYU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
