"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AppSidebar } from "@/components/app-sidebar"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutSkeleton } from '@/components/layout-skeleton'

export default function AppLayout({
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
  }, [status, router])

  if (status === "loading") {
    return <LayoutSkeleton />
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen min-w-[100vw]">
        {/* Sidebar */}
        <div className="sticky top-0 z-50 h-screen ">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4">
              <SidebarTrigger />
              <div className="flex items-center gap-4">
                <ModeToggle />
                <UserNav user={session?.user} />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 