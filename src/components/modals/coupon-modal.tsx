import { useState, useEffect, useMemo } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/use-coupons";
import { Coupon } from "@/lib/api/coupons";

const formSchema = z.object({
  code: z.string().min(1, "Code is required"),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.coerce.number().min(0, "Value must be positive"),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  usageLimit: z.coerce.number().optional(),
  minOrderAmount: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const CouponModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && (type === "createCoupon" || type === "editCoupon");
  const { mutate: createCoupon, isLoading: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isLoading: isUpdating } = useUpdateCoupon();
  const isEditing = type === "editCoupon";

  const defaultValues = useMemo(() => {
    if (isEditing && data?.coupon) {
      const coupon = data.coupon;
      return {
        code: coupon.code,
        type: coupon.type,
        value: typeof coupon.value === 'number' ? coupon.value : 0,
        description: coupon.description || "",
        startDate: new Date(coupon.startDate).toISOString().split("T")[0],
        endDate: coupon.endDate
          ? new Date(coupon.endDate).toISOString().split("T")[0]
          : undefined,
        usageLimit: typeof coupon.usageLimit === 'number' ? coupon.usageLimit : undefined,
        minOrderAmount: typeof coupon.minOrderAmount === 'number' ? coupon.minOrderAmount : 0,
        maxDiscount: typeof coupon.maxDiscount === 'number' ? coupon.maxDiscount : 0,
      };
    }
    return {
      code: "",
      type: "PERCENTAGE" as const,
      value: 0,
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: undefined,
      usageLimit: undefined,
      minOrderAmount: 0,
      maxDiscount: 0,
    };
  }, [isEditing, data?.coupon]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isModalOpen) {
      form.reset(defaultValues);
    }
  }, [isModalOpen, defaultValues, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const formattedValues = {
        ...values,
        code: values.code.toUpperCase(),
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
        usageLimit: values.usageLimit || undefined,
        minOrderAmount: values.minOrderAmount === 0 ? undefined : values.minOrderAmount,
        maxDiscount: values.maxDiscount === 0 ? undefined : values.maxDiscount,
      };

      console.log('Submitting form values:', formattedValues);

      if (isEditing && data?.coupon) {
        console.log('Updating existing coupon:', data.coupon.id);
        await updateCoupon(
          { 
            id: data.coupon.id, 
            data: formattedValues
          },
          {
            onSuccess: () => {
              onClose();
              form.reset();
            },
          }
        );
      } else {
        console.log('Creating new coupon');
        await createCoupon(
          formattedValues,
          {
            onSuccess: () => {
              onClose();
              form.reset();
            },
          }
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {data.coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter coupon code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="No limit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minOrderAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Order Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        placeholder="No minimum"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Discount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        placeholder="No maximum"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  "Saving..."
                ) : data.coupon ? (
                  "Save Changes"
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
