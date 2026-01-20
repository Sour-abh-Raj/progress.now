import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface TestResult {
    name: string
    passed: boolean
    message: string
}

const results: TestResult[] = []

async function testAuth() {
    console.log('\n🔐 Testing Authentication...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test 1: Can create client
    results.push({
        name: 'Auth Client Creation',
        passed: true,
        message: 'Supabase client initialized successfully'
    })

    // Test 2: Check if session exists  
    const { data: { session } } = await supabase.auth.getSession()
    results.push({
        name: 'Session Check',
        passed: true,
        message: session ? 'Active session found' : 'No active session (expected for fresh install)'
    })
}

async function testDatabase() {
    console.log('\n🗄️  Testing Database Access...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const tables = ['todos', 'projects', 'research_ideas', 'gamification_stats']

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1)

            if (error) {
                results.push({
                    name: `Database - ${table} table`,
                    passed: false,
                    message: `Error: ${error.message}`
                })
            } else {
                results.push({
                    name: `Database - ${table} table`,
                    passed: true,
                    message: 'Table accessible'
                })
            }
        } catch (err: any) {
            results.push({
                name: `Database - ${table} table`,
                passed: false,
                message: `Exception: ${err.message}`
            })
        }
    }
}

async function testGamificationLogic() {
    console.log('\n🎮 Testing Gamification Logic...')

    // Import gamification functions
    const xpModule = await import('../lib/gamification/xp-calculator')

    // Test XP calculation
    const lowXP = xpModule.calculateTaskXP('low')
    results.push({
        name: 'XP Calculation - Low Priority',
        passed: lowXP === 10,
        message: `Expected 10 XP, got ${lowXP}`
    })

    const mediumXP = xpModule.calculateTaskXP('medium')
    results.push({
        name: 'XP Calculation - Medium Priority',
        passed: mediumXP === 20,
        message: `Expected 20 XP, got ${mediumXP}`
    })

    const highXP = xpModule.calculateTaskXP('high')
    results.push({
        name: 'XP Calculation - High Priority',
        passed: highXP === 30,
        message: `Expected 30 XP, got ${highXP}`
    })

    // Test level calculation
    const level1 = xpModule.calculateLevel(0)
    results.push({
        name: 'Level Calculation - 0 XP',
        passed: level1 === 1,
        message: `Expected level 1, got ${level1}`
    })

    const level2 = xpModule.calculateLevel(400)
    results.push({
        name: 'Level Calculation - 400 XP',
        passed: level2 === 3,
        message: `Expected level 3, got ${level2}`
    })

    // Test project XP
    const projectXP = xpModule.calculateProjectXP({ status: 'completed', xp_reward: 100 })
    results.push({
        name: 'Project XP - Completed',
        passed: projectXP === 150,
        message: `Expected 150 XP (100 + 50 bonus), got ${projectXP}`
    })
}

async function printResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST RESULTS SUMMARY')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length

    console.log(`\n✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)

    // Print detailed results
    for (const result of results) {
        const icon = result.passed ? '✅' : '❌'
        console.log(`${icon} ${result.name}`)
        if (!result.passed || process.env.VERBOSE) {
            console.log(`   └─ ${result.message}`)
        }
    }

    console.log('\n' + '='.repeat(60))

    if (failed > 0) {
        console.log('\n⚠️  Some tests failed. Check details above.')
        console.log('If database tests failed, ensure migrations are applied.')
        process.exit(1)
    } else {
        console.log('\n🎉 All tests passed!')
        process.exit(0)
    }
}

async function main() {
    console.log('🧪 Progress.now - Integration Test Suite')
    console.log('==========================================')

    try {
        await testGamificationLogic()
        await testAuth()
        await testDatabase()
        await printResults()
    } catch (error: any) {
        console.error('\n❌ Test suite failed:', error.message)
        process.exit(1)
    }
}

main()
