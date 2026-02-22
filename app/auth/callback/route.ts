import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const tokenHash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    const supabase = await createClient()

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(new URL(next, request.url))
        }
    }

    if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
        })

        if (!error) {
            return NextResponse.redirect(new URL(next, request.url))
        }
    }

    return NextResponse.redirect(new URL('/auth/login?error=auth_callback_error', request.url))
}
