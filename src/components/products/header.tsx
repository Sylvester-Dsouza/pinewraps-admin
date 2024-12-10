'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Header() {
  return (
    <div className="bg-white border-b border-[#e1e3e5]">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-medium text-[#1a1a1a]">Products</h1>
          <p className="text-sm text-[#637381]">Manage your products</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products/new">
            <Button className="bg-[#2c6ecb] hover:bg-[#1f5296] text-white font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
