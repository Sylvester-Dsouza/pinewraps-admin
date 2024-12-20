'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Bell, Send, Users, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type NotificationType = 'all' | 'specific';

interface UserType {
  id: number;
  name: string;
  email: string;
}

// Mock users data - replace with API call
const mockUsers: UserType[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
];

export default function NotificationsPage() {
  const [notificationType, setNotificationType] = useState<NotificationType>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (notificationType === 'specific' && selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsSending(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const recipients = notificationType === 'all' 
        ? 'all users' 
        : `${selectedUsers.length} selected users`;
      
      toast.success(`Notification sent to ${recipients}`);
      
      // Reset form
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Send Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send notifications to all users or specific users
        </p>
      </div>

      {/* Notification Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Recipients
                </label>
                <Select 
                  value={notificationType} 
                  onValueChange={(value: NotificationType) => {
                    setNotificationType(value);
                    setSelectedUsers([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notification Title
                </label>
                <Input
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <Textarea
                  placeholder="Enter your notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSendNotification}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Preview Card */}
          <Card className="p-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Preview</h2>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {title || 'Notification Title'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {message || 'Notification message will appear here'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* User Selection */}
        {notificationType === 'specific' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-700">Select Users</h2>
              <span className="text-xs text-gray-500">
                {selectedUsers.length} selected
              </span>
            </div>
            <div className="space-y-2">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  )}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2',
                      selectedUsers.includes(user.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    )}
                  >
                    {selectedUsers.includes(user.id) && (
                      <svg
                        className="text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
