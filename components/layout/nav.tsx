'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
    LayoutDashboard,
    CheckSquare,
    FolderKanban,
    Lightbulb,
    Settings,
    LogOut,
} from 'lucide-react'
import { toast } from 'sonner'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'TODOs', href: '/dashboard/todos', icon: CheckSquare },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Research', href: '/dashboard/research', icon: Lightbulb },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardNav() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()

        if (error) {
            toast.error('Logout failed', { description: error.message })
        } else {
            toast.success('Logged out successfully')
            router.push('/auth/login')
            router.refresh()
        }
    }

    return (
        <nav className="border-b bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link href="/dashboard" className="text-xl font-bold">
                                Progress Now
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`inline-flex items-center gap-2 border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${isActive
                                                ? 'border-primary text-foreground'
                                                : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            <span className="sr-only">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
