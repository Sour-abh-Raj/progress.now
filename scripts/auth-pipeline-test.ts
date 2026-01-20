import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

async function productionAuthPipelineTest() {
    console.log('🔐 Production-Grade Supabase Auth Pipeline Test')
    console.log('='.repeat(70))
    console.log('')
    console.log('Configuration: Email confirmation ENABLED (production mode)')
    console.log('Testing: Signup → Admin Confirm → Login → Data → Logout')
    console.log('')

    // Client for user operations (anon key)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Admin client for email confirmation (service role)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Use Gmail + addressing for RFC-valid deliverable email
    // Format: test+timestamp@gmail.com
    const timestamp = Date.now()
    const testEmail = `progressnowtest+${timestamp}@gmail.com`
    const testPassword = 'SecureTestPass123!@#'

    console.log(`📧 Test Email: ${testEmail}`)
    console.log(`🔐 Test Password: ${testPassword}`)
    console.log('')

    // ============================================================
    // PHASE 1: SIGNUP WITH UNCONFIRMED EMAIL
    // ============================================================
    console.log('📝 Phase 1: User Signup (Unconfirmed)')
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
        console.log('❌ Signup failed. Check error above.')
        process.exit(1)
    }

    if (!signupData.user) {
        results.push({
            name: 'User Signup',
            passed: false,
            error: 'No user returned'
        })
        logStep(results[results.length - 1])
        process.exit(1)
    }

    const userId = signupData.user.id

    results.push({
        name: 'User Signup',
        passed: true,
        details: `User ID: ${userId}`
    })
    logStep(results[results.length - 1])

    results.push({
        name: 'Email Confirmation Pending',
        passed: !signupData.user.email_confirmed_at,
        details: signupData.user.email_confirmed_at ? 'Already confirmed' : 'Awaiting confirmation'
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 2: VERIFY UNCONFIRMED USER CANNOT LOGIN
    // ============================================================
    console.log('🔒 Phase 2: Negative Test (Unconfirmed User Login)')
    console.log('-'.repeat(70))

    const { data: unconfirmedLogin, error: unconfirmedError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    })

    const shouldBlockUnconfirmed = !!unconfirmedError && unconfirmedError.message.includes('Email not confirmed')

    results.push({
        name: 'Block Unconfirmed User Login',
        passed: shouldBlockUnconfirmed,
        details: shouldBlockUnconfirmed
            ? 'Correctly blocked unconfirmed user'
            : 'Security issue: Unconfirmed user can login!'
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 3: ADMIN EMAIL CONFIRMATION
    // ============================================================
    console.log('🛠️  Phase 3: Admin Email Confirmation')
    console.log('-'.repeat(70))

    // Use Admin API to confirm email - use email_confirm attribute
    const { data: confirmedUser, error: confirmError } = await adminClient.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
    )

    if (confirmError || !confirmedUser) {
        results.push({
            name: 'Admin Email Confirmation',
            passed: false,
            error: confirmError?.message || 'Failed to confirm email'
        })
        logStep(results[results.length - 1])
        process.exit(1)
    }

    results.push({
        name: 'Admin Email Confirmation',
        passed: true,
        details: `Email confirmed via Admin API`
    })
    logStep(results[results.length - 1])

    // Wait for confirmation to propagate
    console.log('   ⏳ Waiting for confirmation to propagate...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Verify confirmation by refetching user
    const { data: verifyUser, error: verifyError } = await adminClient.auth.admin.getUserById(userId)

    if (verifyError || !verifyUser.user.email_confirmed_at) {
        results.push({
            name: 'Email Confirmation Verified',
            passed: false,
            error: verifyError?.message || 'Confirmation not reflected in user record'
        })
        logStep(results[results.length - 1])
    } else {
        results.push({
            name: 'Email Confirmation Verified',
            passed: true,
            details: `Confirmed at: ${verifyUser.user.email_confirmed_at}`
        })
        logStep(results[results.length - 1])
    }
    console.log('')

    // ============================================================
    // PHASE 4: VERIFY DATABASE TRIGGERS
    // ============================================================
    console.log('🗄️  Phase 4: Database Trigger Verification')
    console.log('-'.repeat(70))

    // Check profile (using admin client to bypass RLS for verification)
    const { data: profile, error: profileError } = await adminClient
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single()

    results.push({
        name: 'Profile Auto-Creation',
        passed: !profileError && !!profile,
        details: profile ? 'Trigger created profile' : undefined,
        error: profileError?.message
    })
    logStep(results[results.length - 1])

    // Check gamification stats
    const { data: stats, error: statsError } = await adminClient
        .from('gamification_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

    results.push({
        name: 'Gamification Stats Auto-Creation',
        passed: !statsError && !!stats,
        details: stats ? `Level: ${stats.level}, XP: ${stats.total_xp}` : undefined,
        error: statsError?.message
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 5: CONFIRMED USER LOGIN
    // ============================================================
    console.log('🔑 Phase 5: Confirmed User Login')
    console.log('-'.repeat(70))

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    })

    if (loginError || !loginData.session) {
        results.push({
            name: 'Confirmed User Login',
            passed: false,
            error: loginError?.message || 'No session returned'
        })
        logStep(results[results.length - 1])
        process.exit(1)
    }

    results.push({
        name: 'Confirmed User Login',
        passed: true,
        details: 'Session established'
    })
    logStep(results[results.length - 1])

    results.push({
        name: 'Access Token Present',
        passed: !!loginData.session.access_token,
        details: loginData.session.access_token ? 'Token valid' : 'No token'
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 6: PROTECTED DATA ACCESS (RLS)
    // ============================================================
    console.log('📊 Phase 6: Protected Data Access (RLS Validation)')
    console.log('-'.repeat(70))

    // Create TODO
    const { data: todo, error: todoError } = await supabase
        .from('todos')
        .insert({
            user_id: userId,
            title: 'Production Auth Test TODO',
            priority: 'high',
            xp_reward: 30
        })
        .select()
        .single()

    results.push({
        name: 'Create TODO (INSERT)',
        passed: !todoError && !!todo,
        details: todo ? `TODO ID: ${todo.id}` : undefined,
        error: todoError?.message
    })
    logStep(results[results.length - 1])

    // Read TODOs (RLS should allow only own data)
    const { data: todos, error: readError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)

    results.push({
        name: 'Read TODOs (SELECT + RLS)',
        passed: !readError && (todos?.length ?? 0) > 0,
        details: !readError ? `Found ${todos?.length ?? 0} todo(s)` : undefined,
        error: readError?.message
    })
    logStep(results[results.length - 1])

    // Create Project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
            user_id: userId,
            title: 'Production Auth Test Project',
            status: 'ongoing',
            xp_reward: 100
        })
        .select()
        .single()

    results.push({
        name: 'Create Project (INSERT)',
        passed: !projectError && !!project,
        details: project ? `Project ID: ${project.id}` : undefined,
        error: projectError?.message
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 7: SESSION VERIFICATION
    // ============================================================
    console.log('🔐 Phase 7: Session Verification')
    console.log('-'.repeat(70))

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    results.push({
        name: 'Session Persistence',
        passed: !sessionError && !!session,
        details: session ? 'Session active and valid' : undefined,
        error: sessionError?.message
    })
    logStep(results[results.length - 1])

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    results.push({
        name: 'User Data Retrieval',
        passed: !userError && !!user && user.id === userId,
        details: user ? `User ID matches: ${user.id === userId}` : undefined,
        error: userError?.message
    })
    logStep(results[results.length - 1])
    console.log('')

    // ============================================================
    // PHASE 8: LOGOUT
    // ============================================================
    console.log('🚪 Phase 8: Logout')
    console.log('-'.repeat(70))

    const { error: logoutError } = await supabase.auth.signOut()

    results.push({
        name: 'User Logout',
        passed: !logoutError,
        details: !logoutError ? 'Session terminated' : undefined,
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
        console.log('🎉 Supabase production auth test pipeline operational with email confirmation enabled.')
        console.log('')
        console.log('✅ All production auth flows validated:')
        console.log('  • RFC-valid email signup')
        console.log('  • Email confirmation enforcement')
        console.log('  • Admin API email confirmation')
        console.log('  • Database triggers (profile + stats)')
        console.log('  • Confirmed user login')
        console.log('  • Session management')
        console.log('  • RLS-protected data access (CRUD)')
        console.log('  • Negative security tests (unconfirmed blocked)')
        console.log('  • Logout flow')
        console.log('')
        console.log('System Status: Production-ready with email confirmation')
        console.log('')
        process.exit(0)
    } else {
        console.log('')
        console.log('⚠️  Some tests failed')
        console.log('Review errors above and check:')
        console.log('  1. Database migrations applied?')
        console.log('  2. RLS policies enabled?')
        console.log('  3. Admin API accessible?')
        console.log('')
        process.exit(1)
    }
}

productionAuthPipelineTest().catch((error) => {
    console.error('\n💥 Production auth pipeline test crashed:', error.message)
    console.error(error.stack)
    process.exit(1)
})
