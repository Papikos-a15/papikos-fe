"use client";
"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Calendar,
  Filter,
  X,
  Wallet,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/layout/header";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  userId: string;
  type: "PAYMENT" | "TOP_UP";
  ownerId?: string;
}

interface WalletResponse {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [showTopUpForm, setShowTopUpForm] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchWallet = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Handle non-authenticated case silently or redirect
        return;
      }

      setWalletLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        setCurrentUserId(userId || "");

        const res = await fetch(`${API_URL}/wallets/user/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch wallet.");
        const data = await res.json();
        setWallet(data);
        localStorage.setItem("walletBalance", data.balance.toString());
      } catch (error) {
        console.error("Wallet fetch error:", error);
      } finally {
        setWalletLoading(false);
      }
    };

    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Handle non-authenticated case silently or redirect
        setLoading(false);
        return;
      }

      const userId = localStorage.getItem("userId");
      setCurrentUserId(userId || "");

      try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(`${API_URL}/transactions/user/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions.");
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Transactions fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
    fetchTransactions();
  }, [API_URL]);

  const fetchWalletBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setWalletLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`${API_URL}/wallets/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch wallet.");
      const data = await res.json();
      setWallet(data);
      localStorage.setItem("walletBalance", data.balance.toString());
    } catch (error) {
      console.error("Wallet refresh error:", error);
    } finally {
      setWalletLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter, dateFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
      if (
        statusFilter !== "all" &&
        transaction.status.toLowerCase() !== statusFilter
      )
        return false;

      if (dateFilter) {
        const selectedDateStart = new Date(dateFilter);
        selectedDateStart.setHours(0, 0, 0, 0);

        const selectedDateEnd = new Date(dateFilter);
        selectedDateEnd.setHours(23, 59, 59, 999);

        const transactionDate = new Date(transaction.createdAt);

        if (
          transactionDate < selectedDateStart ||
          transactionDate > selectedDateEnd
        ) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, statusFilter, dateFilter]);

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
    setDateFilter("");
    setDateToFilter("");
  };

  const hasActiveFilters =
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    dateFilter ||
    dateToFilter;

  const uniqueStatuses = useMemo(() => {
    return [...new Set(transactions.map((t) => t.status.toLowerCase()))];
  }, [transactions]);

  const isReceivingPayment = (transaction: Transaction): boolean => {
    return (
      transaction.type === "PAYMENT" && transaction.ownerId === currentUserId
    );
  };

  const getTransactionDisplay = (transaction: Transaction) => {
    if (transaction.type === "TOP_UP") {
      return {
        isPositive: true,
        color: "text-green-600",
        bgColor: "bg-green-100 text-green-800",
        sign: "+",
        label: "Top Up",
      };
    } else if (transaction.type === "PAYMENT") {
      const isReceiving = isReceivingPayment(transaction);
      return {
        isPositive: isReceiving,
        color: isReceiving ? "text-green-600" : "text-red-600",
        bgColor: isReceiving
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800",
        sign: isReceiving ? "+" : "-",
        label: isReceiving ? "Payment Received" : "Payment",
      };
    }
    return {
      isPositive: false,
      color: "text-gray-600",
      bgColor: "bg-gray-100 text-gray-800",
      sign: "",
      label: "Unknown",
    };
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/transactions/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(topUpAmount),
          userId: userId,
        }),
      });

      if (!res.ok) throw new Error("Top-up failed.");

      const newTransaction = await res.json();

      // Add new transaction to the list
      setTransactions((prev) => [newTransaction, ...prev]);

      // Refresh wallet balance
      await fetchWalletBalance();

      setTopUpAmount("");
      setShowTopUpForm(false);
    } catch (error) {
      console.error("Top-up error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <Header />

      {/* Main Content */}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Wallet Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Wallet className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm font-medium">
                    Saldo Anda
                  </p>
                  <div className="flex items-center space-x-3">
                    {showBalance ? (
                      <p className="text-3xl font-bold">
                        {wallet ? formatCurrency(wallet.balance) : "Loading..."}
                      </p>
                    ) : (
                      <p className="text-3xl font-bold">Rp ••••••••</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      {showBalance ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchWalletBalance}
                  disabled={walletLoading}
                  className="text-white hover:bg-white/20"
                >
                  {walletLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                {!showTopUpForm && (
                  <Button
                    onClick={() => setShowTopUpForm(true)}
                    className="bg-white text-emerald-600 hover:bg-gray-100"
                  >
                    Top Up
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Up Form */}
        {showTopUpForm && (
          <Card className="mb-6 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Top Up Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="top-up-amount">Amount (IDR)</Label>
                  <Input
                    id="top-up-amount"
                    type="number"
                    placeholder="Enter amount in Rupiah"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="text-lg"
                  />
                  {topUpAmount && (
                    <p className="text-sm text-gray-600 mt-1">
                      You will add:{" "}
                      {formatCurrency(parseFloat(topUpAmount) || 0)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleTopUp}
                    disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                    className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  >
                    Confirm Top Up
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTopUpForm(false);
                      setTopUpAmount("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Section */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-gray-900">
                Riwayat Transaksi
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1 ml-1">
                    {
                      [
                        typeFilter !== "all",
                        statusFilter !== "all",
                        dateFilter,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Filters */}
            {showFilters && (
              <Card className="mb-6 bg-gray-50">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Filter Transactions
                    </CardTitle>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Label htmlFor="date">Date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          id="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
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

            {/* Transaction Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading transactions...</p>
              </div>
            ) : currentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {hasActiveFilters
                    ? "No transactions match your filters."
                    : "No transactions found."}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="px-6 py-4 text-left font-semibold">
                          Transaction ID
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Type
                        </th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Date
                        </th>
                        <th className="px-6 py-4 text-center font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((transaction, index) => {
                        const displayInfo = getTransactionDisplay(transaction);
                        return (
                          <tr
                            key={transaction.id}
                            className={`border-t ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-emerald-50 transition-colors`}
                          >
                            <td className="px-6 py-4 font-mono text-sm">
                              {transaction.id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${displayInfo.bgColor}`}
                              >
                                {displayInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-semibold">
                              <span className={displayInfo.color}>
                                {displayInfo.sign}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(transaction.createdAt).toLocaleString(
                                "id-ID",
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  transaction.status.toLowerCase() ===
                                    "completed" ||
                                  transaction.status.toLowerCase() === "success"
                                    ? "bg-green-100 text-green-800"
                                    : transaction.status.toLowerCase() ===
                                        "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {transaction.status.charAt(0).toUpperCase() +
                                  transaction.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + Math.max(1, currentPage - 2);
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          onClick={() => goToPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
