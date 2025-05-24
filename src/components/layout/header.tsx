'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BellIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    setIsLoggedIn(!!token)
    setRole(storedRole)
    const userId = sessionStorage.getItem('userId') // Assuming user ID is stored in localStorage

    if (isLoggedIn && userId) {
      fetchNotifications(userId)
    }
  }, [isLoggedIn, role])

  const fetchNotifications = async (userId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_URL}/notifications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)

        const unread = data.filter((notification: any) => !notification.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    if (!token) return

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error('Logout gagal:', err)
    }

    localStorage.clear()
    setIsLoggedIn(false)
    setRole(null)
    toast.success("Logout berhasil!")
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Kiri - Logo */}
      <Link href="/" className="text-2xl font-bold text-green-700">
        Papikos
      </Link>

      {/* Tengah - Menu berdasarkan role */}
      <nav className="hidden md:flex gap-6 text-sm text-gray-700 font-medium">
        {isLoggedIn && role === 'TENANT' && (
          <>
            <Link href="/" className="hover:text-green-700">Beranda</Link>
            <Link href="/kos" className="hover:text-green-700">Eksplor Kos</Link>
            <Link href="/booking" className="hover:text-green-700">Booking Saya</Link>
            <Link href="/wishlist" className="hover:text-green-700">Wishlist</Link>
            <Link href="/chat" className="hover:text-green-700">Chat</Link>
            <Link href="/transactions" className="hover:text-green-700">Riwayat</Link>
          </>
        )}
        {isLoggedIn && role === 'OWNER' && (
          <>
            <Link href="/" className="hover:text-green-700">Beranda</Link>
            <Link href="/manage" className="hover:text-green-700">Kelola Kos</Link>
            <Link href="/booking-request" className="hover:text-green-700">Permintaan Booking</Link>
            <Link href="/chat" className="hover:text-green-700">Chat</Link>
          </>
        )}
      </nav>

      {/* Kanan - Auth Buttons */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            {/* Notification Button */}
            <Link href="/notification">
              <Button
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 relative"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-green-700 border-green-600 hover:bg-green-100"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 text-white hover:bg-green-700">
                Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
