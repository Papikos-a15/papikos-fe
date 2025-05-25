"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Owner {
  id: string;
  name: string;
  email: string;
  // Add other properties as needed
}

const AdminDashboard = () => {
  const [unapprovedOwners, setUnapprovedOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (role !== "ADMIN" || !token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      try {
        const res = await fetch(`${API_URL}/owners/unapproved`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok && res.status !== 204) {
          throw new Error(`Failed to fetch data. Status: ${res.status}`);
        }

        const data = await res.json();
        setUnapprovedOwners(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal mengambil data owners.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const approveOwner = async (ownerId: string) => {
    const token = localStorage.getItem("token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${API_URL}/owners/${ownerId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const updatedOwners = unapprovedOwners.filter(
        (owner) => owner.id !== ownerId,
      );
      setUnapprovedOwners(updatedOwners);
      toast.success("Owner berhasil disetujui!");
    } else {
      toast.error("Gagal menyetujui owner.");
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Papikos Admin
          </h2>
          <p
            className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200 mb-6"
            onClick={() => router.push("/admin")}
          >
            Persetujuan Owner
          </p>
          <p
            className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200 mb-6"
            onClick={() => router.push("/admin/notification")}
          >
            Kirim Notifikasi
          </p>
        </div>
        <Button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white mt-8 w-full"
        >
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 id="persetujuan-owner" className="text-3xl font-bold mb-6">
          Dashboard Persetujuan Owner
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Daftar Owner Belum Disetujui
          </h2>

          {unapprovedOwners.length === 0 ? (
            <p className="text-gray-500">
              Tidak ada owner yang belum disetujui.
            </p>
          ) : (
            <table className="w-full border-collapse border border-gray-200 mx-auto text-center">
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-gray-200 px-4 py-2  text-lg">
                    No
                  </th>
                  <th className="border border-gray-200 px-4 py-2  text-lg">
                    Email
                  </th>
                  <th className="border border-gray-200 px-4 py-2  text-lg"></th>
                </tr>
              </thead>
              <tbody>
                {unapprovedOwners.map((owner, index: number) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-lg">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-lg">
                      {owner.email}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <Button
                        onClick={() => approveOwner(owner.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-4 rounded-md"
                      >
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
