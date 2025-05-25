"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Filter, X } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  userId: string;
  type: "PAYMENT" | "TOP_UP";
  ownerId?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [showTopUpForm, setShowTopUpForm] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in.");
        router.push("/login");
        return;
      }

      try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(
          `http://localhost:8080/api/transactions/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch transactions.");
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter, dateFromFilter, dateToFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
      if (
        statusFilter !== "all" &&
        transaction.status.toLowerCase() !== statusFilter
      )
        return false;

      const transactionDate = new Date(transaction.createdAt);
      if (dateFromFilter && transactionDate < new Date(dateFromFilter))
        return false;
      if (dateToFilter) {
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59, 999);
        if (transactionDate > toDate) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, statusFilter, dateFromFilter, dateToFilter]);

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage,
  );

  const currentTransactions = useMemo(() => {
    const start = (currentPage - 1) * transactionsPerPage;
    const end = start + transactionsPerPage;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const hasActiveFilters =
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    dateFromFilter ||
    dateToFilter;

  const uniqueStatuses = useMemo(() => {
    return [...new Set(transactions.map((t) => t.status.toLowerCase()))];
  }, [transactions]);

  return (
    <>
      <Header />
      <main className="flex min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 items-center justify-center px-4">
        <div className="w-full max-w-6xl p-8 md:p-12 bg-white rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Your Transactions
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {
                    [
                      typeFilter !== "all",
                      statusFilter !== "all",
                      dateFromFilter,
                      dateToFilter,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Filter Transactions</CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type-filter">Transaction Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="PAYMENT">Payment</SelectItem>
                        <SelectItem value="TOP_UP">Top Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {uniqueStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-from">From Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        id="date-from"
                        value={dateFromFilter}
                        onChange={(e) => setDateFromFilter(e.target.value)}
                        className="pl-10"
                      />
                      <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-to">To Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        id="date-to"
                        value={dateToFilter}
                        onChange={(e) => setDateToFilter(e.target.value)}
                        className="pl-10"
                      />
                      <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-4 text-sm text-gray-600">
            Showing {currentTransactions.length} of{" "}
            {filteredTransactions.length} transactions
            {hasActiveFilters && " (filtered)"}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : currentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {hasActiveFilters
                  ? "No transactions match your filters."
                  : "No transactions found."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="px-4 py-3 text-left">Transaction ID</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={`border-t ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-green-50 transition-colors`}
                      >
                        <td className="px-4 py-3 font-mono text-sm">
                          {transaction.id.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === "PAYMENT"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {transaction.type === "PAYMENT"
                              ? "Payment"
                              : "Top Up"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span
                            className={
                              transaction.type === "PAYMENT"
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {transaction.type === "PAYMENT" ? "-" : "+"}$
                            {transaction.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status.toLowerCase() ===
                                "completed" ||
                              transaction.status.toLowerCase() === "success"
                                ? "bg-green-100 text-green-800"
                                : transaction.status.toLowerCase() === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, index) => (
                    <Button
                      key={index}
                      variant={
                        currentPage === index + 1 ? "default" : "outline"
                      }
                      onClick={() => goToPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="mt-6 space-y-4">
            {!showTopUpForm ? (
              <Button
                onClick={() => setShowTopUpForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Top Up Balance
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="top-up-amount">Amount</Label>
                  <Input
                    id="top-up-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      const userId = localStorage.getItem("userId");

                      if (!token || !userId) {
                        toast.error("You are not logged in.");
                        return;
                      }

                      try {
                        const res = await fetch(
                          "http://localhost:8080/api/transactions/top-up",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              amount: parseFloat(topUpAmount),
                              userId: userId,
                            }),
                          },
                        );

                        if (!res.ok) throw new Error("Top-up failed.");

                        const newTx = await res.json();
                        toast.success("Top-up successful!");
                        setTransactions((prev) => [...prev, newTx]);
                        setTopUpAmount("");
                        setShowTopUpForm(false);
                      } catch (err: unknown) {
                        const errorMessage =
                          err instanceof Error
                            ? err.message
                            : "Terjadi kesalahan yang tidak diketahui";
                        toast.error(errorMessage || "An error occurred.");
                      }
                    }}
                    disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    Confirm Top Up
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTopUpForm(false);
                      setTopUpAmount("");
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
