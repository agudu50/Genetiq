const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		"Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
	);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
