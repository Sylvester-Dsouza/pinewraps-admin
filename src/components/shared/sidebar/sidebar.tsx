'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  Package2,
  Gift,
  Ticket,
  Shield,
  Settings,
  Bell,
  HelpCircle,
} from 'lucide-react'
import { useAdmin } from '@/hooks/use-admin'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, permission: 'DASHBOARD' as const },
  { name: 'Products', href: '/products', icon: Package2, permission: 'PRODUCTS' as const },
  { name: 'Orders', href: '/orders', icon: Package, permission: 'ORDERS' as const },
  { name: 'Customers', href: '/customers', icon: Users, permission: 'CUSTOMERS' as const },
  { name: 'Admins', href: '/admins', icon: Shield, permission: 'ADMIN' as const },
  { name: 'Rewards', href: '/rewards', icon: Gift, permission: 'REWARDS' as const },
  { name: 'Coupons', href: '/coupons', icon: Ticket, permission: 'COUPONS' as const },
  { name: 'Settings', href: '/settings', icon: Settings, permission: 'SETTINGS' as const },
  { name: 'Notifications', href: '/notifications', icon: Bell, permission: 'NOTIFICATIONS' as const },
  { name: 'Help', href: '/help', icon: HelpCircle, permission: 'HELP' as const },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { hasPermission, isSuperAdmin, loading } = useAdmin()

  const handleNavigation = useCallback((href: string) => {
    const currentPath = pathname
    if (currentPath !== href) {
      router.push(href, { scroll: false })
    }
  }, [pathname, router])

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-white border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
          <span className="text-lg font-semibold text-gray-900">Loading...</span>
        </div>
      </div>
    )
  }

  const filteredNavigation = navigation.filter(item => 
    isSuperAdmin || hasPermission(item.permission)
  )

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
        <div 
          onClick={(e) => {
            e.preventDefault()
            handleNavigation('/dashboard')
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-lg font-semibold text-gray-900">Pinewraps Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href

          return (
            <div
              key={item.name}
              onClick={(e) => {
                e.preventDefault()
                handleNavigation(item.href)
              }}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer mb-1',
                isActive
                  ? 'bg-gray-50 text-primary'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-primary'
                    : 'text-gray-400 group-hover:text-primary'
                )}
                aria-hidden="true"
              />
              {item.name}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
