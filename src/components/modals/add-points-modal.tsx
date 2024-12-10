'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useModal } from '@/hooks/use-modal';
import { rewardsApi } from '@/lib/api/rewards';
import toast from 'react-hot-toast';

export const AddPointsModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');

  const isModalOpen = isOpen && type === 'addPoints';

  const onSubmit = async () => {
    try {
      setLoading(true);
      const pointsNumber = parseInt(points);
      
      if (isNaN(pointsNumber) || pointsNumber <= 0) {
        toast.error('Please enter a valid number of points');
        return;
      }

      if (!description) {
        toast.error('Please enter a description');
        return;
      }

      await rewardsApi.addPoints({
        customerId: data.customerId,
        points: pointsNumber,
        description
      });

      toast.success('Points added successfully');
      onClose();
      data?.onSuccess?.();
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPoints('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      title="Add Reward Points"
      description="Add points to customer's reward balance"
      isOpen={isModalOpen}
      onClose={handleClose}
    >
      <div className="space-y-4 py-2 pb-4">
        <div className="space-y-2">
          <Input
            placeholder="Enter points amount"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder="Enter description (e.g., 'Bonus points for loyalty')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          disabled={loading}
          variant="outline"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          disabled={loading || !points || !description}
          onClick={onSubmit}
        >
          Add Points
        </Button>
      </div>
    </Modal>
  );
};
