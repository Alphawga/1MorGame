"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminAppSidebar } from "@/components/admin-app-sidebar"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutSkeleton } from '@/components/layout-skeleton'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
    if (status === "authenticated" && 
        session.user.role !== 'ADMIN' && 
        session.user.role !== 'SUPER_ADMIN') {
      router.push('/app')
    }
  }, [status, session, router])

  if (status === "loading") {
    return <LayoutSkeleton />
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen min-w-[100vw]">
        {/* Sidebar */}
        <div className="sticky top-0 z-50 h-screen ">
            <div className="fixed top-0 z-30 h-screen ">
              <AdminAppSidebar />
          </div>
        </div>

        {/* Main Content */}
          <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center gap-4 px-6">
                <SidebarTrigger />
                <div className="ml-auto flex items-center gap-4">
                  <ModeToggle />
                  <UserNav user={session?.user} />
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-6">
              <div className="mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
     
    </SidebarProvider>
  )
}