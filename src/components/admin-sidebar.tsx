import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboardIcon,
  UsersIcon,
  ActivityIcon,
  Settings2Icon,
  LogOutIcon,
  ShieldIcon
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
      href: '/admin',
      active: pathname === '/admin',
    },
    {
      label: 'Users',
      icon: UsersIcon,
      href: '/admin/users',
      active: pathname === '/admin/users',
    },
    {
      label: 'Activity',
      icon: ActivityIcon,
      href: '/admin/activity',
      active: pathname === '/admin/activity',
    },
    {
      label: 'Permissions',
      icon: ShieldIcon,
      href: '/admin/permissions',
      active: pathname === '/admin/permissions',
    },
    {
      label: 'Settings',
      icon: Settings2Icon,
      href: '/admin/settings',
      active: pathname === '/admin/settings',
    },
  ]

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            Admin Panel
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100"
              onClick={() => signOut()}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 