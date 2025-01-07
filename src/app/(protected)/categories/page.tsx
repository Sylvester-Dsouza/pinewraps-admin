'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { getToken } from '@/lib/get-token';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryForm } from '@/components/categories/CategoryForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId: string | null;
  parent?: Category;
  children?: Category[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      console.log('API Response:', data); // Debug log

      // Check the structure of the response and extract categories array
      const categoriesArray = Array.isArray(data) ? data : 
                            data.categories && Array.isArray(data.categories) ? data.categories :
                            [];
      
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${selectedCategory.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <Heading title="Categories" description="Manage product categories" />
        <Button onClick={() => {
          setSelectedCategory(null);
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>
      <Separator className="my-4" />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(categories) && categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                {category.parent && (
                  <p className="text-sm text-muted-foreground">
                    Parent: {category.parent.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description || 'No description available'}
              </p>
              <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
                <span>Added {new Date(category.createdAt).toLocaleDateString()}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  {category.productCount} products
                </span>
              </div>
              {category.children && category.children.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Subcategories:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {category.children.map((child) => (
                      <span key={child.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {child.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {Array.isArray(categories) && categories.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No categories found</p>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={selectedCategory || undefined}
            categories={categories.filter(c => c.id !== selectedCategory?.id)}
            onSuccess={() => {
              setIsFormOpen(false);
              fetchCategories();
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category &quot;{selectedCategory?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
