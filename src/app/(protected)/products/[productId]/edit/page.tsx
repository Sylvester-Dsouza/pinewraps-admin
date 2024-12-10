import React from 'react';
import EditProductClient from '@/components/products/EditProductClient';

interface EditProductPageProps {
  params: {
    productId: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await Promise.resolve(params);
  return <EditProductClient productId={productId} />;
}
