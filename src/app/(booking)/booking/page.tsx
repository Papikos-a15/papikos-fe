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
  // Additional fields that might be joined from other tables
  kosName?: string;
  kosAddress?: string;
  totalPrice?: number;
}

export default function BookingsListPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/bookings`, {
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
        console.error("Error fetching bookings:", error);
        setError("Gagal mengambil daftar booking");
        toast.error("Gagal mengambil daftar booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      // Update the local state to reflect the cancellation
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === bookingId
            ? { ...booking, status: "CANCELLED" }
            : booking,
        ),
      );

      toast.success("Booking berhasil dibatalkan!");
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error("Gagal membatalkan booking");
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
          onClick={() => router.push("/booking")}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Cari Kos
        </Button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-10 text-center">
        <p>Anda belum memiliki booking.</p>
        <Button
          onClick={() => router.push("/booking")}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Cari Kos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-700">Daftar Booking</h1>
        <Button
          onClick={() => router.push("/booking")}
          className="bg-green-600 hover:bg-green-700"
        >
          Cari Kos Baru
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
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/tenant/bookings/${booking.bookingId}`)
                      }
                    >
                      Detail
                    </Button>

                    {booking.status === "PENDING" && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking.bookingId)}
                      >
                        Batalkan
                      </Button>
                    )}

                    {booking.status === "PENDING" && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          router.push(
                            `/booking/confirmation/${booking.bookingId}`,
                          )
                        }
                      >
                        Bayar
                      </Button>
                    )}
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
