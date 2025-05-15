"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { use } from "react";

interface KosDetail {
  id: string;
  ownerId: string; // UUID of the owner
  tenantId: string | null; // UUID of tenant, can be null if not rented
  name: string;
  address: string; // This is the correct field name from backend
  description: string;
  price: number;
  available: boolean; // Changed from availability (number) to available (boolean)
}

export default function KosDetailPage({
  params,
}: {
  params: { kosId: string };
}) {
  const resolvedParams = use(params);
  const kosId = resolvedParams.kosId;
  // const kosId = params.kosId;
  const router = useRouter();
  const [kosDetail, setKosDetail] = useState<KosDetail | null>(null);
  const [loading, setLoading] = useState(true);
  // const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [duration, setDuration] = useState("1");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

  const fetchOwnerEmail = async (ownerId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token || !ownerId) return;

      const response = await fetch(`${API_URL}/owners/${ownerId}/email`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const email = await response.text();
        setOwnerEmail(email);
      } else {
        console.error("Failed to fetch owner email");
        setOwnerEmail("Email tidak tersedia");
      }
    } catch (error) {
      console.error("Error fetching owner email:", error);
      setOwnerEmail("Error saat mengambil email");
    }
  };

  useEffect(() => {
    const fetchKosDetail = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/management/${kosId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch kos details");
        }

        const data = await response.json();
        setKosDetail(data);
      } catch (error) {
        console.error("Error fetching kos details:", error);
        toast.error("Gagal mengambil detail kos");
      } finally {
        setLoading(false);
      }
    };

    fetchKosDetail();
  }, [kosId, router]);

  useEffect(() => {
    if (kosDetail?.ownerId) {
      fetchOwnerEmail(kosDetail.ownerId);
    }
  }, [kosDetail]);

  const handleBooking = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Check if userId exists
      if (!userId) {
        toast.error("User ID tidak ditemukan. Silakan login kembali.");
        router.push("/login");
        return;
      }

      if (!token) {
        router.push("/login");
        return;
      }

      const bookingData = {
        kosId: kosId,
        duration: parseInt(duration),
        startDate: startDate.toISOString().split("T")[0],
        userId: userId,
      };

      //debug
      console.log("Sending booking data:", bookingData);

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book kos");
      }

      const data = await response.json();
      toast.success("Booking berhasil dibuat!");
      router.push(`/booking/confirmation/${data.id}`);
    } catch (error) {
      console.error("Error booking kos:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal melakukan booking",
      );
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat detail kos...</div>;
  }

  if (!kosDetail) {
    return (
      <div className="p-10 text-center">
        <p>Kos tidak ditemukan.</p>
        <Button
          onClick={() => router.push("/booking")}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Kembali ke Daftar Kos
        </Button>
      </div>
    );
  }

  const totalPrice = kosDetail.price * parseInt(duration);
  console.log(kosDetail.available);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button
        variant="outline"
        onClick={() => router.push("/booking")}
        className="mb-6"
      >
        ← Kembali ke Daftar Kos
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kiri: Gambar dan Detail */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="h-96 overflow-hidden rounded-lg mb-2">
              <img
                src="/images/kos-default.jpg"
                alt={kosDetail.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-green-700 mb-2">
            {kosDetail.name}
          </h1>
          <p className="text-gray-600 mb-4">{kosDetail.address}</p>

          <h2 className="text-xl font-semibold mb-2">Deskripsi</h2>
          <p className="text-gray-700 mb-6">{kosDetail.description}</p>

          <h2 className="text-xl font-semibold mb-2">Informasi Pemilik</h2>
          <p className="text-gray-700 mb-6">
            Email: {ownerEmail || "Memuat..."}
          </p>
        </div>

        {/* Kanan: Booking Form */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Booking Kos</h2>

              <p className="text-2xl font-bold text-green-700 mb-6">
                Rp {kosDetail.price.toLocaleString("id-ID")}/bulan
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Status:{" "}
                {kosDetail.available ? (
                  <span className="text-green-600 font-medium">Tersedia</span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Tidak tersedia
                  </span>
                )}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Durasi (bulan)
                  </label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih durasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bulan</SelectItem>
                      <SelectItem value="3">3 Bulan</SelectItem>
                      <SelectItem value="6">6 Bulan</SelectItem>
                      <SelectItem value="12">12 Bulan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tanggal Mulai
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Harga per bulan</span>
                  <span>Rp {kosDetail.price.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Durasi</span>
                  <span>{duration} bulan</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!kosDetail.available}
                onClick={handleBooking}
              >
                {!kosDetail.available ? "Kos Tidak Tersedia" : "Pesan Sekarang"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
