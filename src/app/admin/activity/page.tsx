'use client'

import { trpc } from '@/app/_providers/trpc-provider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ActivityPage() {
  const { data: logs, isLoading } = trpc.admin.getActivityLogs.useQuery({
    page: 1,
    limit: 20
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.data.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.type}</TableCell>
              <TableCell>{log.admin.name}</TableCell>
              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 