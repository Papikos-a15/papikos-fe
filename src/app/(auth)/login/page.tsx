'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      toast.error("Login gagal. Periksa email dan password.")
      return
    }

    const data = await res.json()
    localStorage.setItem("token", data.token)
    toast.success("Login berhasil!")
    router.push("/dashboard")
  }

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 items-center justify-center px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 shadow-xl bg-white rounded-xl overflow-hidden w-full max-w-4xl">
        {/* Kiri: Ilustrasi atau branding */}
        <div className="hidden md:flex items-center justify-center bg-green-600">
          <h2 className="text-4xl font-bold text-green-700"></h2>
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
        </div>
      </div>
    </main>
  )
}