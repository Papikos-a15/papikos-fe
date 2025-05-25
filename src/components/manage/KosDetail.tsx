"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Kos } from "@/services/kosService";
import { useQuery } from "@tanstack/react-query";
import { fetchKos } from "@/services/kosService";
import { deleteKos } from "@/services/kosService";

export default function KosDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params.kosId === "string" ? params.kosId : params.kosId?.[0];
  const token = localStorage.getItem("token");
  const {
    data: kosDetail,
    isLoading,
    error,
  } = useQuery<Kos>({
    queryKey: ["kosDetail", id],
    queryFn: () => fetchKos(id!, token!),
  });

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error || !kosDetail) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Gagal memuat detail kos
        </h2>
        <p className="text-gray-600">
          Silakan coba lagi nanti atau hubungi admin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button
        variant="outline"
        onClick={() => router.push("/manage")}
        className="mb-6"
      >
        ← Kembali ke Daftar Kos
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kiri: Gambar dan Detail */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="h-96 overflow-hidden rounded-lg mb-2">
              <Image
                src="/images/kos-default.jpg"
                alt={kosDetail.name}
                className="w-full h-full object-cover"
                width={800}
                height={400}
              />
            </div>
          </div>
        </div>

        {/* Kanan: Informasi Kos */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{kosDetail.name}</h2>

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
                    Deskripsi
                  </label>
                  <p className="text-gray-700">
                    {kosDetail.description || "Tidak ada deskripsi."}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Capacity
                  </label>
                  <p className="text-gray-700">
                    {kosDetail.maxCapacity || "Tidak ada kapasitas."}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Available Rooms
                  </label>
                  <p className="text-gray-700">
                    {kosDetail.availableRooms || "Tidak ada kamar tersedia."}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex gap-2">
                  <Button
                    className="flex-[3] bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => router.push(`/manage/edit/${kosDetail.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-[1] bg-red-600 hover:bg-red-700 text-white p-2"
                    onClick={() => {
                      if (
                        confirm("Apakah Anda yakin ingin menghapus kos ini?")
                      ) {
                        deleteKos(kosDetail.id, token!)
                          .then(() => {
                            alert("Kos berhasil dihapus");
                            router.push("/manage");
                          })
                          .catch((error) => {
                            console.error("Error deleting kos:", error);
                            alert("Gagal menghapus kos. Silakan coba lagi.");
                          });
                      }
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
