"use client";

import React, { useEffect, useState } from "react";
import { Kos } from "@/services/kosService";
import { Loader2, Save, Trash2 } from "lucide-react";

interface KosFormProps {
  initialData?: Kos;
  onSubmit: (
    data: Omit<Kos, "id" | "availableRooms" | "isAvailable"> & {
      ownerId: string;
      name: string;
      address: string;
      description: string;
      maxCapacity: number;
      price: number;
    },
  ) => void;
  isLoading?: boolean;
  onDelete?: () => void;
}

const KosForm: React.FC<KosFormProps> = ({
  initialData,
  onSubmit,
  onDelete,
  isLoading = false,
}) => {
  const [userId, setUserId] = useState("");
  const isUpdate = Boolean(initialData);

  useEffect(() => {
    setUserId(sessionStorage.getItem("userId") || "");
  }, []);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
    maxCapacity: initialData?.maxCapacity || 0,
    price: initialData?.price || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        description: initialData.description,
        maxCapacity: initialData.maxCapacity,
        price: initialData.price,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "maxCapacity" || name === "price" ? Number(value) : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Nama kos tidak boleh kosong";
    }

    if (!formData.address) {
      newErrors.address = "Alamat kos tidak boleh kosong";
    }

    if (!formData.description) {
      newErrors.description = "Deskripsi kos tidak boleh kosong";
    }

    if (formData.maxCapacity <= 0) {
      newErrors.maxCapacity = "Kapasitas maksimal harus lebih dari 0";
    }

    if (formData.price <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Then in your handleSubmit:
      onSubmit({
        ...formData,
        ownerId: userId,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">
        {isUpdate ? "Edit Kos" : "Tambah Kos"}
      </h2>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nama Kos
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`border ${
            errors.name ? "border-red-500" : "border-gray-300"
          } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className="text-sm font-medium">
          Alamat Kos
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`border ${
            errors.address ? "border-red-500" : "border-gray-300"
          } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Deskripsi Kos
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="maxCapacity" className="text-sm font-medium">
          Kapasitas Maksimal
        </label>
        <input
          type="number"
          id="maxCapacity"
          name="maxCapacity"
          value={formData.maxCapacity}
          onChange={handleChange}
          className={`border ${
            errors.maxCapacity ? "border-red-500" : "border-gray-300"
          } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
        {errors.maxCapacity && (
          <p className="text-red-500 text-sm">{errors.maxCapacity}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="price" className="text-sm font-medium">
          Harga
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className={`border ${
            errors.price ? "border-red-500" : "border-gray-300"
          } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
      </div>
      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          className="flex items-center justify-center bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Save className="mr-2" />
          )}
          {isUpdate ? "Simpan Perubahan" : "Tambah Kos"}
        </button>
        {isUpdate && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition duration-200"
          >
            <Trash2 className="mr-2" />
            Hapus Kos
          </button>
        )}
      </div>
    </form>
  );
};

export default KosForm;
