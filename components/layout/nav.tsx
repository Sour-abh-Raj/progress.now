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
    Menu,
    X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return (
        <>
            {/* Desktop & Tablet Navigation */}
            <nav className="border-b bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <Link href="/dashboard" className="text-xl font-bold">
                                    progress.now
                                </Link>
                            </div>
                            {/* Desktop Navigation */}
                            <div className="hidden md:ml-8 md:flex md:space-x-8">
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
                        <div className="flex items-center gap-2 sm:gap-4">
                            <ThemeToggle />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="hidden sm:inline-flex"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="sr-only">Logout</span>
                            </Button>
                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Slide-Down Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t">
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={closeMobileMenu}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors min-h-[44px] ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                            <button
                                onClick={() => {
                                    closeMobileMenu()
                                    handleLogout()
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
                            >
                                <LogOut className="h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden safe-area-bottom">
                <div className="grid grid-cols-5 h-16">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}
        </>
    )
}
