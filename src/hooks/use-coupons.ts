import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coupon, createCoupon, deleteCoupon, getCoupons, updateCoupon } from "@/lib/api/coupons";
import { toast } from "@/components/ui/use-toast";

// Helper function to parse numeric values from API response
const parseCouponValues = (coupon: any): Coupon => {
  return {
    ...coupon,
    // Parse value from percentage or currency string
    value: typeof coupon.value === 'string' 
      ? (coupon.type === 'PERCENTAGE' 
          ? parseFloat(coupon.value) 
          : parseFloat(coupon.value.replace(/[^0-9.-]+/g, "")))
      : coupon.value,
    // Parse optional numeric values
    minOrderAmount: coupon.minOrderAmount 
      ? (typeof coupon.minOrderAmount === 'string'
          ? parseFloat(coupon.minOrderAmount.replace(/[^0-9.-]+/g, ""))
          : coupon.minOrderAmount)
      : undefined,
    maxDiscount: coupon.maxDiscount
      ? (typeof coupon.maxDiscount === 'string'
          ? parseFloat(coupon.maxDiscount.replace(/[^0-9.-]+/g, ""))
          : coupon.maxDiscount)
      : undefined,
    usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
  };
};

// Helper function to format values for API
export const formatCouponForApi = (data: Partial<Coupon>) => {
  return {
    ...data,
    minOrderAmount: data.minOrderAmount,
    maxDiscount: data.maxDiscount,
  };
};

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const coupons = await getCoupons();
      return coupons.map(parseCouponValues);
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Coupon>) => createCoupon(formatCouponForApi(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      console.log('Updating coupon:', { id, data });
      const formattedData = formatCouponForApi(data);
      console.log('Formatted data:', formattedData);
      return updateCoupon(id, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Update coupon error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to update coupon",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });
};
