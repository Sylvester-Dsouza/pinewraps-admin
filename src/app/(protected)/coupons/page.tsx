"use client";

import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/coupons/columns";
import { useModal } from "@/hooks/use-modal";
import { useCoupons, useUpdateCoupon, useDeleteCoupon } from "@/hooks/use-coupons";
import { Loader } from "@/components/ui/loader";
import { CouponModal } from "@/components/modals/coupon-modal";
import { Coupon } from "@/lib/api/coupons";
import { toast } from "@/components/ui/use-toast";

const CouponsPage = () => {
  const { onOpen } = useModal();
  const { data: coupons, isLoading } = useCoupons();
  const { mutate: updateCoupon } = useUpdateCoupon();
  const { mutate: deleteCoupon } = useDeleteCoupon();

  const handleEdit = useCallback((coupon: Coupon) => {
    onOpen("editCoupon", {
      coupon: {
        ...coupon,
        value: typeof coupon.value === 'string' 
          ? (coupon.type === 'PERCENTAGE' 
              ? parseFloat(coupon.value) 
              : parseFloat(coupon.value.replace(/[^0-9.-]+/g, "")))
          : coupon.value,
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
      }
    });
  }, [onOpen]);

  const handleStatusChange = useCallback((id: string, status: string) => {
    updateCoupon(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `Coupon ${status === "ACTIVE" ? "activated" : "deactivated"} successfully`,
          });
        },
      }
    );
  }, [updateCoupon]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      deleteCoupon(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Coupon deleted successfully",
          });
        },
      });
    }
  }, [deleteCoupon]);

  const formattedCoupons = useMemo(() => {
    return coupons?.map(coupon => ({
      ...coupon,
      onEdit: handleEdit,
      onStatusChange: handleStatusChange,
      onDelete: handleDelete,
    })) || [];
  }, [coupons, handleEdit, handleStatusChange, handleDelete]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <Heading
              title="Coupons"
              description="Manage discount coupons for your store"
            />
            <Button onClick={() => onOpen("createCoupon")}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
          <Separator />
          <DataTable searchKey="code" columns={columns} data={formattedCoupons} />
        </div>
      </div>
      <CouponModal />
    </>
  );
};

export default CouponsPage;
