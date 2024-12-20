'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { columns } from './columns';
import { customerService, type Customer } from '@/services/customer.service';

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    loadCustomers(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const loadCustomers = async (page: number, search?: string) => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers(page, pagination.pageSize, search);
      
      // Log the response to debug
      console.log('Customer response:', response);
      
      if (response.success && response.data.customers) {
        setCustomers(response.data.customers);
        setPagination({
          page: page,
          pageSize: pagination.pageSize,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        });
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    router.push(`/customers?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (search: string) => {
    const params = new URLSearchParams();
    if (search) {
      params.set('search', search);
    }
    params.set('page', '1'); // Reset to first page on search
    router.push(`/customers?${params.toString()}`);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <Heading
          title={`Customers (${pagination.total})`}
          description="Manage your customers"
        />
        <Button onClick={() => router.push('/customers/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search by name or email..."
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}
