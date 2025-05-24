"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CalendarIcon } from "@radix-ui/react-icons";

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
  fullName?: string;
  phoneNumber?: string;
  monthlyPrice?: number;
}

interface EditableBooking {
  bookingId: string;
  fullName: string;
  phoneNumber: string;
  checkInDate: Date;
  duration: string;
}

interface KosDetail {
  id: string;
  name: string;
  address: string;
  price: number;
  available: boolean;
  description: string;
  ownerId: string;
}

export default function BookingsListPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add state for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<EditableBooking | null>(
    null,
  );

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

        // Fetch kos details for each booking
        const enhancedBookings = await Promise.all(
          data.map(async (booking: Booking) => {
            try {
              // Fetch kos details for this booking
              const kosResponse = await fetch(
                `${API_URL}/management/${booking.kosId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (kosResponse.ok) {
                const kosData: KosDetail = await kosResponse.json();

                // Combine booking with kos details
                return {
                  ...booking,
                  kosName: kosData.name,
                  kosAddress: kosData.address,
                  totalPrice: booking.duration * kosData.price,
                };
              }

              return booking; // Return original booking if kos details fetch fails
            } catch (error) {
              console.error(
                `Error fetching kos details for booking ${booking.bookingId}:`,
                error,
              );
              return booking; // Return original booking if kos details fetch fails
            }
          }),
        );

        setBookings(enhancedBookings);
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

  const handleOpenEditModal = (booking: Booking) => {
    setEditingBooking({
      bookingId: booking.bookingId,
      fullName: booking.fullName || "",
      phoneNumber: booking.phoneNumber || "",
      checkInDate: new Date(booking.checkInDate),
      duration: booking.duration.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handlePayment = async (bookingId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Memproses pembayaran...");

      const response = await fetch(`${API_URL}/bookings/${bookingId}/pay`, {
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
          throw new Error("Booking tidak dapat dibayar (status tidak valid)");
        }
        throw new Error("Gagal melakukan pembayaran");
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

      toast.success("Pembayaran berhasil!");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal melakukan pembayaran",
      );
    }
  };

  // Add function to handle edit form submission
  const handleSaveEdit = async () => {
    if (!editingBooking) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Find the original booking to get all its properties
      const originalBooking = bookings.find(
        (b) => b.bookingId === editingBooking.bookingId,
      );
      if (!originalBooking) {
        toast.error("Booking tidak ditemukan");
        return;
      }

      // Create a complete booking object for the PUT request
      const updateData = {
        // Keep the original ID and required fields
        bookingId: editingBooking.bookingId,
        userId: originalBooking.userId,
        kosId: originalBooking.kosId,
        status: originalBooking.status,

        // Update the fields from the form
        fullName: editingBooking.fullName,
        phoneNumber: editingBooking.phoneNumber,
        checkInDate: editingBooking.checkInDate.toISOString().split("T")[0],
        duration: parseInt(editingBooking.duration),
        monthlyPrice: originalBooking.monthlyPrice || 0,
      };

      // Use PUT method instead of PATCH
      const response = await fetch(
        `${API_URL}/bookings/${editingBooking.bookingId}`,
        {
          method: "PUT", // Changed from PATCH to PUT
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        // Handle specific error status codes
        if (response.status === 403) {
          throw new Error("Booking sudah disetujui dan tidak dapat diubah");
        }
        throw new Error("Gagal memperbarui booking");
      }

      // Update the local state to reflect the changes
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === editingBooking.bookingId
            ? {
              ...booking,
              fullName: editingBooking.fullName,
              phoneNumber: editingBooking.phoneNumber,
              checkInDate: editingBooking.checkInDate
                .toISOString()
                .split("T")[0],
              duration: parseInt(editingBooking.duration),
              totalPrice:
                parseInt(editingBooking.duration) * updateData.monthlyPrice,
            }
            : booking,
        ),
      );

      toast.success("Booking berhasil diperbarui!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui booking",
      );
    }
  };

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
                    className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === "PENDING"
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

                    {/* Add booking contact information */}
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Pemesan:</span>{" "}
                        {booking.fullName || "Tidak tersedia"}
                      </p>
                      <p>
                        <span className="font-medium">Telepon:</span>{" "}
                        {booking.phoneNumber || "Tidak tersedia"}
                      </p>
                    </div>
                  </div>

                  <div className="space-x-2">
                    {/* Only show Pay button when status is PENDING_PAYMENT */}
                    {booking.status === "PENDING_PAYMENT" && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handlePayment(booking.bookingId)}
                      >
                        Bayar
                      </Button>
                    )}

                    {/* Only show Edit button when status is PAID or PENDING_PAYMENT */}
                    {(booking.status === "PAID" ||
                      booking.status === "PENDING_PAYMENT") && (
                        <Button
                          variant="outline"
                          onClick={() => handleOpenEditModal(booking)}
                        >
                          Edit
                        </Button>
                      )}

                    {/* Only show Delete button when status is PAID or PENDING_PAYMENT */}
                    {(booking.status === "PAID" ||
                      booking.status === "PENDING_PAYMENT") && (
                        <Button
                          variant="outline"
                          className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white"
                          onClick={() => handleCancelBooking(booking.bookingId)}
                        >
                          Hapus
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Perbarui detail booking anda di sini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Nama
              </Label>
              <Input
                id="fullName"
                value={editingBooking?.fullName || ""}
                onChange={(e) =>
                  setEditingBooking((prev) =>
                    prev ? { ...prev, fullName: e.target.value } : null,
                  )
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Telepon
              </Label>
              <Input
                id="phoneNumber"
                value={editingBooking?.phoneNumber || ""}
                onChange={(e) =>
                  setEditingBooking((prev) =>
                    prev ? { ...prev, phoneNumber: e.target.value } : null,
                  )
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Durasi</Label>
              <div className="col-span-3">
                <Select
                  value={editingBooking?.duration || "1"}
                  onValueChange={(value) =>
                    setEditingBooking((prev) =>
                      prev ? { ...prev, duration: value } : null,
                    )
                  }
                >
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
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Check-in</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingBooking?.checkInDate ? (
                        format(editingBooking.checkInDate, "PPP")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingBooking?.checkInDate}
                      onSelect={(date) =>
                        setEditingBooking((prev) =>
                          prev && date ? { ...prev, checkInDate: date } : prev,
                        )
                      }
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
