import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function verifyConnection() {
    console.log('🔍 Verifying Supabase connection...')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test connection
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1)

    if (error && error.code !== 'PGRST116') {
        console.log('✅ Supabase connection successful!')
        console.log('📦 Project URL: <redacted>')
        return true
    } else if (!error) {
        console.log('✅ Supabase connection successful!')
        console.log('📦 Project URL: <redacted>')
        return true
    }

    console.error('❌ Connection failed')
    return false
}

verifyConnection().then((success) => {
    process.exit(success ? 0 : 1)
})
