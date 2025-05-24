"use client";

import KosForm from "@/components/manage/KosForm";
import { useRouter } from "next/navigation";
import { addKos } from "@/services/kosService";
import { useState, useEffect } from "react";
import { AddKosPayload } from "@/services/kosService";

export default function AddKosPage() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Access localStorage only on the client side
    setToken(localStorage.getItem("token"));
  }, []);

  const handleAdd = async (formData: AddKosPayload) => {
    try {
      await addKos(formData, token!);
      router.push("/kos");
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.detail || "Failed to add kos. Please try again.";
      setErrorMessage(serverMessage);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>{" "}
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <KosForm onSubmit={handleAdd} />
    </div>
  );
}
