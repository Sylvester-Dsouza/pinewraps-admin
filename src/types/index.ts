export type UserRole = 'ADMIN' | 'USER'
export type CategoryType = 'CAKES' | 'FLOWERS' | 'COMBOS'
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type VariationType = 'SIZE' | 'FLAVOUR' | 'CAKE_FLAVOUR'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  type: CategoryType
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariationOption {
  id: string
  value: string
  variationId: string
}

export interface ProductVariation {
  id: string
  type: VariationType
  productId: string
  options: ProductVariationOption[]
}

export interface ProductImage {
  id: string
  url: string
  productId: string
}

export interface Product {
  id: string
  name: string
  description?: string
  specifications?: any // For combination pricing
  sku?: string
  status: ProductStatus
  categoryId: string
  tags: string[]
  weight?: number
  dimensions?: any
  createdAt: Date
  updatedAt: Date
  variations: ProductVariation[]
  images: ProductImage[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  options?: any
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  shippingInfo: any
  paymentInfo?: any
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment?: string
}
