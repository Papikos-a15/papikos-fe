"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface PaymentDetails {
  bookingId: string;
  amount: number;
  kosName: string;
}

// Helper function untuk error handling
// const getErrorMessage = (error: unknown): string => {
//   if (error instanceof Error) return error.message;
//   if (typeof error === 'string') return error;
//   return "Terjadi kesalahan yang tidak diketahui";
// };

// Pisahkan component yang menggunakan useSearchParams
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    if (!bookingId) {
      toast.error("ID booking tidak valid");
      router.push("/booking");
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();
        setPaymentDetails({
          bookingId: data.id,
          amount: data.totalPrice,
          kosName: data.kosName,
        });
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error("Gagal mengambil detail pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [bookingId, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      toast.success("Pembayaran berhasil!");
      router.push("/booking");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Gagal memproses pembayaran");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat detail pembayaran...</div>;
  }

  if (!paymentDetails) {
    return (
      <div className="p-10 text-center">
        <p>Detail pembayaran tidak ditemukan.</p>
        <Button
          onClick={() => router.push("/booking")}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Kembali ke Daftar Booking
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Pembayaran</h1>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Detail Pembayaran</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Kos</span>
              <span className="font-medium">{paymentDetails.kosName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID Booking</span>
              <span className="font-medium">{paymentDetails.bookingId}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="font-bold text-green-700">
                Rp {paymentDetails.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="border-t pt-6">
            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                    <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "credit_card" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="cardNumber">Nomor Kartu</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardName">Nama Pemilik Kartu</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Tanggal Kadaluarsa</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "bank_transfer" && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">Instruksi Pembayaran:</p>
                  <ol className="list-decimal list-inside text-sm text-gray-600">
                    <li>Transfer ke rekening Bank BCA: 1234567890</li>
                    <li>Atas nama: PT Papikos Indonesia</li>
                    <li>
                      Jumlah: Rp {paymentDetails.amount.toLocaleString("id-ID")}
                    </li>
                    <li>
                      Cantumkan ID booking ({paymentDetails.bookingId}) pada
                      keterangan transfer
                    </li>
                  </ol>
                </div>
              )}

              {paymentMethod === "ewallet" && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">Pilih E-Wallet:</p>
                  <div className="flex gap-4 mt-2">
                    <div className="border rounded p-3 cursor-pointer hover:border-green-500 flex items-center justify-center">
                      <Image
                        src="/images/gopay.png"
                        alt="GoPay"
                        width={64}
                        height={32}
                      />
                    </div>
                    <div className="border rounded p-3 cursor-pointer hover:border-green-500 flex items-center justify-center">
                      <Image
                        src="/images/ovo.png"
                        alt="OVO"
                        width={64}
                        height={32}
                      />
                    </div>
                    <div className="border rounded p-3 cursor-pointer hover:border-green-500 flex items-center justify-center">
                      <Image
                        src="/images/dana.png"
                        alt="DANA"
                        width={64}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Bayar Sekarang
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => router.push(`/booking`)}
          className="text-green-700"
        >
          ← Kembali ke Detail Booking
        </Button>
      </div>
    </div>
  );
}

// Loading component untuk Suspense fallback
function PaymentLoading() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded-md mb-8"></div>
        <div className="h-64 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
}

// Main component dengan Suspense wrapper
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
