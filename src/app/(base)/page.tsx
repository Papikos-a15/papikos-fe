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
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
  }, []);


  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="w-full min-h-[80vh] py-18 bg-transparent px-4">
        <div className="flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto gap-12">
          
          <div className="w-full md:w-1/2 flex flex-col justify-center text-left md:pl-10">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
              Sewa Kos Aman & Mudah <br /> bersama <span className="text-green-700">Papikos</span>
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              {isLoggedIn ? `Selamat datang kembali! Peran Anda: ${localStorage.getItem('role') || 'Tidak diketahui'}` : "Belum punya akun? Daftar sekarang untuk pengalaman terbaik."}
            </p>
            <p className="text-lg text-gray-700 mb-8 max-w-md">
              Platform terpercaya yang mempertemukan penyewa dan pemilik kos dalam satu aplikasi yang praktis dan efisien.
            </p>

            {!isLoggedIn ? (
              <div className="flex flex-wrap gap-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-6 text-lg w-auto"
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-100 px-6 py-6 text-lg w-auto"
                  onClick={() => router.push('/register')}
                >
                  Daftar Sekarang
                </Button>
              </div>
            ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-6 text-base md:text-lg font-medium rounded-md w-fit"
                  onClick={() => {
                    const fiturSection = document.getElementById("about");
                    fiturSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Lihat Fitur Unggulan ↓
                </Button>
            )}
          </div>

          <div className="w-full md:w-1/2 grid grid-cols-2 grid-rows-2 gap-4">
            <div className="col-span-2 row-span-2 h-64 rounded-xl overflow-hidden shadow-lg border-1 border-green-400 hover:border-green-600 transition-all duration-200">
              <img src="/images/hero1.png" alt="Gambar 1" className="w-full h-full object-cover select-none pointer-events-none" />
            </div>

            <div className="col-span-1 row-span-1 h-32 rounded-xl overflow-hidden shadow-md border-1 border-green-400 hover:border-green-600 transition-all duration-200">
              <img src="/images/hero2.png" alt="Gambar 2" className="w-full h-full object-cover select-none pointer-events-none" />
            </div>

            <div className="col-span-1 row-span-1 h-32 rounded-xl overflow-hidden shadow-md border-1 border-green-400 hover:border-green-600 transition-all duration-200">
              <img src="/images/hero3.png" alt="Gambar 3" className="w-full h-full object-cover select-none pointer-events-none" />
            </div>

            <div className="col-span-2 row-span-1 h-32 rounded-xl overflow-hidden shadow-md border-1 border-green-400 hover:border-green-600 transition-all duration-200">
              <img src="/images/hero4.png" alt="Gambar 4" className="w-full h-full object-cover select-none pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-6xl mx-auto bg-green-100 rounded-2xl p-10 shadow-inner mt-20 mb-20">
        <h2  className="text-4xl font-bold text-center text-green-700 mb-8">
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