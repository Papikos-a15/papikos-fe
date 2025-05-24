'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

function decodeJWT(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // useEffect(() => {
  //   const token = localStorage.getItem("token")
  //   if (token) {
  //     try {
  //       const decoded = decodeJWT(token)
  //       const now = Date.now() / 1000
  //       if (decoded.exp > now) {
  //         // Already logged in
  //         router.push(decoded.role === "ADMIN" ? "/admin" : "/")
  //       } else {
  //         localStorage.clear()
  //       }
  //     } catch {
  //       localStorage.clear()
  //     }
  //   }
  // }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      toast.error("Login gagal. Periksa email dan password.")
      return
    }

    const data = await res.json()
    const token = data.token
    const userId = data.userId
    console.log('token:', token);
    console.log('userId:', userId);

    const decodedToken = decodeJWT(token);

    localStorage.setItem("token", token);
    sessionStorage.setItem("userId", userId);
    localStorage.setItem("role", decodedToken.role);
    const role = decodedToken.role

    toast.success("Login berhasil!")

    if (role === "ADMIN") {
      router.push("/admin")
    } else {
      router.push("/")
    }
  }

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 items-center justify-center px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 shadow-xl bg-white rounded-xl overflow-hidden w-full max-w-4xl">
        {/* Kiri: Ilustrasi atau branding */}
        <div className="hidden md:flex items-center justify-center bg-green-600">
          <img
            src="/images/login.png"
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Kanan: Form Login */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to <span className="text-green-700">Papikos</span>
            </h2>
            <p className="text-gray-500 text-sm">We're happy to see you again</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
              Login
            </Button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-green-700 hover:underline">
              Register
            </Link>
          </p>

          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mt-2 w-full text-green-700"
          >
            ← Kembali ke Beranda
          </Button>
        </div>
      </div>
    </main>
  )
}