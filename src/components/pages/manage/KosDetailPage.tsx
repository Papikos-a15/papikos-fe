"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KosDetail from "@/components/manage/KosDetail";
import { Button } from "@/components/ui/button";

export default function KosDetailPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Akses Terbatas
        </h2>
        <p className="text-gray-600 mb-6">
          Silakan login terlebih dahulu untuk mengelola kos.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <KosDetail />
    </div>
  );
}
