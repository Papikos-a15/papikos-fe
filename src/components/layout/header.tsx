"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
  // Add other properties as needed
}

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(storedRole);
    const userId = localStorage.getItem("userId"); // Assuming user ID is stored in localStorage

    if (isLoggedIn && userId) {
      fetchNotifications(userId);
    }
  }, [isLoggedIn, role]);

  const fetchNotifications = async (userId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/notifications/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: Notification[] = await response.json();

        // Hapus setNotifications karena state tidak digunakan
        // setNotifications(data)

        // Fix: hapus any dan langsung gunakan typed data
        const unread = data.filter((notification) => !notification.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token) return;

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Logout gagal:", err);
    }

    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    setIsMobileMenuOpen(false);
    toast.success("Logout berhasil!");
    router.push("/login");
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderMenuItems = () => {
    if (!isLoggedIn) return null;

    const menuItems = [];
    
    if (role === "TENANT") {
      menuItems.push(
        { href: "/", label: "Beranda" },
        { href: "/kos", label: "Eksplor Kos" },
        { href: "/booking", label: "Booking Saya" },
        { href: "/wishlist", label: "Wishlist" },
        { href: "/chat", label: "Chat" },
        { href: "/transactions", label: "Riwayat" }
      );
    } else if (role === "OWNER") {
      menuItems.push(
        { href: "/", label: "Beranda" },
        { href: "/manage", label: "Kelola Kos" },
        { href: "/booking/owner", label: "Permintaan Booking" },
        { href: "/chat", label: "Chat" },
        { href: "/transactions", label: "Riwayat" }
      );
    }

    return menuItems;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl sm:text-2xl font-bold text-green-700 flex-shrink-0">
              Papikos
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 text-sm text-gray-700 font-medium">
              {renderMenuItems()?.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="hover:text-green-700 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  {/* Notification Button */}
                  <Link href="/notification">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:bg-gray-100 relative p-2"
                    >
                      <BellIcon className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  {/* Logout Button */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-600 hover:bg-green-100 whitespace-nowrap"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button & Notification */}
            <div className="flex items-center gap-2 md:hidden">
              {isLoggedIn && (
                <Link href="/notification">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-gray-100 relative p-2"
                  >
                    <BellIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Navigation Links */}
              {isLoggedIn && (
                <div className="space-y-2">
                  {renderMenuItems()?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="block py-2 px-3 text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                {isLoggedIn ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-green-700 border-green-600 hover:bg-green-100"
                  >
                    Logout
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={closeMobileMenu}>
                      <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}