"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { UUID } from "crypto";

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

export default function WishlistPage() {
  const router = useRouter();
  const [kosListings, setKosListings] = useState<KosListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<UUID | null>(null); // Assuming user ID will be stored or fetched

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setUserId(localStorage.getItem("userId") as UUID); // Assuming you store user ID in localStorage

    const fetchKosWishlist = async () => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const response = await fetch(`${API_URL}/wishlists/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Log the raw response for debugging
    const rawResponse = await response.text();
    console.log("Raw response:", rawResponse);

    // Check if the response is ok (status 200-299)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    // Parse the JSON only if the response is not empty
    const data = rawResponse ? JSON.parse(rawResponse) : [];
    setKosListings(data);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    toast.error("Gagal mengambil data wishlist");
  } finally {
    setLoading(false);
  }
};

    fetchKosWishlist();
  }, [userId]);

  const handleViewDetails = (kosId: string) => {
    router.push(`/booking/${kosId}`);
  };

  const handleAddToWishlist = async (kosId: string) => {
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/wishlists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          kosId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to wishlist");
      }

      const data = await response.json();
      toast.success(data.message);
      setKosListings((prev) => [
      ...prev,
      {
        id: kosId,
        name: "", // Placeholder or you can fill this with the kos data if available
        location: "",
        price: 0,
        availability: 0,
        facilities: [],
        imageUrl: "",
        description: "",
      },
    ]);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Gagal menambahkan ke wishlist");
    }
  };

  const handleRemoveFromWishlist = async (kosId: string) => {
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/wishlists/${kosId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      const data = await response.json();
      toast.success(data.message);
      setKosListings((prev) =>
        prev.filter((kos) => kos.id !== kosId)
      ); // Remove from state
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Gagal menghapus dari wishlist");
    }
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
            Silakan login terlebih dahulu untuk melihat wishlist.
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
        <div className="p-10 text-center">Memuat data wishlist...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6 min-h-screen">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Wishlist Anda</h1>

        {kosListings.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Wishlist Anda kosong.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kosListings.map((kos) => (
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
                  {/* <p className="text-gray-600 mb-2">{kos.location}</p>
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
                  </div> */}
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleViewDetails(kos.id)}
                  >
                    Lihat Detail
                  </Button>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 mt-2"
                    onClick={() => handleRemoveFromWishlist(kos.id)}
                  >
                    Hapus dari Wishlist
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
