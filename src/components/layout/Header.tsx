'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">
          Pinewraps Admin
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
