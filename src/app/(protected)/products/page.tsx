'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Plus, Package, CheckCircle2, Clock, AlertCircle, Grid } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createColumns } from '@/components/products/columns';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { AnalyticsCard, AnalyticsCardProps } from '@/components/ui/analytics-card';
import DeleteDialog from '@/components/shared/DeleteDialog';
import toast from 'react-hot-toast';
import { getToken } from '@/lib/get-token';

interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalCategories: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics>({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found');
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/analytics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        }
      );

      if (response.status === 401) {
        console.error('Unauthorized access');
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to fetch analytics');
    }
  };

  const fetchProducts = async (pageNum: number, status: string, search?: string) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        console.error('No token found');
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(status !== 'all' && { status: status.toUpperCase() }),
        ...(search && { search }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (response.status === 401) {
        console.error('Unauthorized access');
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchProducts(page, statusFilter, searchQuery);
  }, [page, statusFilter, searchQuery]);

  const handleDelete = async (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      fetchProducts(page, statusFilter, searchQuery);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (productId: string) => {
    router.push(`/products/${productId}/edit`);
  };

  const handleAddNew = () => {
    router.push('/products/new');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    getStatusBadgeClass,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Products"
          description="Manage your products here"
        />
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Products"
          value={analytics.totalProducts}
          icon={Package}
        />
        <AnalyticsCard
          title="Active Products"
          value={analytics.activeProducts}
          icon={CheckCircle2}
          className="text-green-600"
        />
        <AnalyticsCard
          title="Draft Products"
          value={analytics.draftProducts}
          icon={Clock}
          className="text-yellow-600"
        />
        <AnalyticsCard
          title="Categories"
          value={analytics.totalCategories}
          icon={Grid}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-4">
          <DataTable
            columns={columns}
            data={products}
            searchKey="name"
            searchPlaceholder="Search products..."
            filterComponent={
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            }
            loading={loading}
            pagination={{
              page,
              pageSize: 10,
              total: totalItems,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => selectedProduct && onDelete(selectedProduct.id)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
