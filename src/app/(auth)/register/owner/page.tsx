'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterOwnerPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.")
      return
    }

    const res = await fetch("http://localhost:8080/auth/register/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
        const errorData = await res.json()
      
        if (errorData.error?.includes("already in use")) {
          toast.error("Email sudah terdaftar. ")
        } else {
          toast.error("Registrasi gagal. Silakan coba lagi.")
        }
      
        return
    }

    

    toast.success("Registrasi berhasil! Silakan login.")
    router.push("/login")
  }

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 items-center justify-center px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 shadow-xl bg-white rounded-xl overflow-hidden w-full max-w-4xl">
        {/* Kiri: Branding */}
        <div className="hidden md:flex items-center justify-center bg-green-600 text-white p-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Selamat Datang!</h2>
            <p className="text-sm">Kelola properti kos Anda secara efisien dan praktis.</p>
          </div>
        </div>

        {/* Kanan: Form Register */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-green-700 mb-2">
            Bergabung sebagai Pemilik Kos
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Buat akun untuk mulai mendaftarkan dan mengelola properti kos Anda.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
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
            <div>
              <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
              Daftar Sekarang
            </Button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-green-700 hover:underline">
              Login
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
