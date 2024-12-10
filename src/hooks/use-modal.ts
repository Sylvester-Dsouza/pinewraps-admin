import { create } from 'zustand';
import { Coupon } from '@/lib/api/coupons';

interface ModalData {
  customerId?: string;
  onSuccess?: () => void;
  coupon?: Coupon;
}

interface ModalStore {
  type: 'addPoints' | 'createCoupon' | 'editCoupon' | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: 'addPoints' | 'createCoupon' | 'editCoupon', data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false, data: {} })
}));
