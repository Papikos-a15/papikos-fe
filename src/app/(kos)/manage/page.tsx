"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import ManageKosPage from "@/components/pages/manage/ManageKosPage";

export default function ManagePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // const API_URL = process.env.NEXT_PUBLIC_API_URL;
  }, []);

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center p-10 min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Akses Terbatas
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan login terlebih dahulu untuk mengelola kos.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/login")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Login
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-green-600 text-green-700 hover:bg-green-100"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  } else {
    return (
      <>
        <Header />
        <ManageKosPage />
        <Footer />
      </>
    );
  }
}
