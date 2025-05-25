"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Kos, updateKos } from "@/services/kosService";
import { useQuery } from "@tanstack/react-query";
import { fetchKos } from "@/services/kosService";

export default function KosEditDetail() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params.kosId === "string" ? params.kosId : params.kosId?.[0];
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState<Partial<Kos>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: kosDetail,
    isLoading,
    error,
  } = useQuery<Kos>({
    queryKey: ["kosDetail", id],
    queryFn: () => fetchKos(id!, token!),
  });

  useEffect(() => {
    if (kosDetail) {
      setFormData(kosDetail);
    }
  }, [kosDetail]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) : value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id || !token) return;

    setIsSubmitting(true);
    try {
      // Create a copy of formData with required properties
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: kosId, ...restData } = formData;

      // Ensure all required properties are present
      const kosData: Omit<Kos, "id"> = {
        ownerId: kosDetail!.ownerId,
        name: restData.name || kosDetail!.name,
        address: restData.address || kosDetail!.address,
        description: restData.description || kosDetail!.description,
        maxCapacity: restData.maxCapacity || kosDetail!.maxCapacity,
        availableRooms: restData.availableRooms || kosDetail!.availableRooms,
        price: restData.price || kosDetail!.price,
        available:
          restData.available !== undefined
            ? restData.available
            : kosDetail!.available,
      };

      await updateKos(id, kosData, token);
      alert("Kos berhasil diperbarui");
      router.push("/manage");
    } catch (error) {
      console.error("Error updating kos:", error);
      alert("Gagal memperbarui kos. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        onClick={() => router.push(`/manage/${id}`)}
        className="mb-6"
      >
        ← Kembali ke Detail Kos
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kiri: Gambar dan Detail */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <div className="h-96 overflow-hidden rounded-lg mb-2">
                <Image
                  src="/images/kos-default.jpg"
                  alt={formData.name || ""}
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
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Nama Kos
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium mb-1"
                  >
                    Harga per bulan (Rp)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available || false}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Tersedia</span>
                  </label>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium mb-1"
                    >
                      Deskripsi
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="maxCapacity"
                      className="block text-sm font-medium mb-1"
                    >
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      id="maxCapacity"
                      name="maxCapacity"
                      value={formData.maxCapacity || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="availableRooms"
                      className="block text-sm font-medium mb-1"
                    >
                      Available Rooms
                    </label>
                    <input
                      type="number"
                      id="availableRooms"
                      name="availableRooms"
                      value={formData.availableRooms || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-[3] bg-green-600 hover:bg-green-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                    <Button
                      type="button"
                      className="flex-[1] bg-red-600 hover:bg-red-700 text-white p-2"
                      onClick={() => {
                        if (
                          confirm("Apakah Anda ingin membatalkan perubahan?")
                        ) {
                          router.push(`/manage/${id}`);
                        }
                      }}
                    >
                      Batalkan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
