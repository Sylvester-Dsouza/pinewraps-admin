'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Category } from '@/types/category';
import { Product, VariationType } from '@/types/product';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClipboardEdit, ImagePlus, DollarSign, Tag, Layers, Grid, Plus, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import DraggableImageGrid from './DraggableImageGrid';
import { nanoid } from 'nanoid/non-secure';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type ProductFormData = z.infer<typeof productFormSchema> & {
  images?: FileList;
  existingImages?: Array<{ id: string; url: string; isPrimary?: boolean }>;
  deletedImages?: string[];
};

// Define product statuses
const PRODUCT_STATUSES = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' }
] as const;

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  basePrice: z.coerce.number().min(0, 'Base price must be positive').int('Price must be a whole number'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'ACTIVE']),
  variations: z.array(z.object({
    type: z.enum(['SIZE', 'FLAVOUR']),
    options: z.array(z.object({
      value: z.string(),
      priceAdjustment: z.coerce.number().default(0),
      stock: z.coerce.number().min(0).default(0)
    }))
  })).optional(),
  existingImages: z.array(z.object({
    id: z.string(),
    url: z.string()
  })).optional(),
  deletedImages: z.array(z.string()).optional(),
  images: z.any().optional(),
  combinations: z.array(z.object({
    size: z.string(),
    flavour: z.string(),
    price: z.number()
  })).optional()
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  submitLabel?: string;
  categories: Category[];
}

