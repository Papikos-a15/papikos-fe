"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";

interface BookingDetails {
  id: string;
  kosId: string;
  kosName: string;
  kosLocation: string;
  kosImageUrl: string;
  tenantId: string;
  duration: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function BookingConfirmationPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/bookings/${params.bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();
        setBookingDetails(data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Gagal mengambil detail booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [params.bookingId, router]);

  const handlePayment = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/payments/process/${params.bookingId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process payment");
      }

      toast.success("Pembayaran berhasil diproses!");
      router.push("/tenant/bookings");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal memproses pembayaran",
      );
    }
  };

  const handleCancel = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/bookings/${params.bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      toast.success("Booking berhasil dibatalkan!");
      router.push("/booking");
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error("Gagal membatalkan booking");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat detail booking...</div>;
  }

  if (!bookingDetails) {
    return (
      <div className="p-10 text-center">
        <p>Booking tidak ditemukan.</p>
        <Button
          onClick={() => router.push("/booking")}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Kembali ke Daftar Kos
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-8">
        Konfirmasi Booking
      </h1>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Detail Booking</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                bookingDetails.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : bookingDetails.status === "CONFIRMED"
                    ? "bg-green-100 text-green-800"
                    : bookingDetails.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {bookingDetails.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <img
                src={bookingDetails.kosImageUrl || "/images/kos-default.jpg"}
                alt={bookingDetails.kosName}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-green-700 mb-1">
                {bookingDetails.kosName}
              </h3>
              <p className="text-gray-600 mb-4">{bookingDetails.kosLocation}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal Mulai</p>
                  <p className="font-medium">
                    {formatDate(bookingDetails.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tanggal Selesai</p>
                  <p className="font-medium">
                    {formatDate(bookingDetails.endDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Durasi</p>
                  <p className="font-medium">{bookingDetails.duration} bulan</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">ID Booking</p>
                  <p className="font-medium">{bookingDetails.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Pembayaran</p>
                <p className="text-2xl font-bold text-green-700">
                  Rp {bookingDetails.totalPrice.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="space-x-3">
                {bookingDetails.status === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={handleCancel}
                    >
                      Batalkan
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handlePayment}
                    >
                      Bayar Sekarang
                    </Button>
                  </>
                )}
                {bookingDetails.status === "CONFIRMED" && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => router.push("/tenant/bookings")}
                  >
                    Lihat Semua Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/booking")}
          className="text-green-700"
        >
          ← Kembali ke Daftar Kos
        </Button>
      </div>
    </div>
  );
}
