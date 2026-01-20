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

    // Generate unique test email with proper format
    const timestamp = Date.now()
    const testEmail = `test.user.${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    console.log(`📧 Test Email: ${testEmail}`)
    console.log(`🔐 Test Password: ${testPassword}`)
    console.log('')

    // Attempt signup
    console.log('🚀 Attempting signup...')
    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            emailRedirectTo: `${supabaseUrl}/auth/callback`
        }
    })

    if (error) {
        console.log('❌ SIGNUP FAILED')
        console.log('='.repeat(60))
        console.log('Error Details:')
        console.log(`  Code: ${error.status || 'N/A'}`)
        console.log(`  Message: ${error.message}`)
        console.log(`  Name: ${error.name}`)
        console.log('='.repeat(60))

        // If user was created despite error, check database
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

        console.log('')
        console.log('💡 Troubleshooting Tips:')
        console.log('  1. Check Supabase Dashboard → Authentication → Providers')
        console.log('  2. Ensure Email provider is enabled')
        console.log('  3. Check if email confirmation is required')
        console.log('  4. Verify Site URL is configured')
        console.log('  5. Check if database migrations are applied')

        process.exit(1)
    }

    console.log('✅ SIGNUP SUCCESSFUL')
    console.log('='.repeat(60))
    console.log(`User ID: ${data.user?.id}`)
    console.log(`Email: ${data.user?.email}`)
    console.log(`Email Confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`)
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
        console.log('⚠️  This means the trigger is not working correctly')
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
        console.log('⚠️  This means the trigger is not working correctly')
        process.exit(1)
    }

    console.log('✅ Gamification stats created successfully')
    console.log(`   User ID: ${stats.user_id}`)
    console.log(`   Level: ${stats.level}`)
    console.log(`   Total XP: ${stats.total_xp}`)
    console.log(`   Current Streak: ${stats.current_streak}`)
    console.log('')

    // Test login (only if email is confirmed or confirmation not required)
    console.log('🔐 Testing login with new user...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    })

    if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
            console.log('⚠️  Email confirmation required - this is expected')
            console.log('   In production, user would confirm via email')
        } else {
            console.log(`❌ Login failed: ${loginError.message}`)
            process.exit(1)
        }
    } else {
        console.log('✅ Login successful')
        console.log(`   Session: ${loginData.session ? 'Active' : 'None'}`)
    }
    console.log('')

    console.log('='.repeat(60))
    console.log('🎉 ALL CRITICAL TESTS PASSED')
    console.log('='.repeat(60))
    console.log('')
    console.log('✅ Signup works')
    console.log('✅ Trigger creates profile automatically')
    console.log('✅ Trigger creates gamification stats automatically')
    console.log('')
    console.log('Signup pipeline is fully operational!')

    process.exit(0)
}

testSignup().catch((error) => {
    console.error('\n💥 Test crashed:', error.message)
    console.error(error.stack)
    process.exit(1)
})
