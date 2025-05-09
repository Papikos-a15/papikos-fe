'use client'

import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);


  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="py-20 text-center flex flex-col items-center mb-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Sewa Kos Aman & Mudah bersama <span className="text-green-700">Papikos</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-10">
          Platform terpercaya yang mempertemukan penyewa dan pemilik kos dalam satu aplikasi yang praktis dan efisien.
        </p>

        {!isLoggedIn && (
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
            <Button
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-100 px-6 py-3 text-lg"
              onClick={() => router.push('/register')}
            >
              Daftar Sekarang
            </Button>
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto bg-green-100 rounded-2xl p-10 shadow-inner mt-20 mb-20">
        <h2 className="text-4xl font-bold text-center text-green-700 mb-8">
          Kenapa Memilih Papikos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          <div className="bg-white rounded-xl shadow p-6 border border-green-200 hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Autentikasi Aman</h3>
            <p className="text-sm text-gray-600">Login & registrasi dengan validasi admin agar setiap akun terpercaya.</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-green-200 hover:shadow-lg transition">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Manajemen Kos Praktis</h3>
            <p className="text-sm text-gray-600">Pemilik kos bisa kelola data kos dan penyewaan dalam satu dashboard.</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-green-200 hover:shadow-lg transition">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Pembayaran Transparan</h3>
            <p className="text-sm text-gray-600">Bayar dan top up saldo langsung dari aplikasi secara aman & cepat.</p>
          </div>
        </div>
      </section>
      {/* Fitur Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">Fitur Unggulan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white shadow-md p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Autentikasi Aman</h3>
            <p className="text-sm text-gray-600">Login dan registrasi aman untuk penyewa, pemilik, dan admin dengan persetujuan admin.</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Penyewaan Kos</h3>
            <p className="text-sm text-gray-600">Penyewa dapat mencari, melihat detail, dan menyewa kos dengan mudah.</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Pengelolaan Kos</h3>
            <p className="text-sm text-gray-600">Pemilik kos dapat menambah, edit, dan hapus data kos serta mengelola penyewaan.</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Pembayaran Saldo</h3>
            <p className="text-sm text-gray-600">Top up saldo dan bayar sewa kos langsung dari aplikasi dengan sistem transparan.</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Chat & Komunikasi</h3>
            <p className="text-sm text-gray-600">Penyewa dan pemilik kos dapat berkomunikasi langsung lewat chat aplikasi.</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Wishlist & Notifikasi</h3>
            <p className="text-sm text-gray-600">Pantau kos favorit Anda dan dapatkan notifikasi saat kamar tersedia.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}