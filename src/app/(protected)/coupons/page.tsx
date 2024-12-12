"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/coupons/columns";
import { useCoupons } from "@/hooks/use-coupons";

const CouponsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { data: coupons, isLoading } = useCoupons();

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading title="Coupons" description="Manage your discount coupons" />
        <Button onClick={() => router.push("/coupons/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        searchKey="code"
      />
    </div>
  );
};

export default CouponsPage;
