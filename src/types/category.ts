export interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  id: string;
}
