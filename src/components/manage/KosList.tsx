"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Kos } from "@/services/kosService";
import { useKos } from "@/hooks/useKos";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Filters {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc" | undefined;
}

export default function KosList() {
  const router = useRouter();
  const ownerId = localStorage.getItem("userId") || "";
  const [filters, setFilters] = useState<Filters>({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [searchInput, setSearchInput] = useState("");

  const { kos, isLoading, error } = useKos(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-6">Daftar Kos</h2>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Cari kos..."
            className="border p-2 rounded w-full max-w-md"
          />
          <Button
            onClick={() =>
              setFilters((prev) => ({ ...prev, search: searchInput }))
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Cari
          </Button>
          <Button
            onClick={() => router.push("/manage/add")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Tambah Kos
          </Button>
        </div>
      </div>

      {/* Kos List */}
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error fetching kos list</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kos
            ?.filter((item) => item.ownerId === ownerId)
            .map((item: Kos) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <Image
                    src={"/default-kos.jpg"}
                    alt={item.name}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold text-green-700">
                    {item.name}
                  </h2>
                  <p className="text-gray-600 mb-2">{item.address}</p>
                  <p className="text-lg font-bold mb-2">
                    Rp {item.price.toLocaleString("id-ID")}/bulan
                  </p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Kamar tersedia: {item.availableRooms || "Tidak tersedia"}
                  </p>
                  <div className="flex gap-4">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => router.push(`/manage/${item.id}`)}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
