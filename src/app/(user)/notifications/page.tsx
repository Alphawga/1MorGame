'use client'

import { trpc } from '@/app/_providers/trpc-provider'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsPage() {
  const { data: notifications, isLoading } = trpc.user.getNotifications.useQuery()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notifications?.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.is_read ? 'bg-muted' : 'bg-card'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm">{notification.type}</span>
                </div>
              </div>
            ))}
            {(!notifications || notifications.length === 0) && (
              <p className="text-muted-foreground text-center py-8">
                No notifications to display
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 