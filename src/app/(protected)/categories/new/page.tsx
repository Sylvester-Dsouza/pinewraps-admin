'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CategoryType } from '@/types/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '' as CategoryType,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      toast.success('Category created successfully')
      router.push('/dashboard/categories')
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e3e5]">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-medium text-[#1a1a1a]">New Category</h1>
            <p className="text-sm text-[#637381]">Create a new product category</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a]">
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#1a1a1a]">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[#1a1a1a]">
                Type
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as CategoryType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-[#2c6ecb] hover:bg-[#1f5296]"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/categories')}
              className="border-[#e1e3e5] text-[#637381] hover:text-[#1a1a1a]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
