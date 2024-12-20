import { DateRange } from '@/components/dashboard/date-range-selector';
import { Timestamp } from 'firebase/firestore';

export function getDateRangeTimestamp(range: DateRange): Date {
  const now = new Date();
  
  switch (range) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '14d':
      return new Date(now.setDate(now.getDate() - 14));
    case '30d':
      return new Date(now.setDate(now.getDate() - 30));
    case '3m':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '6m':
      return new Date(now.setMonth(now.getMonth() - 6));
    case 'all':
      return new Date(0); // Beginning of time
    default:
      return new Date(now.setDate(now.getDate() - 7)); // Default to 7 days
  }
}

export function isWithinDateRange(timestamp: Timestamp, startDate: Date): boolean {
  return timestamp.toDate() >= startDate;
}
