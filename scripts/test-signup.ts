import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testSignup() {
    console.log('🔬 Testing Supabase Signup Flow')
    console.log('='.repeat(60))
    console.log('')

    // Use service role for debugging
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Generate unique test email
    const testEmail = `debug-${Date.now()}@test.com`
    const testPassword = 'TestPassword123!'

    console.log(`📧 Test Email: ${testEmail}`)
    console.log(`🔐 Test Password: ${testPassword}`)
    console.log('')

    // Attempt signup
    console.log('🚀 Attempting signup...')
    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    })

    if (error) {
        console.log('❌ SIGNUP FAILED')
        console.log('='.repeat(60))
        console.log('Error Details:')
        console.log(`  Code: ${error.status || 'N/A'}`)
        console.log(`  Message: ${error.message}`)
        console.log(`  Name: ${error.name}`)
        if (error.stack) {
            console.log(`  Stack: ${error.stack}`)
        }
        console.log('='.repeat(60))

        // Try to get more details about the database state
        if (data?.user?.id) {
            console.log('')
            console.log('🔍 User was created, checking profile...')
            const { data: profile, error: profileError } = await supabase
                .from('users_profile')
                .select('*')
                .eq('id', data.user.id)
                .single()

            if (profileError) {
                console.log(`❌ Profile check failed: ${profileError.message}`)
            } else if (profile) {
                console.log(`✅ Profile exists for user ${data.user.id}`)
            } else {
                console.log(`⚠️  No profile found for user ${data.user.id}`)
            }

            const { data: stats, error: statsError } = await supabase
                .from('gamification_stats')
                .select('*')
                .eq('user_id', data.user.id)
                .single()

            if (statsError) {
                console.log(`❌ Stats check failed: ${statsError.message}`)
            } else if (stats) {
                console.log(`✅ Gamification stats exist for user ${data.user.id}`)
            } else {
                console.log(`⚠️  No gamification stats found for user ${data.user.id}`)
            }
        }

        process.exit(1)
    }

    console.log('✅ SIGNUP SUCCESSFUL')
    console.log('='.repeat(60))
    console.log(`User ID: ${data.user?.id}`)
    console.log(`Email: ${data.user?.email}`)
    console.log('')

    // Verify profile creation
    console.log('🔍 Verifying profile auto-creation...')
    const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', data.user!.id)
        .single()

    if (profileError) {
        console.log(`❌ Profile not created: ${profileError.message}`)
        process.exit(1)
    }

    console.log('✅ Profile created successfully')
    console.log(`   Profile ID: ${profile.id}`)
    console.log('')

    // Verify gamification stats creation
    console.log('🔍 Verifying gamification stats auto-creation...')
    const { data: stats, error: statsError } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', data.user!.id)
        .single()

    if (statsError) {
        console.log(`❌ Gamification stats not created: ${statsError.message}`)
        process.exit(1)
    }

    console.log('✅ Gamification stats created successfully')
    console.log(`   User ID: ${stats.user_id}`)
    console.log(`   Level: ${stats.level}`)
    console.log(`   Total XP: ${stats.total_xp}`)
    console.log('')

    // Test login
    console.log('🔐 Testing login with new user...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    })

    if (loginError) {
        console.log(`❌ Login failed: ${loginError.message}`)
        process.exit(1)
    }

    console.log('✅ Login successful')
    console.log(`   Session: ${loginData.session ? 'Active' : 'None'}`)
    console.log('')

    console.log('='.repeat(60))
    console.log('🎉 ALL TESTS PASSED')
    console.log('='.repeat(60))
    console.log('')
    console.log('Signup pipeline is fully operational!')

    process.exit(0)
}

testSignup().catch((error) => {
    console.error('\n💥 Test crashed:', error.message)
    console.error(error.stack)
    process.exit(1)
})
