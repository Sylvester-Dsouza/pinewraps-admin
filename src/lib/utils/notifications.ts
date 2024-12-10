import { Bell, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export type NotificationType = 'order' | 'inventory' | 'review' | 'payment';
export type NotificationStatus = 'read' | 'unread';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  timestamp: Date;
}

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return Clock;
    case 'inventory':
      return AlertCircle;
    case 'review':
      return CheckCircle2;
    case 'payment':
      return XCircle;
    default:
      return Bell;
  }
};

export const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return 'text-blue-500';
    case 'inventory':
      return 'text-yellow-500';
    case 'review':
      return 'text-green-500';
    case 'payment':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

// Mock data for testing
export const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'New Order Received',
    message: 'Order #1234 has been placed and is awaiting processing.',
    type: 'order',
    status: 'unread',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: 2,
    title: 'Low Stock Alert',
    message: 'Product "Birthday Cake" is running low on stock (2 remaining).',
    type: 'inventory',
    status: 'unread',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 3,
    title: 'Customer Review',
    message: 'A new 5-star review has been posted for "Chocolate Cake".',
    type: 'review',
    status: 'read',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: 4,
    title: 'Payment Failed',
    message: 'Payment for Order #1235 has failed. Customer has been notified.',
    type: 'payment',
    status: 'read',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
];
