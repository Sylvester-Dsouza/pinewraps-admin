'use client';

import { useEffect, useState } from 'react';
import { AddPointsModal } from '@/components/modals/add-points-modal';
import { CouponModal } from "@/components/modals/coupon-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AddPointsModal />
      <CouponModal />
    </>
  );
};
