"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { FaHeart } from "react-icons/fa";
import { UUID } from "crypto";

interface KosListing {
  id: string;
  name: string;
  address: string;
  price: number;
  availableRooms: number;
  facilities: string[];
  imageUrl: string;
  description: string;
}

interface WishlistItem {
  kosId: string;
  userId: string;
  id: UUID;
}

export default function KosListingPage() {
  const router = useRouter();
  const [kosListings, setKosListings] = useState<KosListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userWishlist, setUserWishlist] = useState<WishlistItem[]>([]);

  const fetchKosListings = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add name search if searchTerm exists
      if (searchTerm.trim()) {
        queryParams.append("name", searchTerm.trim());
      }

      // Add location filter if exists
      if (locationFilter.trim()) {
        queryParams.append("location", locationFilter.trim());
      }

      // Add availability filter
      if (availabilityFilter === "available") {
        queryParams.append("availability", "true");
      } else if (availabilityFilter === "unavailable") {
        queryParams.append("availability", "false");
      }

      // Add price range filter
      if (priceFilter !== "all") {
        if (priceFilter === "low") {
          queryParams.append("minPrice", "0");
          queryParams.append("maxPrice", "1000000");
        } else if (priceFilter === "medium") {
          queryParams.append("minPrice", "1000000");
          queryParams.append("maxPrice", "2000000");
        } else if (priceFilter === "high") {
          queryParams.append("minPrice", "2000000");
          queryParams.append("maxPrice", "200000000");
        }
      }

      // Use search endpoint if there are filters, otherwise use list endpoint
      const endpoint = queryParams.toString()
        ? `/management/search?${queryParams.toString()}`
        : "/management/list";

      console.log("Fetching from:", `${API_URL}${endpoint}`);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Token tidak valid atau kadaluarsa");
          // setIsLoggedIn(false);
          return;
        }
        throw new Error("Failed to fetch kos listings");
      }

      const data = await response.json();
      setKosListings(data);

      // Fetch Wishlist of logged-in user
      const userId = localStorage.getItem("userId");
      if (userId) {
        const wishlistResponse = await fetch(
          `${API_URL}/wishlists/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (wishlistResponse.status === 204) {
          setUserWishlist([]);
        } else if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          setUserWishlist(wishlistData);
        }
      }
    } catch (error) {
      console.error("Error fetching kos listings:", error);
      toast.error("Gagal mengambil data kos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      fetchKosListings();
    }
  }, []);

  // Effect to handle search and filter changes with debouncing
  useEffect(() => {
    if (!isLoggedIn) return;

    const timeoutId = setTimeout(() => {
      fetchKosListings();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, priceFilter, locationFilter, availabilityFilter, isLoggedIn]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setPriceFilter("all");
    setAvailabilityFilter("all");
  };

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

  const handleAddToWishlist = async (kosId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        toast.error("Token atau User ID tidak tersedia");
        return;
      }

      const response = await fetch(`${API_URL}/wishlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, kosId }),
      });

      if (response.ok) {
        // const wishlistData = await response.json();
        toast.success("Kos berhasil ditambahkan ke wishlist");

        const wishlistResponse = await fetch(
          `${API_URL}/wishlists/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (wishlistResponse.status === 204) {
          setUserWishlist([]);
        } else {
          const wishlistData = await wishlistResponse.json();
          setUserWishlist(wishlistData);
        }
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message || "Gagal menambahkan kos ke wishlist";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Terjadi kesalahan saat menambahkan ke wishlist");
    }
  };

  const handleRemoveFromWishlist = async (kosId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        toast.error("Token atau User ID tidak tersedia");
        return;
      }

      const wishlistItem = userWishlist.find((item) => item.kosId === kosId);
      if (!wishlistItem) {
        toast.error("Kos tidak ada di wishlist");
        return;
      }

      const response = await fetch(`${API_URL}/wishlists/${wishlistItem.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Kos berhasil dihapus dari wishlist");

        setUserWishlist((prev) => prev.filter((item) => item.kosId !== kosId));
      } else {
        toast.error("Gagal menghapus kos dari wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Terjadi kesalahan saat menghapus dari wishlist");
    }
  };

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

      const response = await fetch(`${API_URL}/management/search`, {
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

        {/* Enhanced Filter Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search by Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Nama Kos
              </label>
              <Input
                type="text"
                placeholder="Nama kos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <Input
                type="text"
                placeholder="Lokasi kos..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rentang Harga
              </label>
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

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ketersediaan
              </label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="available">Tersedia</option>
                <option value="unavailable">Tidak Tersedia</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="text-sm border-gray-400 text-gray-600 hover:bg-gray-100"
            >
              Hapus Semua Filter
            </Button>
          </div>
        </div>

        {/* Results */}
        {kosListings.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {searchTerm ||
              locationFilter ||
              priceFilter !== "all" ||
              availabilityFilter !== "all"
                ? "Tidak ada kos yang sesuai dengan pencarian Anda."
                : "Belum ada data kos tersedia."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Menampilkan {kosListings.length} kos
                {(searchTerm ||
                  locationFilter ||
                  priceFilter !== "all" ||
                  availabilityFilter !== "all") &&
                  " sesuai filter"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kosListings.map((kos) => {
                const isInWishlist = userWishlist.some(
                  (wishlist) => wishlist.kosId === kos.id,
                );
                return (
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
                      <p className="text-gray-600 mb-2">{kos.address}</p>
                      <p className="text-lg font-bold mb-2">
                        Rp {kos.price.toLocaleString("id-ID")}/bulan
                      </p>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {kos.description}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        Kamar tersedia: {kos.availableRooms || "Tidak tersedia"}
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
                      <div className="flex gap-4">
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleViewDetails(kos.id)}
                        >
                          Lihat Detail
                        </Button>
                        <Button
                          className={`w-full ${
                            isInWishlist
                              ? "bg-red-600 text-white"
                              : "bg-white border-2 border-red-600 text-red-600"
                          }`}
                          onClick={() =>
                            isInWishlist
                              ? handleRemoveFromWishlist(kos.id)
                              : handleAddToWishlist(kos.id)
                          }
                        >
                          <FaHeart
                            className={`inline-block ${
                              isInWishlist
                                ? "text-white"
                                : "border-red-600 text-red-600"
                            }`}
                            style={{ width: "20px", height: "20px" }}
                          />
                          <span className="ml-2">Wishlist</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
