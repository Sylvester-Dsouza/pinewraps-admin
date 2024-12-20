'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CategoryType } from '@/types/category';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { getToken } from '@/lib/get-token';

interface Category {
  id: string;
  name: string;
  description: string;
  type: CategoryType;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <Heading title="Categories" description="View all product categories" />
        <Separator className="my-4" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                {category.productCount} products
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description || 'No description available'}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Added {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No categories found</p>
        </div>
      )}
    </div>
  );
}
