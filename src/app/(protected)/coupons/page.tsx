"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { columns } from "@/components/coupons/columns";
import { CouponForm } from "@/components/coupons/coupon-form";
import { useCoupons, useUpdateCoupon, useDeleteCoupon, useCreateCoupon } from "@/hooks/use-coupons";
import { Coupon } from "@/lib/api/coupons";

const CouponsPage = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  
  const { data: coupons, isLoading } = useCoupons();
  const { mutate: updateCoupon } = useUpdateCoupon();
  const { mutate: deleteCoupon } = useDeleteCoupon();
  const { mutate: createCoupon } = useCreateCoupon();

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCoupon) {
        await updateCoupon({ id: selectedCoupon.id, data });
      } else {
        await createCoupon(data);
      }
      setIsModalOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      console.error("Error submitting coupon:", error);
    }
  };

  const couponsWithActions = coupons?.map((coupon: Coupon) => ({
    ...coupon,
    onEdit: (coupon: Coupon) => {
      setSelectedCoupon(coupon);
      setIsModalOpen(true);
    },
    onStatusChange: (id: string, status: string) => {
      try {
        updateCoupon({ 
          id, 
          data: { 
            status: status as CouponStatus 
          } 
        });
      } catch (error) {
        console.error("Error updating coupon status:", error);
      }
    },
    onDelete: (id: string) => {
      if (window.confirm("Are you sure you want to delete this coupon?")) {
        deleteCoupon(id);
      }
    },
  })) || [];

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title="Coupons" description="Manage your discount coupons" />
          <Button onClick={() => {
            setSelectedCoupon(null);
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={couponsWithActions}
          loading={loading}
          searchKey="code"
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>
          <CouponForm 
            initialData={selectedCoupon}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CouponsPage;
