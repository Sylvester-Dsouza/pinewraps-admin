import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema for updates
const updateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().nullable().optional(),
  basePrice: z.coerce.number().int().min(0, 'Base price must be positive').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  status: z.enum(['DRAFT', 'ACTIVE'] as const).optional(),
  variations: z.array(z.object({
    type: z.enum(['SIZE', 'FLAVOUR'] as const),
    options: z.array(z.object({
      value: z.string().min(1, 'Option value is required'),
      priceAdjustment: z.coerce.number().default(0),
      stock: z.coerce.number().min(0).default(0)
    }))
  })).optional(),
  combinations: z.union([
    z.array(z.object({
      size: z.string(),
      flavour: z.string(),
      price: z.number(),
      stock: z.number().optional()
    })),
    z.string()
  ]).optional(),
  existingImages: z.array(z.string()).optional(),
  deletedImages: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  // Add SEO fields to the schema
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
}).strict();

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id is properly awaited
    const id = await Promise.resolve(params.id);
    
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { success: false, error: 'API URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/api/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch product from API',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id is properly awaited
    const productId = await Promise.resolve(params.id);
    
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { success: false, error: 'API URL not configured' },
        { status: 500 }
      );
    }

    // Parse and validate the request body
    const rawBody = await request.json();
    console.log('Raw request body:', rawBody);

    // Validate the data
    const validatedData = updateSchema.parse(rawBody);
    console.log('Validated data:', validatedData);

    // Prepare the data for the API
    const apiRequestBody = {
      ...validatedData,
      variations: validatedData.variations?.map(variation => ({
        type: variation.type,
        options: variation.options.map(option => ({
          value: option.value,
          priceAdjustment: Number(option.priceAdjustment),
          stock: Number(option.stock)
        }))
      }))
    };

    console.log('API request body:', apiRequestBody);

    // Make the API request
    const response = await fetch(`${apiUrl}/api/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('API response error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update product in API',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update product'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { success: false, error: 'API URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete product from API',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
