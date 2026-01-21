'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
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
import { useState, useCallback } from 'react'
import { prefetchTodos, TODOS_QUERY_KEY } from '@/lib/hooks/use-todos'
import { prefetchProjects, PROJECTS_QUERY_KEY } from '@/lib/hooks/use-projects'
import { prefetchResearch, RESEARCH_QUERY_KEY } from '@/lib/hooks/use-research'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, queryKey: null },
    { name: 'TODOs', href: '/dashboard/todos', icon: CheckSquare, queryKey: TODOS_QUERY_KEY },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, queryKey: PROJECTS_QUERY_KEY },
    { name: 'Research', href: '/dashboard/research', icon: Lightbulb, queryKey: RESEARCH_QUERY_KEY },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, queryKey: null },
]

export function DashboardNav() {
    const pathname = usePathname()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()

        if (error) {
            toast.error('Logout failed', { description: error.message })
        } else {
            toast.success('Logged out successfully')
            // Clear all cached data on logout
            queryClient.clear()
            router.push('/auth/login')
            router.refresh()
        }
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    // Prefetch data on hover for instant navigation
    const handlePrefetch = useCallback((href: string) => {
        switch (href) {
            case '/dashboard/todos':
                prefetchTodos(queryClient)
                break
            case '/dashboard/projects':
                prefetchProjects(queryClient)
                break
            case '/dashboard/research':
                prefetchResearch(queryClient)
                break
        }
    }, [queryClient])

    return (
        <>
            {/* Desktop Navigation (>=1024px) */}
            <nav className="border-b bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <Link href="/dashboard" className="text-xl font-bold">
                                    progress.now
                                </Link>
                            </div>
                            {/* Desktop Navigation - visible only on lg screens and above */}
                            <div className="hidden lg:ml-8 lg:flex lg:space-x-8">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onMouseEnter={() => handlePrefetch(item.href)}
                                            onFocus={() => handlePrefetch(item.href)}
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
                            {/* Mobile/Tablet Menu Button - visible below lg breakpoint */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden"
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

                {/* Mobile/Tablet Slide-Down Menu - visible below lg breakpoint */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t">
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

            {/* Mobile/Tablet Bottom Navigation - visible below lg breakpoint (<1024px) */}
            <nav 
                className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden safe-area-bottom"
                role="navigation"
                aria-label="Mobile navigation"
            >
                <div className="grid grid-cols-5 h-16">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onTouchStart={() => handlePrefetch(item.href)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground active:text-foreground'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium truncate max-w-full px-1">{item.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Mobile/Tablet Menu Backdrop - visible below lg breakpoint */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}
        </>
    )
}
