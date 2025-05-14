"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface KosListing {
  id: string;
  name: string;
  location: string;
  price: number;
  availability: number;
  facilities: string[];
  imageUrl: string;
  description: string;
}

export default function KosListingPage() {
  const router = useRouter();
  const [kosListings, setKosListings] = useState<KosListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchKosListings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/management/list`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Token tidak valid atau kadaluarsa");
            setIsLoggedIn(false);
            return;
          }
          throw new Error("Failed to fetch kos listings");
        }

        const data = await response.json();
        setKosListings(data);
      } catch (error) {
        console.error("Error fetching kos listings:", error);
        toast.error("Gagal mengambil data kos");
      } finally {
        setLoading(false);
      }
    };

    fetchKosListings();
  }, []);

  const filteredKosListings = kosListings.filter((kos) => {
    const matchesSearch =
      kos.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kos.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kos.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (priceFilter === "all") return matchesSearch;
    if (priceFilter === "low" && kos.price <= 1000000) return matchesSearch;
    if (priceFilter === "medium" && kos.price > 1000000 && kos.price <= 2000000)
      return matchesSearch;
    if (priceFilter === "high" && kos.price > 2000000) return matchesSearch;

    return false;
  });

  const handleViewDetails = (kosId: string) => {
    router.push(`/booking/${kosId}`);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center p-10 min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Akses Terbatas
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan login terlebih dahulu untuk melihat daftar kos.
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
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-10 text-center">Memuat data kos...</div>
        <Footer />
      </>
    );
  }

  const testConnection = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      toast.info("Mencoba koneksi ke API...");

      const response = await fetch(`${API_URL}/management/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`Koneksi berhasil! Status: ${response.status}`);
        const data = await response.json();
        console.log("Sample data:", data.slice(0, 2));
      } else {
        toast.error(`Koneksi gagal. Status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error: ${errorMessage}`);
      console.error("Connection test error:", error);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">
            Temukan Kos Impianmu
          </h1>
          <Button
            variant="outline"
            onClick={testConnection}
            className="text-sm border-green-600 text-green-700 hover:bg-green-100"
          >
            Test Koneksi API
          </Button>
        </div>
        <p className="text-gray-600 mb-6">
          Tersedia berbagai pilihan kos dengan berbagai harga dan fasilitas
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-2/3">
            <Input
              type="text"
              placeholder="Cari berdasarkan nama, lokasi, atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="md:w-1/3">
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">Semua Harga</option>
              <option value="low">Di bawah 1 juta</option>
              <option value="medium">1 - 2 juta</option>
              <option value="high">Di atas 2 juta</option>
            </select>
          </div>
        </div>

        {filteredKosListings.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Tidak ada kos yang sesuai dengan pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKosListings.map((kos) => (
              <Card
                key={kos.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={kos.imageUrl || "/images/kos-default.jpg"}
                    alt={kos.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold text-green-700">
                    {kos.name}
                  </h2>
                  <p className="text-gray-600 mb-2">{kos.location}</p>
                  <p className="text-lg font-bold mb-2">
                    Rp {kos.price.toLocaleString("id-ID")}/bulan
                  </p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {kos.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Kamar tersedia: {kos.availability || "Tidak tersedia"}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {kos.facilities?.slice(0, 3).map((facility, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {facility}
                      </span>
                    ))}
                    {kos.facilities?.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        +{kos.facilities.length - 3} lainnya
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleViewDetails(kos.id)}
                  >
                    Lihat Detail
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
