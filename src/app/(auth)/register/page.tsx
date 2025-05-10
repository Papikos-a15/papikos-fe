'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ChooseRolePage() {
  const router = useRouter()

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-8">
          Pilih Peran Anda
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-xl border-green-400 hover:border-green-600 transition-all duration-200"
            onClick={() => router.push('/register/tenant')}
          >
            <CardContent className="p-6 text-center space-y-2">
              <h2 className="text-xl font-semibold text-green-800">Tenant</h2>
              <p className="text-sm text-gray-600">
                Saya ingin mencari dan menyewa kos yang tersedia.
              </p>
              <Button variant="outline" className="mt-4 w-full border-green-600 text-green-700 hover:bg-green-100">
                Daftar sebagai Tenant
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl border-green-400 hover:border-green-600 transition-all duration-200"
            onClick={() => router.push('/register/owner')}
          >
            <CardContent className="p-6 text-center space-y-2">
              <h2 className="text-xl font-semibold text-green-800">Owner</h2>
              <p className="text-sm text-gray-600">
                Saya pemilik kos dan ingin mendaftarkan properti saya.
              </p>
              <Button variant="outline" className="mt-4 w-full border-green-600 text-green-700 hover:bg-green-100">
                Daftar sebagai Owner
              </Button>
            </CardContent>
          </Card>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mt-2 w-full text-green-700"
        >
          ← Kembali ke Beranda
        </Button>
      </div>
    </main>
  )
}