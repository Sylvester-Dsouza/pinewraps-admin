'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/products/ProductForm';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Loader2 } from 'lucide-react';
import { getToken } from '@/lib/get-token';
import { toast } from '@/components/ui/use-toast';

interface EditProductClientProps {
  productId: string;
}

export default function EditProductClient({ productId }: EditProductClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in again",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('Using API URL:', API_URL);

      // Fetch product and categories in parallel
      const [productResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/api/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          cache: 'no-cache',
        }),
        fetch(`${API_URL}/api/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          cache: 'no-cache',
        }),
      ]);

      if (!productResponse.ok || !categoriesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const productData = await productResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!productData.success) {
        throw new Error(productData.error || 'Failed to fetch product data');
      }

      if (!categoriesData.success || !Array.isArray(categoriesData.data?.categories)) {
        throw new Error('Invalid categories data format');
      }

      // Get the product from the response
      const product = productData.data;
      if (!product) {
        throw new Error('Product data not found');
      }

      console.log('Fetched product:', product);
      console.log('Fetched categories:', categoriesData.data.categories);

      // Format the product data
      const formattedProduct = {
        ...product,
        variations: product.variations || [],
        variantCombinations: typeof product.variantCombinations === 'string' 
          ? JSON.parse(product.variantCombinations || '[]')
          : product.variantCombinations || []
      };

      setProduct(formattedProduct);
      setCategories(categoriesData.data.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      });
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const handleSubmit = async (formData: FormData) => {
    try {
      setSubmitting(true);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Convert FormData to JSON for better control
      const formObject: Record<string, any> = {};
      const jsonFields = ['variations', 'combinations', 'deletedImages'];
      
      // Debug: Log all form data entries
      console.log('Form data entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Handle new image uploads first if there are any
      const imageFiles = formData.getAll('images') as File[];
      let newImageUrls: string[] = [];
      
      if (imageFiles.length > 0 && imageFiles.some(file => file instanceof File)) {
        const imageFormData = new FormData();
        let validFiles = false;

        imageFiles.forEach((file, index) => {
          if (file instanceof File) {
            validFiles = true;
            console.log(`Processing file ${index + 1}:`, {
              name: file.name,
              type: file.type,
              size: file.size
            });
            imageFormData.append('images', file);
          }
        });

        if (!validFiles) {
          console.error('No valid files found in form data');
          throw new Error('No valid files selected');
        }

        console.log('Uploading images to:', `${API_URL}/api/products/${productId}/media`);
        const uploadResponse = await fetch(`${API_URL}/api/products/${productId}/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });

        const responseText = await uploadResponse.text();
        console.log('Raw response:', responseText);

        if (!uploadResponse.ok) {
          let errorMessage = 'Failed to upload images';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }

          if (uploadResponse.status === 401) {
            toast({
              title: "Authentication Error",
              description: "Please log in again",
              variant: "destructive",
            });
            router.push('/login');
            return;
          }
          throw new Error(errorMessage);
        }

        try {
          const uploadResult = JSON.parse(responseText);
          if (uploadResult.data) {
            newImageUrls = uploadResult.data.map((img: any) => img.url);
            console.log('Received image URLs:', newImageUrls);
          }
        } catch (e) {
          console.error('Error parsing success response:', e);
          throw new Error('Invalid response format from server');
        }
      }

      // Process form data
      for (const [key, value] of formData.entries()) {
        if (key === 'basePrice') {
          formObject[key] = parseInt(value as string, 10);
        } else if (key === 'images') {
          // Skip file uploads as we've handled them separately
          continue;
        } else if (jsonFields.includes(key)) {
          try {
            const parsedValue = JSON.parse(value as string);
            // Only include non-empty arrays
            if (Array.isArray(parsedValue) && parsedValue.length > 0) {
              if (key === 'combinations') {
                // Ensure each combination has the required fields
                formObject[key] = parsedValue.map(combo => ({
                  size: combo.size || '',
                  flavour: combo.flavour || '',
                  price: parseFloat(combo.price) || 0
                }));
              } else {
                formObject[key] = parsedValue;
              }
            }
          } catch (e) {
            console.error(`Error parsing ${key}:`, e);
            if (key === 'combinations') {
              formObject[key] = []; // Default to empty array if parsing fails
            }
          }
        } else if (key === 'existingImages') {
          try {
            const images = JSON.parse(value as string);
            if (Array.isArray(images)) {
              // Convert image objects to URLs and combine with new image URLs
              const existingUrls = images.map(img => img.url);
              formObject[key] = [...existingUrls, ...newImageUrls];
            }
          } catch (e) {
            console.error('Error parsing existingImages:', e);
          }
        } else {
          formObject[key] = value;
        }
      }

      // Debug: Log the final form object
      console.log('Form object to be sent:', formObject);

      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          requestBody: formObject
        });
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in again",
            variant: "destructive",
          });
          router.push('/login');
          return;
        }
        throw new Error(errorData.error || 'Failed to update product');
      }

      const data = await response.json();
      
      toast({
        title: "Product updated!",
        description: "Your changes have been saved successfully.",
      });

      router.push('/products');
      router.refresh();
    } catch (error) {
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!product || !categories.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-gray-900">
          Product not found or no categories available
        </p>
        <button
          onClick={() => router.push('/products')}
          className="mt-4 text-sm text-blue-600 hover:text-blue-500"
        >
          Return to products
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Edit Product: {product.name}
      </h1>
      <ProductForm
        initialData={product}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/products')}
        loading={submitting}
        submitLabel="Update Product"
      />
    </div>
  );
}
