import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyMigrations() {
    console.log('📦 Applying database migrations...')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Read migration files
    const migration1 = readFileSync(join(__dirname, '../supabase/migrations/001_initial_schema.sql'), 'utf-8')
    const migration2 = readFileSync(join(__dirname, '../supabase/migrations/002_row_level_security.sql'), 'utf-8')

    try {
        // Apply initial schema
        console.log('  → Applying 001_initial_schema.sql...')
        const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 })

        if (error1) {
            // Try direct execution via pg_net or fallback
            console.log('  ℹ️  RPC method not available, migrations should be run via Supabase SQL Editor')
            console.log('  📝 Please run migrations manually:')
            console.log('     1. Go to Supabase → SQL Editor')
            console.log('     2. Run supabase/migrations/001_initial_schema.sql')
            console.log('     3. Run supabase/migrations/002_row_level_security.sql')
            return false
        }

        console.log('  ✅ Initial schema applied')

        // Apply RLS policies
        console.log('  → Applying 002_row_level_security.sql...')
        const { error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 })

        if (error2) {
            console.error('  ❌ RLS migration failed:', error2.message)
            return false
        }

        console.log('  ✅ RLS policies applied')
        console.log('✅ All migrations applied successfully!')
        return true

    } catch (error: any) {
        console.error('❌ Migration failed:', error.message)
        return false
    }
}

// Verify tables exist
async function verifyTables() {
    console.log('\n🔍 Verifying database tables...')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requiredTables = [
        'users_profile',
        'projects',
        'todos',
        'research_ideas',
        'gamification_stats',
        'activity_log'
    ]

    for (const table of requiredTables) {
        const { error } = await supabase.from(table).select('*').limit(1)

        if (error) {
            console.log(`  ❌ Table '${table}' not found or not accessible`)
            return false
        } else {
            console.log(`  ✅ Table '${table}' exists`)
        }
    }

    console.log('✅ All required tables exist!')
    return true
}

async function main() {
    const tablesExist = await verifyTables()

    if (!tablesExist) {
        console.log('\n⚠️  Tables not found. Please run migrations manually:')
        console.log('   1. Go to https://app.supabase.com')
        console.log('   2. Navigate to SQL Editor')
        console.log('   3. Run supabase/migrations/001_initial_schema.sql')
        console.log('   4. Run supabase/migrations/002_row_level_security.sql')
        process.exit(1)
    }

    process.exit(0)
}

main()
