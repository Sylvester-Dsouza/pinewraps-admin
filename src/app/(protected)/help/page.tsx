'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Heading title="Help & Support" description="Get help with using the admin dashboard" />
      </div>
      <Separator />
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Learn how to use the admin dashboard effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose">
              <h3>Getting Started</h3>
              <p>
                Welcome to the Pinewraps Admin Dashboard. This dashboard allows you to manage your
                e-commerce platform efficiently.
              </p>
              
              <h3>Need Help?</h3>
              <p>
                If you need assistance or have any questions, please contact our support team at:
                <br />
                Email: support@pinewraps.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
