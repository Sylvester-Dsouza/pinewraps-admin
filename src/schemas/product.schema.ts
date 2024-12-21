import { z } from 'zod';
import { ProductStatus, VariationType } from '@/types/product';

// Variant option schema
const variantOptionSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  priceAdjustment: z.number().default(0),
  stock: z.number().min(0, 'Stock must be non-negative').default(0),
});

// Product variant schema
const productVariantSchema = z.object({
  type: z.nativeEnum(VariationType),
  options: z.array(variantOptionSchema),
});

// Variant combination schema
const variantCombinationSchema = z.object({
  size: z.string(),
  flavour: z.string(),
  price: z.number().default(0),
});

// Base product schema for both create and update
export const baseProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  basePrice: z.number().min(0, 'Price must be non-negative'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.nativeEnum(ProductStatus),
  variations: z.array(productVariantSchema).optional(),
  combinations: z.array(variantCombinationSchema).optional().default([]),
  specifications: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// Schema for creating a new product
export const createProductSchema = baseProductSchema.extend({
  images: z.instanceof(FileList).optional(),
});

// Schema for updating an existing product
export const updateProductSchema = baseProductSchema.extend({
  id: z.string(),
  images: z.instanceof(FileList).optional(),
  existingImages: z.array(z.object({
    id: z.string(),
    url: z.string(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  deletedImages: z.array(z.string()).optional(),
});
