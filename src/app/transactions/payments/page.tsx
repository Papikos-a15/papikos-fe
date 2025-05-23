"use client";

import { useState } from "react";

export default function CreatePaymentPage() {
    const [userId, setUserId] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            userId,
            ownerId,
            amount: parseFloat(amount),
        };

        try {
            const res = await fetch("http://localhost:8080/api/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Gagal membuat payment");

            const data = await res.json();
            setMessage("✅ Payment berhasil dibuat dengan ID: " + data.id);
            setUserId("");
            setOwnerId("");
            setAmount("");
        } catch (err: any) {
            setMessage("❌ Error: " + err.message);
        }
    };

    return (
        <main className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Buat Pembayaran</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">User ID</label>
                    <input
                        type="text"
                        className="w-full border px-3 py-2 rounded"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1">Owner ID</label>
                    <input
                        type="text"
                        className="w-full border px-3 py-2 rounded"
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1">Jumlah (Rp)</label>
                    <input
                        type="number"
                        className="w-full border px-3 py-2 rounded"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Submit
                </button>
            </form>

            {message && <p className="mt-4 text-sm">{message}</p>}
        </main>
    );
}
