import { Skeleton } from "@/components/ui/skeleton"

export function LayoutSkeleton() {
  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {/* Header Skeleton */}
        <header className="border-b">
          <div className="flex h-14 items-center justify-between px-6">
            <Skeleton className="h-8 w-8" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[200px] rounded-lg" />
              <Skeleton className="h-[200px] rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 