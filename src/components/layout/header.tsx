'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error('Logout gagal:', err)
    }

    localStorage.removeItem('token')
    setIsLoggedIn(false)
    toast.success("Logout berhasil!")
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-green-700">
        Papikos
      </Link>

      <nav className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
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
      </nav>
    </header>
  )
}