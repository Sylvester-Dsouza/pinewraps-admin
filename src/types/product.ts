import { Category } from './category';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export enum VariationType {
  SIZE = 'SIZE',
  FLAVOUR = 'FLAVOUR'
}

export interface VariantOption {
  value: string;
  priceAdjustment: number;
  stock: number;
}

export interface ProductVariant {
  type: VariationType;
  options: VariantOption[];
}

export interface VariantCombination {
  size: string;
  flavour: string;
  price: number;
}

export const PRODUCT_STATUS = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' }
];

export type ProductCategory = 'Cakes' | 'Flowers' | 'Combos';

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Cakes', 'Flowers', 'Combos'];

export interface ProductImage {
  id: string;
  url: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  sku: string;
  categoryId: string;
  category?: Category;
  status: ProductStatus;
  images?: ProductImage[];
  variations?: ProductVariant[];
  variantCombinations?: VariantCombination[];
  specifications?: Record<string, string>;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  basePrice: number;
  sku: string;
  categoryId: string;
  status: ProductStatus;
  variations?: ProductVariant[];
  specifications?: Record<string, string>;
  images?: File[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface UploadMediaInput {
  file: File;
  order?: number;
}

export interface ReorderMediaInput {
  mediaOrder: {
    mediaId: string;
    order: number;
  }[];
}

export interface ProductFilters {
  status?: ProductStatus;
  category?: ProductCategory;
  search?: string;
  page?: number;
  limit?: number;
}
