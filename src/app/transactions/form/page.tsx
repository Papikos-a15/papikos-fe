"use client";

import { useState } from "react";

export default function CreatePaymentPage() {
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpMessage, setTopUpMessage] = useState("");

  const handleTopUpSubmit = async () => {
    const payload = {
      amount: parseFloat(topUpAmount),
    };

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8080/api/transactions/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Gagal membuat top-up");
      }

      const data = await res.json();

      setTopUpMessage("✅ Top-up berhasil dibuat dengan ID: " + data.id);
      setTopUpAmount("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui";
      setTopUpMessage("❌ Error: " + errorMessage);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Top-up Saldo</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-green-600">
          Top-up Saldo
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Jumlah Top-up (Rp)</label>
            <input
              type="number"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="0"
              min="1"
              step="0.01"
            />
          </div>

          <button
            onClick={handleTopUpSubmit}
            disabled={!topUpAmount}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Top-up Saldo
          </button>
        </div>

        {topUpMessage && (
          <div
            className={`mt-4 p-3 rounded-md ${
              topUpMessage.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {topUpMessage}
          </div>
        )}
      </div>
    </main>
  );
}
