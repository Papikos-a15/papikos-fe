"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { FaHeart } from "react-icons/fa";

interface WishlistItem {
  id: string;
  kosId: string;
  name: string;
  location: string;
  price: number;
  availability: number;
  imageUrl: string;
  description: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const userId = localStorage.getItem("userId");

        if (!userId) {
          toast.error("User ID not found");
          return;
        }

        // Fetch the wishlist (IDs of the kos in the wishlist)
        const response = await fetch(`${API_URL}/wishlists/user/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok && response.status !== 204) {
          throw new Error("Failed to fetch wishlist");
        }

        if (response.status !== 204) {
          const data = await response.json();
          // Fetch details for each kos in the wishlist
          const wishlistWithDetails = await Promise.all(
            data.map(async (wishlistItem: { id: string; kosId: string }) => {
              const kosResponse = await fetch(
                `${API_URL}/management/${wishlistItem.kosId}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!kosResponse.ok) {
                throw new Error("Failed to fetch kos details");
              }

              const kosData = await kosResponse.json();
              return {
                ...wishlistItem,
                name: kosData.name,
                location: kosData.address, // assuming 'address' is the location
                price: kosData.price,
                description: kosData.description,
                availability: kosData.availableRooms,
                imageUrl: "", // You can add the image URL if available in your data
              };
            }),
          );

          setWishlist(wishlistWithDetails);
        } else {
          toast.error("No wishlist data available");
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Gagal mengambil data wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Token tidak valid");
        return;
      }

      const response = await fetch(`${API_URL}/wishlists/${wishlistId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.id !== wishlistId),
        );
        toast.success("Kos berhasil dihapus dari wishlist");
      } else {
        throw new Error("Gagal menghapus kos dari wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Gagal menghapus kos dari wishlist");
    }
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
            Silakan login terlebih dahulu untuk melihat wishlist Anda.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Login
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-10 text-center">Memuat wishlist...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6 min-h-screen">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Wishlist Kos Anda
        </h1>
        {wishlist.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Anda belum memiliki kos di wishlist.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((kos) => (
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
                    Rp{" "}
                    {kos.price
                      ? kos.price.toLocaleString("id-ID")
                      : "Harga tidak tersedia"}
                    /bulan
                  </p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {kos.description}
                  </p>
                  <div className="flex gap-4">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleViewDetails(kos.kosId)}
                    >
                      Lihat Detail
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-red-600 text-white"
                      onClick={() => handleRemoveFromWishlist(kos.id)}
                    >
                      <FaHeart
                        className="inline-block text-white"
                        style={{ width: "20px", height: "20px" }}
                      />
                      <span className="ml-2">Hapus Wishlist</span>
                    </Button>
                  </div>
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
