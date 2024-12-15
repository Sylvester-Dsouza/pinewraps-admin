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

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Products', href: '/products', icon: Package2 },
  { name: 'Orders', href: '/orders', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Admins', href: '/admins', icon: Shield },
  { name: 'Rewards', href: '/rewards', icon: Gift },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = useCallback((href: string) => {
    // Use the full href without cleaning it
    const currentPath = pathname
    
    // Only navigate if we're not already on the page
    if (currentPath !== href) {
      router.push(href, { scroll: false })
    }
  }, [pathname, router])

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
        {navigation.map((item) => {
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
