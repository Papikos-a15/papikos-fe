"use client";

import KosForm from "@/components/manage/KosForm";
import { useRouter } from "next/navigation";
import { addKos } from "@/services/kosService";
import { useState, useEffect } from "react";
import { AddKosPayload } from "@/services/kosService";
import { toast } from "sonner";

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
      router.push("/manage");
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setErrorMessage("Forbidden. You do not have permission to add a KOS.");
        toast.error("Forbidden. You do not have permission to add a KOS.");
      } else if (status === 500) {
        setErrorMessage("Internal server error. Please try again later.");
        toast.error("Internal server error. Please try again later.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
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
