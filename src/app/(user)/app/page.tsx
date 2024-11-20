'use client'

import { trpc } from '@/app/_providers/trpc-provider'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from 'next-auth/react'

export default function AppDashboard() {
  const { data: session } = useSession()
  const { data: notifications } = trpc.user.getNotifications.useQuery()

  return (
    <div className="">
      <h2 className="text-3xl font-bold tracking-tight">
        Welcome back, {session?.user?.name}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{session?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span>{session?.user?.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications?.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm">{notification.type}</span>
                </div>
              ))}
              {(!notifications || notifications.length === 0) && (
                <p className="text-muted-foreground">No recent notifications</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 