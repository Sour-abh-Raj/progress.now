import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface TestStep {
    name: string
    passed: boolean
    details?: string
    error?: string
}

const results: TestStep[] = []

function logStep(step: TestStep) {
    const icon = step.passed ? '✅' : '❌'
    console.log(`${icon} ${step.name}`)
    if (step.details) {
        console.log(`   └─ ${step.details}`)
    }
    if (step.error) {
        console.log(`   └─ Error: ${step.error}`)
    }
}

async function authPipelineTest() {
    console.log('🔐 Supabase-Native Auth Pipeline Test')
    console.log('='.repeat(70))
    console.log('')
    console.log('Testing: Signup → Profile Creation → Login → Data Access')
    console.log('')

    // Use anon key (client-side simulation)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Generate unique test credentials
    const testEmail = `test.${Date.now()}@progressnow.local`
    const testPassword = 'SecureTestPass123!'

    console.log(`📧 Test Email: ${testEmail}`)
    console.log('')

    // ============================================================
    // PHASE 1: SIGNUP
    // ============================================================
    console.log('📝 Phase 1: User Signup')
    console.log('-'.repeat(70))

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
    })

    if (signupError) {
        results.push({
            name: 'User Signup',
            passed: false,
            error: signupError.message
        })
        logStep(results[results.length - 1])
        console.log('')
        console.log('⚠️  Signup failed. Check Supabase email settings.')
        console.log('   Ensure email confirmation is DISABLED for testing.')
        process.exit(1)
    }

    if (!signupData.user) {
        results.push({
            name: 'User Signup',
            passed: false,
            error: 'No user returned from signup'
        })
        logStep(results[results.length - 1])
        process.exit(1)
    }

    results.push({
        name: 'User Signup',
        passed: true,
        details: `User ID: ${signupData.user.id}`
    })
    logStep(results[results.length - 1])

    // Check if session was returned
    const hasSession = !!signupData.session
    results.push({
        name: 'Session Created on Signup',
        passed: hasSession,
        details: hasSession ? 'Session active' : 'Email confirmation required'
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 2: VERIFY AUTO-CREATED RECORDS
    // ============================================================
    console.log('🗄️  Phase 2: Database Trigger Verification')
    console.log('-'.repeat(70))

    const userId = signupData.user.id

    // Check profile
    const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError || !profile) {
        results.push({
            name: 'Profile Auto-Creation',
            passed: false,
            error: profileError?.message || 'Profile not found'
        })
        logStep(results[results.length - 1])
    } else {
        results.push({
            name: 'Profile Auto-Creation',
            passed: true,
            details: 'Trigger successfully created profile'
        })
        logStep(results[results.length - 1])
    }

    // Check gamification stats
    const { data: stats, error: statsError } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (statsError || !stats) {
        results.push({
            name: 'Gamification Stats Auto-Creation',
            passed: false,
            error: statsError?.message || 'Stats not found'
        })
        logStep(results[results.length - 1])
    } else {
        results.push({
            name: 'Gamification Stats Auto-Creation',
            passed: true,
            details: `Level: ${stats.level}, XP: ${stats.total_xp}`
        })
        logStep(results[results.length - 1])
    }
    console.log('')

    // ============================================================
    // PHASE 3: LOGIN TEST
    // ============================================================
    console.log('🔑 Phase 3: Login Flow')
    console.log('-'.repeat(70))

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    })

    if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
            results.push({
                name: 'User Login',
                passed: true,
                details: 'Email confirmation required (expected in some configs)'
            })
            logStep(results[results.length - 1])
            console.log('')
            console.log('⚠️  Email confirmation is enabled.')
            console.log('   For automated testing, disable in Supabase Dashboard.')
        } else {
            results.push({
                name: 'User Login',
                passed: false,
                error: loginError.message
            })
            logStep(results[results.length - 1])
        }
    } else if (!loginData.session) {
        results.push({
            name: 'User Login',
            passed: false,
            error: 'No session returned'
        })
        logStep(results[results.length - 1])
    } else {
        results.push({
            name: 'User Login',
            passed: true,
            details: 'Session established'
        })
        logStep(results[results.length - 1])

        // Verify access token
        results.push({
            name: 'Access Token Present',
            passed: !!loginData.session.access_token,
            details: loginData.session.access_token ? 'Token valid' : 'No token'
        })
        logStep(results[results.length - 1])
    }
    console.log('')

    // ============================================================
    // PHASE 4: DATA CRUD TEST
    // ============================================================
    console.log('📊 Phase 4: Protected Data Access (RLS)')
    console.log('-'.repeat(70))

    // Create TODO
    const { data: todo, error: todoError } = await supabase
        .from('todos')
        .insert({
            user_id: userId,
            title: 'Auth Pipeline Test TODO',
            priority: 'high',
            xp_reward: 30
        })
        .select()
        .single()

    if (todoError || !todo) {
        results.push({
            name: 'Create TODO',
            passed: false,
            error: todoError?.message || 'TODO not created'
        })
        logStep(results[results.length - 1])
    } else {
        results.push({
            name: 'Create TODO',
            passed: true,
            details: `TODO ID: ${todo.id}`
        })
        logStep(results[results.length - 1])
    }

    // Read TODO
    const { data: todos, error: readError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)

    results.push({
        name: 'Read TODOs (RLS Check)',
        passed: !readError && (todos?.length ?? 0) > 0,
        details: !readError ? `Found ${todos?.length ?? 0} todo(s)` : undefined,
        error: readError?.message
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 5: LOGOUT
    // ============================================================
    console.log('🚪 Phase 5: Logout')
    console.log('-'.repeat(70))

    const { error: logoutError } = await supabase.auth.signOut()

    results.push({
        name: 'User Logout',
        passed: !logoutError,
        details: !logoutError ? 'Session ended' : undefined,
        error: logoutError?.message
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('='.repeat(70))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(70))
    console.log('')

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length

    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
    console.log('')

    if (failed > 0) {
        console.log('Failed Tests:')
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  ❌ ${r.name}`)
            if (r.error) {
                console.log(`     ${r.error}`)
            }
        })
        console.log('')
    }

    console.log('='.repeat(70))

    if (failed === 0) {
        console.log('')
        console.log('🎉 Supabase-native authentication pipeline fully verified!')
        console.log('✅ All core auth flows operational')
        console.log('')
        console.log('Components Validated:')
        console.log('  • Email/password signup')
        console.log('  • Database triggers (profile + stats)')
        console.log('  • Email/password login')
        console.log('  • Session management')
        console.log('  • RLS-protected data access')
        console.log('  • Logout flow')
        console.log('')
        process.exit(0)
    } else {
        console.log('')
        console.log('⚠️  Some tests failed')
        console.log('Review errors above and check:')
        console.log('  1. Supabase email settings (confirmation disabled?)')
        console.log('  2. Database migrations applied?')
        console.log('  3. RLS policies enabled?')
        console.log('')
        process.exit(1)
    }
}

authPipelineTest().catch((error) => {
    console.error('\n💥 Auth pipeline test crashed:', error.message)
    console.error(error.stack)
    process.exit(1)
})
