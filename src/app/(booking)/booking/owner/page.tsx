"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";

interface Booking {
  bookingId: string;
  userId: string;
  kosId: string;
  checkInDate: string;
  duration: number;
  status: string;
  fullName: string;
  phoneNumber: string;
  // Additional fields that might be joined from other tables
  kosName?: string;
  kosAddress?: string;
  totalPrice?: number;
}

export default function OwnerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerBookings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role"); // Match login page storage key
        const userId = localStorage.getItem("userId");

        if (!token) {
          router.push("/login");
          return;
        }

        // Check if user is an owner, if not redirect
        if (userRole !== "OWNER") {
          toast.error("Hanya pemilik kos yang dapat mengakses halaman ini");
          router.push("/");
          return;
        }

        // Proceed with fetching bookings for this owner
        const response = await fetch(`${API_URL}/bookings/owner/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Gagal mengambil daftar booking");
        toast.error("Gagal mengambil daftar booking");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerBookings();
  }, [router]);

  const handleApproveBooking = async (bookingId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Memproses persetujuan...");

      const response = await fetch(`${API_URL}/bookings/${bookingId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 403) {
          throw new Error("Booking tidak dapat disetujui (status tidak valid)");
        }
        throw new Error("Gagal menyetujui booking");
      }

      // Get updated booking from response
      const updatedBooking = await response.json();

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === bookingId
            ? { ...booking, status: updatedBooking.status }
            : booking,
        ),
      );

      toast.success("Booking berhasil disetujui!");
    } catch (error) {
      console.error("Error approving booking:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menyetujui booking",
      );
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy");
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat daftar booking...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p>{error}</p>
        <Button
          onClick={() => router.push("/")}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-10 text-center">
        <p>Belum ada booking untuk properti Anda.</p>
        <Button
          onClick={() => router.push("/owner/kos")}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Kelola Properti Kos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-700">
          Konfirmasi Booking Kos
        </h1>
        <Button
          onClick={() => router.push("/owner/kos")}
          className="bg-green-600 hover:bg-green-700"
        >
          Kelola Properti Kos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookings.map((booking) => (
          <Card key={booking.bookingId} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {booking.kosName ||
                      `Kos ID: ${booking.kosId.substring(0, 8)}...`}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "PAID"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">
                  {booking.kosAddress || "Alamat tidak tersedia"}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Check-in</p>
                    <p className="font-medium">
                      {formatDate(booking.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durasi</p>
                    <p className="font-medium">{booking.duration} bulan</p>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Pemesan:</span>{" "}
                    {booking.fullName || "Tidak tersedia"}
                  </p>
                  <p>
                    <span className="font-medium">Telepon:</span>{" "}
                    {booking.phoneNumber || "Tidak tersedia"}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-green-700">
                      {booking.totalPrice
                        ? `Rp ${booking.totalPrice.toLocaleString("id-ID")}`
                        : "Harga tidak tersedia"}
                    </p>
                  </div>

                  <div className="space-x-2">
                    {/* Only show Approve button when status is PAID */}
                    {booking.status === "PAID" && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveBooking(booking.bookingId)}
                      >
                        Setujui Booking
                      </Button>
                    )}

                    {/* Show View Details button for all bookings */}
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/owner/bookings/${booking.bookingId}`)
                      }
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
