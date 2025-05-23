'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PaymentsPage() {
    const router = useRouter()
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                toast.error("You are not logged in.")
                router.push("/login")
                return
            }

            try {
                const userId = sessionStorage.getItem("userId");
                console.log('token:', token);
                console.log('UserId:', userId);
                const res = await fetch(`http://localhost:8080/api/transactions/user/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })

                if (!res.ok) {
                    throw new Error("Failed to fetch transactions.")
                }

                const data = await res.json()
                setTransactions(data)
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message)
                } else {
                    toast.error("An unknown error occurred.")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [router])

    return (
        <main className="flex min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 items-center justify-center px-4">
            <div className="w-full max-w-4xl p-8 md:p-12 bg-white rounded-xl shadow-xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Transactions</h2>

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center">No transactions found.</div>
                ) : (
                    <table className="w-full table-auto border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                <th className="px-4 py-2">Transaction ID</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction: any) => (
                                <tr key={transaction.id} className="border-t">
                                    <td className="px-4 py-2">{transaction.id}</td>
                                    <td className="px-4 py-2">{transaction.amount}</td>
                                    <td className="px-4 py-2">{new Date(transaction.date).toLocaleString()}</td>
                                    <td className="px-4 py-2">{transaction.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="mt-6">
                    <Button onClick={() => router.push("/profile")} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Back to Profile
                    </Button>
                </div>
            </div>
        </main>
    )
}
