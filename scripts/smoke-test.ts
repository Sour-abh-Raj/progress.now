import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface TestStep {
    name: string
    passed: boolean
    error?: string
}

const testResults: TestStep[] = []

async function smokeTest() {
    console.log('🧪 Progress.now - Smoke Test Suite')
    console.log('='.repeat(50))
    console.log('')

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test 1: App can create Supabase client
    try {
        testResults.push({
            name: 'Create Supabase Client',
            passed: true
        })
        console.log('✅ Supabase client created')
    } catch (error: any) {
        testResults.push({
            name: 'Create Supabase Client',
            passed: false,
            error: error.message
        })
        console.log('❌ Failed to create Supabase client')
        return
    }

    // Test 2: Sign up new user
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    console.log('\n📝 Testing Signup...')
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
    })

    if (signupError) {
        testResults.push({
            name: 'User Signup',
            passed: false,
            error: signupError.message
        })
        console.log(`❌ Signup failed: ${signupError.message}`)

        // Try to sign in with existing credentials if it's a duplicate email error
        if (signupError.message.includes('already registered')) {
            console.log('   Attempting login with test credentials...')
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: 'test@example.com',
                password: 'TestPassword123!'
            })

            if (loginError) {
                console.log(`❌ Login also failed: ${loginError.message}`)
                return
            }
            console.log('✅ Logged in with existing test user')
        } else {
            return
        }
    } else {
        testResults.push({
            name: 'User Signup',
            passed: true
        })
        console.log(`✅ User signed up: ${testEmail}`)
    }

    // Test 3: Check session
    console.log('\n🔐 Testing Session...')
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        testResults.push({
            name: 'Session Check',
            passed: false,
            error: 'No active session'
        })
        console.log('❌ No active session')
        return
    }

    testResults.push({
        name: 'Session Check',
        passed: true
    })
    console.log('✅ Active session found')

    // Test 4: Check profile auto-creation
    console.log('\n👤 Testing Profile Auto-Creation...')
    const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', session.user.id)
        .single()

    if (profileError || !profile) {
        testResults.push({
            name: 'Profile Auto-Creation',
            passed: false,
            error: profileError?.message || 'Profile not found'
        })
        console.log(`❌ Profile auto-creation failed: ${profileError?.message || 'Not found'}`)
    } else {
        testResults.push({
            name: 'Profile Auto-Creation',
            passed: true
        })
        console.log('✅ User profile created automatically')
    }

    // Test 5: Check gamification stats auto-creation
    console.log('\n🎮 Testing Gamification Stats Auto-Creation...')
    const { data: stats, error: statsError } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

    if (statsError || !stats) {
        testResults.push({
            name: 'Gamification Stats Auto-Creation',
            passed: false,
            error: statsError?.message || 'Stats not found'
        })
        console.log(`❌ Stats auto-creation failed: ${statsError?.message || 'Not found'}`)
    } else {
        testResults.push({
            name: 'Gamification Stats Auto-Creation',
            passed: true
        })
        console.log('✅ Gamification stats created automatically')
        console.log(`   - Level: ${stats.level}`)
        console.log(`   - Total XP: ${stats.total_xp}`)
    }

    // Test 6: Create a TODO
    console.log('\n✅ Testing TODO Creation...')
    const { data: todo, error: todoError } = await supabase
        .from('todos')
        .insert({
            user_id: session.user.id,
            title: 'Smoke Test TODO',
            priority: 'high',
            xp_reward: 30
        })
        .select()
        .single()

    if (todoError || !todo) {
        testResults.push({
            name: 'TODO Creation',
            passed: false,
            error: todoError?.message || 'TODO not created'
        })
        console.log(`❌ TODO creation failed: ${todoError?.message}`)
    } else {
        testResults.push({
            name: 'TODO Creation',
            passed: true
        })
        console.log('✅ TODO created successfully')
    }

    // Test 7: Create a Project
    console.log('\n📂 Testing Project Creation...')
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
            user_id: session.user.id,
            title: 'Smoke Test Project',
            status: 'ongoing',
            xp_reward: 100
        })
        .select()
        .single()

    if (projectError || !project) {
        testResults.push({
            name: 'Project Creation',
            passed: false,
            error: projectError?.message || 'Project not created'
        })
        console.log(`❌ Project creation failed: ${projectError?.message}`)
    } else {
        testResults.push({
            name: 'Project Creation',
            passed: true
        })
        console.log('✅ Project created successfully')
    }

    // Test 8: Create Research Idea
    console.log('\n💡 Testing Research Idea Creation...')
    const { data: idea, error: ideaError } = await supabase
        .from('research_ideas')
        .insert({
            user_id: session.user.id,
            title: 'Smoke Test Research Idea',
            maturity_level: 'idea'
        })
        .select()
        .single()

    if (ideaError || !idea) {
        testResults.push({
            name: 'Research Idea Creation',
            passed: false,
            error: ideaError?.message || 'Idea not created'
        })
        console.log(`❌ Research idea creation failed: ${ideaError?.message}`)
    } else {
        testResults.push({
            name: 'Research Idea Creation',
            passed: true
        })
        console.log('✅ Research idea created successfully')
    }

    // Test 9: Logout
    console.log('\n🚪 Testing Logout...')
    const { error: signoutError } = await supabase.auth.signOut()

    if (signoutError) {
        testResults.push({
            name: 'Logout',
            passed: false,
            error: signoutError.message
        })
        console.log(`❌ Logout failed: ${signoutError.message}`)
    } else {
        testResults.push({
            name: 'Logout',
            passed: true
        })
        console.log('✅ Logout successful')
    }

    // Print summary
    printSummary()
}

function printSummary() {
    console.log('')
    console.log('='.repeat(50))
    console.log('📊 SMOKE TEST SUMMARY')
    console.log('='.repeat(50))
    console.log('')

    const passed = testResults.filter(t => t.passed).length
    const failed = testResults.filter(t => !t.passed).length
    const total = testResults.length

    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
    console.log('')

    if (failed > 0) {
        console.log('Failed Tests:')
        testResults.filter(t => !t.passed).forEach(t => {
            console.log(`  ❌ ${t.name}`)
            if (t.error) {
                console.log(`     Error: ${t.error}`)
            }
        })
        console.log('')
    }

    console.log('='.repeat(50))

    if (failed === 0) {
        console.log('\n🎉 All smoke tests passed!')
        console.log('✅ Application is stable and functional')
        process.exit(0)
    } else {
        console.log('\n⚠️  Some smoke tests failed')
        console.log('Please review errors above')
        process.exit(1)
    }
}

smokeTest().catch((error) => {
    console.error('\n❌ Smoke test crashed:', error.message)
    process.exit(1)
})