export default function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  submitLabel = 'Save',
  categories
}: ProductFormProps) {
  console.log('ProductForm mounted with initialData:', initialData);

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Array<{ id: string; url: string }>>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [editingVariants, setEditingVariants] = useState(false);
  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { type: VariationType.SIZE, options: [] },
    { type: VariationType.FLAVOUR, options: [] }
  ]);

  // Create form with proper type checking
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      basePrice: initialData?.basePrice || 0,
      sku: initialData?.sku || '',
      categoryId: initialData?.category?.id || '',
      status: initialData?.status || 'DRAFT',
      variations: initialData?.variations || [],
      existingImages: initialData?.images || [],
      deletedImages: [],
      combinations: initialData?.combinations || []
    }
  });

  // Initialize preview URLs from initialData
  useEffect(() => {
    if (initialData?.images) {
      console.log('Setting preview URLs from initialData:', initialData.images);
      setPreviewUrls(
        initialData.images.map(img => ({
          id: img.id,
          url: img.url
        }))
      );
    }
  }, [initialData?.images]);

  // Initialize variants from initialData if they exist
  useEffect(() => {
    if (initialData?.variations && initialData.variations.length > 0) {
      setVariants(initialData.variations);
      setShowVariants(true);
      setEditingVariants(true);

      // Generate combinations
      const sizes = initialData.variations.find(v => v.type === VariationType.SIZE)?.options || [];
      const flavours = initialData.variations.find(v => v.type === VariationType.FLAVOUR)?.options || [];
      
      const combinations: VariantCombination[] = [];
      sizes.forEach(size => {
        if (size.value.trim()) {
          flavours.forEach(flavour => {
            if (flavour.value.trim()) {
              const existingCombination = initialData.combinations?.find(
                c => c.size === size.value && c.flavour === flavour.value
              );

              const price = existingCombination?.price !== undefined 
                ? existingCombination.price
                : (initialData.basePrice || 0) + Number(size.priceAdjustment || 0) + Number(flavour.priceAdjustment || 0);

              combinations.push({
                size: size.value,
                flavour: flavour.value,
                price: price
              });
            }
          });
        }
      });
      
      setVariantCombinations(combinations);
    }
  }, [initialData?.variations]);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting form data from initialData:', initialData);
      
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        basePrice: initialData.basePrice || 0,
        sku: initialData.sku,
        categoryId: initialData.category?.id || '',
        status: initialData.status || 'DRAFT',
        variations: initialData.variations || [],
        existingImages: initialData.images || [],
        deletedImages: [],
        combinations: initialData.combinations || []
      });
    }
  }, [form, initialData]);

  // Log form state changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Form field changed:', { name, type, value });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Debug current form values
  const currentValues = form.getValues();
  console.log('Current form values:', currentValues);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  Array.from(files).forEach(file => {
    if (file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newId = nanoid();
        setImages(prev => [...prev, file]);
        setPreviewUrls(prev => [...prev, {
          id: newId,
          url: e.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error(`File ${file.name} is too large or has an invalid format`);
    }
  });

  // Clear the input value so the same file can be selected again
  event.target.value = '';
};

const removeImage = (id: string) => {
  console.log('Removing image with id:', id);
  
  // Simply remove the image from both state arrays
  setPreviewUrls(prev => prev.filter(img => img.id !== id));
  setImages(prev => {
    const indexToRemove = previewUrls.findIndex(img => img.id === id);
    return prev.filter((_, index) => index !== indexToRemove);
  });
  
  // If it's an existing image, mark it for deletion
  const imageToRemove = previewUrls.find(img => img.id === id);
  if (imageToRemove?.url.startsWith('http')) {
    const currentDeletedImages = form.getValues('deletedImages') || [];
    form.setValue('deletedImages', [...currentDeletedImages, id]);
  }
};

  const handleReorderImages = (newOrder: Array<{ id: string; url: string }>) => {
    // Reorder the images array to match the new preview order
    const newImages = newOrder.map(item => {
      const oldIndex = previewUrls.findIndex(img => img.id === item.id);
      return images[oldIndex];
    });
    
    setImages(newImages);
    setPreviewUrls(newOrder);
  };

  const addVariantOption = (type: VariationType) => {
    setVariants(prev => prev.map(variant => {
      if (variant.type === type) {
        return {
          ...variant,
          options: [...variant.options, { value: '', priceAdjustment: 0, stock: 0 }]
        };
      }
      return variant;
    }));
    // Don't regenerate combinations here as the value is empty
  };

  const removeVariantOption = (type: VariationType, index: number) => {
    setVariants(prev => prev.map(variant => {
      if (variant.type === type) {
        const newOptions = variant.options.filter((_, i) => i !== index);
        return {
          ...variant,
          options: newOptions
        };
      }
      return variant;
    }));
    // Regenerate combinations after removing an option
    generateCombinations();
  };

  const updateVariantOption = (type: VariationType, index: number, field: 'value' | 'priceAdjustment' | 'stock', value: string | number) => {
    setVariants(prev => prev.map(variant => {
      if (variant.type === type) {
        return {
          ...variant,
          options: variant.options.map((option, i) => {
            if (i === index) {
              return { 
                ...option, 
                [field]: field === 'value' ? value : Number(value)
              };
            }
            return option;
          })
        };
      }
      return variant;
    }));
    // Only regenerate combinations if the value is not empty (for value field)
    // or always regenerate for price adjustments
    if (field === 'value' ? value.toString().trim() : true) {
      generateCombinations();
    }
  };

  const generateCombinations = () => {
    const sizes = variants.find(v => v.type === VariationType.SIZE)?.options || [];
    const flavours = variants.find(v => v.type === VariationType.FLAVOUR)?.options || [];

    // Only generate combinations if both sizes and flavours have valid values
    if (sizes.some(s => !s.value.trim()) || flavours.some(f => !f.value.trim())) {
      return;
    }

    const combinations: VariantCombination[] = [];
    sizes.forEach(size => {
      if (size.value.trim()) {
        flavours.forEach(flavour => {
          if (flavour.value.trim()) {
            // Calculate total price adjustment for this combination
            const totalPriceAdjustment = Number(size.priceAdjustment || 0) + Number(flavour.priceAdjustment || 0);
            const basePrice = Number(form.getValues('basePrice') || 0);
            
            // Try to find existing price for this combination
            const existing = variantCombinations.find(
              vc => vc.size === size.value && vc.flavour === flavour.value
            );

            combinations.push({
              size: size.value,
              flavour: flavour.value,
              price: existing?.price !== undefined ? existing.price : (basePrice + totalPriceAdjustment)
            });
          }
        });
      }
    });

    setVariantCombinations(combinations);
  };

  const updateCombinationPrice = (size: string, flavour: string, newPrice: number) => {
    // Update the variant combinations display
    setVariantCombinations(prev => 
      prev.map(combo => 
        combo.size === size && combo.flavour === flavour
          ? { ...combo, price: newPrice }
          : combo
      )
    );

    // Update form data with the new combination price
    const currentFormData = form.getValues();
    const updatedCombinations = variantCombinations.map(combo => ({
      size: combo.size,
      flavour: combo.flavour,
      price: combo.size === size && combo.flavour === flavour ? newPrice : combo.price
    }));

    form.setValue('combinations', updatedCombinations);
  };

  const saveVariants = () => {
    if (variants.some(v => v.options.length === 0)) {
      toast.error('Please add at least one option for each variant type');
      return;
    }
    if (variants.some(v => v.options.some(o => !o.value.trim()))) {
      toast.error('Please fill in all variant options');
      return;
    }
    setEditingVariants(false);
    generateCombinations();
    toast.success('Variants saved successfully');
  };

  const editVariants = () => {
    setEditingVariants(true);
  };

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      const formData = new FormData();

      // Add basic product data
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('basePrice', data.basePrice.toString());
      formData.append('sku', data.sku);
      formData.append('categoryId', data.categoryId);
      formData.append('status', data.status);

      // Add variations with their basic data
      if (showVariants) {
        const variationsData = variants.map(variation => ({
          type: variation.type,
          options: variation.options.map(option => ({
            value: option.value,
            stock: option.stock || 0,
            priceAdjustment: option.priceAdjustment || 0
          }))
        }));
        formData.append('variations', JSON.stringify(variationsData));

        // Add combinations with their individual prices
        const combinationsData = variantCombinations.map(combo => ({
          size: combo.size,
          flavour: combo.flavour,
          price: Number(combo.price)
        }));
        formData.append('combinations', JSON.stringify(combinationsData));
      }

      // Add existing images with isPrimary flag
      if (previewUrls.length > 0) {
        const existingImages = previewUrls
          .filter(img => img.url.startsWith('http'))
          .map((img, index) => ({
            id: img.id,
            url: img.url,
            isPrimary: index === 0
          }));
        if (existingImages.length > 0) {
          formData.append('existingImages', JSON.stringify(existingImages));
        }
      }

      // Add deleted images if any
      if (data.deletedImages && data.deletedImages.length > 0) {
        formData.append('deletedImages', JSON.stringify(data.deletedImages));
      }

      // Add new images
      images.forEach((file) => {
        formData.append('images', file);
      });

      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save product');
    }
  };

  const handleFormCancel = () => {
    // Cleanup any object URLs before canceling
    previewUrls.forEach(img => {
      if (!img.url.startsWith('http')) {
        URL.revokeObjectURL(img.url);
      }
    });
    // Reset form and state
    form.reset();
    setImages([]);
    setPreviewUrls([]); // Reset to empty array instead of trying to map initial images
    onCancel();
  };
  const statusOptions = PRODUCT_STATUSES;

  const handleToggleVariants = () => {
    setShowVariants(!showVariants);
    if (!showVariants) {
      setEditingVariants(true);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-none shadow-md">
              <CardHeader className="border-b bg-gray-50/50 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <ClipboardEdit className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl font-semibold text-gray-700">Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Product Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e);
                              console.log('Name changed:', e.target.value);
                            }}
                            placeholder="Enter product name"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e);
                              console.log('Description changed:', e.target.value);
                            }}
                            placeholder="Enter product description"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            Base Price
                            <span className="text-xs text-gray-500 font-normal">(Used when no variations are set)</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">
                                <DollarSign className="h-5 w-5" />
                              </span>
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="Enter base price"
                                className="pl-10"
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? '' : parseInt(value, 10));
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500 mt-1">
                            Note: Add this Price Always as the base price
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">SKU</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">
                                <Tag className="h-5 w-5" />
                              </span>
                              <Input placeholder="Enter SKU" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem 
                                  key={category.id} 
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card className="border-none shadow-md">
              <CardHeader className="border-b bg-gray-50/50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-xl font-semibold text-gray-700">Variants</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {showVariants && (
                      <Button
                        type="button"
                        variant={editingVariants ? "default" : "outline"}
                        size="sm"
                        onClick={editingVariants ? saveVariants : editVariants}
                      >
                        {editingVariants ? 'Save Variants' : 'Edit Variants'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleToggleVariants}
                    >
                      {showVariants ? 'Hide Variants' : 'Add Variants'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {showVariants && (
                <CardContent className="space-y-6 pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Size Variants */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700">Size</h3>
                        {editingVariants && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVariantOption(VariationType.SIZE)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Size
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2 bg-gray-50/50 p-4 rounded-lg">
                        {variants.find(v => v.type === VariationType.SIZE)?.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border group">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Enter size (e.g., Small, Medium, Large)"
                                value={option.value}
                                onChange={(e) => updateVariantOption(VariationType.SIZE, index, 'value', e.target.value)}
                                disabled={!editingVariants}
                              />
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="Price"
                                  value={option.priceAdjustment}
                                  onChange={(e) => updateVariantOption(VariationType.SIZE, index, 'priceAdjustment', e.target.value)}
                                  disabled={!editingVariants}
                                  min="0"
                                  step="1"
                                  className="pl-16"
                                />
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">Price:</span>
                              </div>
                            </div>
                            {editingVariants && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariantOption(VariationType.SIZE, index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {variants.find(v => v.type === VariationType.SIZE)?.options.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-2">No sizes added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Flavour Variants */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700">Flavour</h3>
                        {editingVariants && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVariantOption(VariationType.FLAVOUR)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Flavour
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2 bg-gray-50/50 p-4 rounded-lg">
                        {variants.find(v => v.type === VariationType.FLAVOUR)?.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border group">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Enter flavour"
                                value={option.value}
                                onChange={(e) => updateVariantOption(VariationType.FLAVOUR, index, 'value', e.target.value)}
                                disabled={!editingVariants}
                              />
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="Price"
                                  value={option.priceAdjustment}
                                  onChange={(e) => updateVariantOption(VariationType.FLAVOUR, index, 'priceAdjustment', e.target.value)}
                                  disabled={!editingVariants}
                                  min="0"
                                  step="1"
                                  className="pl-16"
                                />
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">Price:</span>
                              </div>
                            </div>
                            {editingVariants && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariantOption(VariationType.FLAVOUR, index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {variants.find(v => v.type === VariationType.FLAVOUR)?.options.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-2">No flavours added yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variant Combinations */}
                  {showVariants && (
                    <Card className="border-none shadow-md">
                      <CardHeader className="border-b bg-gray-50/50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Grid className="h-5 w-5 text-gray-500" />
                            <CardTitle className="text-xl font-semibold text-gray-700">Combination Prices</CardTitle>
                          </div>
                          {!editingVariants && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={editVariants}
                            >
                              Edit Variants
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      {variantCombinations.length > 0 && (
                        <CardContent className="pt-6">
                          <div className="grid gap-4">
                            <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-600 pb-2">
                              <div>Size</div>
                              <div>Flavour</div>
                              <div>Price (AED)</div>
                            </div>
                            {variantCombinations.map((combo, index) => (
                              <div key={index} className="grid grid-cols-3 gap-4 items-center bg-white p-3 rounded border">
                                <div className="font-medium text-gray-700">{combo.size}</div>
                                <div className="font-medium text-gray-700">{combo.flavour}</div>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={combo.price}
                                  onChange={(e) => updateCombinationPrice(
                                    combo.size,
                                    combo.flavour,
                                    Number(e.target.value)
                                  )}
                                  min="0"
                                  step="0.01"
                                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Media */}
            <Card className="border-none shadow-md">
              <CardHeader className="border-b bg-gray-50/50 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <ImagePlus className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl font-semibold text-gray-700">Media</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <DraggableImageGrid
                  images={previewUrls}
                  onReorder={handleReorderImages}
                  onRemove={removeImage}
                >
                  <label className="relative aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="p-4 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <Plus className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      </div>
                      <span className="mt-2 text-sm text-gray-500 group-hover:text-gray-600">Add Image</span>
                    </div>
                  </label>
                </DraggableImageGrid>
                <p className="text-sm text-gray-500 mt-4">
                  Upload up to 5 images. Max file size: 5MB. Supported formats: JPEG, PNG, WebP.
                  Drag images to reorder them.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="border-b bg-gray-50/50 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Grid className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl font-semibold text-gray-700">Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleFormCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

interface VariantCombination {
  size: string;
  flavour: string;
  price: number;
}
