"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Use useParams for dynamic routes
import { toast } from "sonner";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft } from "react-icons/fa";

interface NotificationDetail {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

export default function NotificationDetailPage() {
  const router = useRouter();
  const { notificationId } = useParams();
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    if (!notificationId) {
      toast.error("Notification ID is missing");
      return;
    }

    const notificationIdString = Array.isArray(notificationId) ? notificationId[0] : notificationId;

    if (!notificationIdString) {
      toast.error("Notification ID is missing");
      return;
    }

    const fetchNotification = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notification");
        }

        const data = await response.json();
        setNotification(data);

        // Mark the notification as read automatically
        await markAsRead(notificationIdString);
      } catch (error) {
        console.error("Error fetching notification:", error);
        toast.error("Failed to fetch notification details");
      } finally {
        setLoading(false);
      }
    };

    const markAsRead = async (id: string) => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to mark notification as read");
      }
    };

    fetchNotification();
  }, [notificationId]);

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center p-10 min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Terbatas</h2>
          <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat notifikasi Anda.</p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Login
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-10 text-center">Memuat notifikasi...</div>
        <Footer />
      </>
    );
  }

  if (!notification) {
    return (
      <>
        <Header />
        <div className="p-10 text-center">
          <p className="text-gray-500">Notifikasi tidak ditemukan</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6 min-h-screen">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/notification")}
            className="text-green-700 hover:bg-green-100"
          >
            <FaArrowLeft className="mr-2" /> Kembali ke Notifikasi
          </Button>
        </div>
        <Card className="overflow-hidden bg-white shadow-md">
          <CardContent className="p-6">
            <h1 className="text-3xl font-semibold text-green-700 mb-4">{notification.title}</h1>
            <p className="text-sm text-gray-500 mb-2">
              <strong>Jenis:</strong> {notification.type}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              <strong>Dipublikasikan pada:</strong> {new Date(notification.createdAt).toLocaleString()}
            </p>
            <p className="text-lg text-gray-700 mt-4">{notification.message}</p>
            {notification.read ? (
              <p className="mt-4 text-sm text-green-600">This notification has been read.</p>
            ) : (
              <p className="mt-4 text-sm text-red-600">This notification is unread.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
