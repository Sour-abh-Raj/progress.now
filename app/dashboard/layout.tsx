import { DashboardNav } from '@/components/layout/nav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <DashboardNav />
            {/* Add bottom padding on mobile/tablet (<1024px) to account for bottom nav */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8">
                {children}
            </main>
        </div>
    )
}
