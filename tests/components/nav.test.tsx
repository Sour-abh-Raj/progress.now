import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardNav } from '@/components/layout/nav'
import { usePathname } from 'next/navigation'

// Mock next-themes
vi.mock('next-themes', () => ({
    useTheme: vi.fn(() => ({
        theme: 'light',
        setTheme: vi.fn(),
    })),
}))

describe('DashboardNav', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Navigation Items', () => {
        it('renders all navigation items', () => {
            render(<DashboardNav />)
            
            expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
            expect(screen.getAllByText('TODOs').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Projects').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Research').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Settings').length).toBeGreaterThan(0)
        })

        it('renders the app logo/title', () => {
            render(<DashboardNav />)
            
            expect(screen.getByText('progress.now')).toBeInTheDocument()
        })
    })

    describe('Bottom Navigation', () => {
        it('renders bottom navigation with correct aria attributes', () => {
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            expect(bottomNav).toBeInTheDocument()
        })

        it('bottom nav has lg:hidden class for <1024px visibility', () => {
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            expect(bottomNav).toHaveClass('lg:hidden')
        })

        it('bottom nav contains all 5 navigation items', () => {
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const links = bottomNav.querySelectorAll('a')
            expect(links).toHaveLength(5)
        })

        it('bottom nav items have correct hrefs', () => {
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const links = bottomNav.querySelectorAll('a')
            
            const hrefs = Array.from(links).map(link => link.getAttribute('href'))
            expect(hrefs).toContain('/dashboard')
            expect(hrefs).toContain('/dashboard/todos')
            expect(hrefs).toContain('/dashboard/projects')
            expect(hrefs).toContain('/dashboard/research')
            expect(hrefs).toContain('/dashboard/settings')
        })
    })

    describe('Active Route Highlighting', () => {
        it('highlights Dashboard when on /dashboard', () => {
            vi.mocked(usePathname).mockReturnValue('/dashboard')
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const dashboardLink = bottomNav.querySelector('a[href="/dashboard"]')
            
            expect(dashboardLink).toHaveClass('text-primary')
            expect(dashboardLink).toHaveAttribute('aria-current', 'page')
        })

        it('highlights TODOs when on /dashboard/todos', () => {
            vi.mocked(usePathname).mockReturnValue('/dashboard/todos')
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const todosLink = bottomNav.querySelector('a[href="/dashboard/todos"]')
            
            expect(todosLink).toHaveClass('text-primary')
            expect(todosLink).toHaveAttribute('aria-current', 'page')
        })

        it('highlights Projects when on /dashboard/projects', () => {
            vi.mocked(usePathname).mockReturnValue('/dashboard/projects')
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const projectsLink = bottomNav.querySelector('a[href="/dashboard/projects"]')
            
            expect(projectsLink).toHaveClass('text-primary')
            expect(projectsLink).toHaveAttribute('aria-current', 'page')
        })

        it('highlights Research when on /dashboard/research', () => {
            vi.mocked(usePathname).mockReturnValue('/dashboard/research')
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const researchLink = bottomNav.querySelector('a[href="/dashboard/research"]')
            
            expect(researchLink).toHaveClass('text-primary')
            expect(researchLink).toHaveAttribute('aria-current', 'page')
        })

        it('highlights Settings when on /dashboard/settings', () => {
            vi.mocked(usePathname).mockReturnValue('/dashboard/settings')
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const settingsLink = bottomNav.querySelector('a[href="/dashboard/settings"]')
            
            expect(settingsLink).toHaveClass('text-primary')
            expect(settingsLink).toHaveAttribute('aria-current', 'page')
        })

        it('non-active items do not have aria-current', () => {
            vi.mocked(usePathname).mockReturnValue('/dashboard')
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const todosLink = bottomNav.querySelector('a[href="/dashboard/todos"]')
            
            expect(todosLink).not.toHaveAttribute('aria-current')
            expect(todosLink).toHaveClass('text-muted-foreground')
        })
    })

    describe('Touch Friendliness', () => {
        it('bottom nav items have minimum touch target size', () => {
            render(<DashboardNav />)
            
            const bottomNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
            const links = bottomNav.querySelectorAll('a')
            
            links.forEach(link => {
                expect(link).toHaveClass('min-h-[44px]')
            })
        })
    })

    describe('Desktop Navigation', () => {
        it('desktop nav has lg:flex class for >=1024px visibility', () => {
            render(<DashboardNav />)
            
            // Find the desktop navigation container
            const desktopNav = document.querySelector('.lg\\:flex.lg\\:space-x-8')
            expect(desktopNav).toBeInTheDocument()
            expect(desktopNav).toHaveClass('hidden')
        })
    })

    describe('Responsive Breakpoints', () => {
        it('menu button has lg:hidden class', () => {
            render(<DashboardNav />)
            
            const menuButton = screen.getByRole('button', { name: 'Toggle menu' })
            expect(menuButton).toHaveClass('lg:hidden')
        })
    })
})
