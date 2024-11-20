import { Session } from 'next-auth'
import { prisma } from './prisma'
import { ActivityType, NotificationType } from '@prisma/client'

export async function logAdminActivity(
  session: Session | null, 
  action: string, 
  type: ActivityType
) {
  if (!session?.user?.id) return

  await prisma.activityLog.create({
    data: {
      action,
      type,
      admin_id: session.user.id,
    }
  })
}

export async function createSystemNotification(
  message: string,
  userIds?: string[],
  adminIds?: string[]
) {
  const notification = await prisma.notification.create({
    data: {
      message,
      type: NotificationType.SYSTEM,
      users: userIds ? {
        connect: userIds.map(id => ({ id }))
      } : undefined,
      admins: adminIds ? {
        connect: adminIds.map(id => ({ id }))
      } : undefined,
    }
  })

  return notification
}

