'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const KirimNotifikasiPage = () => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [loading] = useState(true);
  

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedRole !== "ADMIN" || !storedToken) {
      router.push("/");
    }
  }, [router]);

  const handleSendNotification = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    try {
      const notificationData = {
        title,
        message,
        type
      }

      const response = await fetch(`${API_URL}/notifications/broadcast`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(notificationData),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }

      toast.success('Notification sent successfully!')
      setTitle('')
      setMessage('')
      setType('')
    } catch (error) {
      toast.error('Failed to send notification')
      console.error('Error sending notification:', error)
    }
  }

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">Papikos Admin</h2>
          <p
            className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200 mb-6"
            onClick={() => router.push('/admin')}
          >
            Persetujuan Owner
          </p>
          <p
            className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200 mb-6"
            onClick={() => router.push('/admin/notification')}
          >
            Kirim Notifikasi
          </p>
        </div>
        <Button
          onClick={() => {
            localStorage.clear()
            router.push("/login")
          }}
          className="bg-red-500 hover:bg-red-600 text-white mt-8 w-full"
        >
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Kirim Notifikasi</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              className="mt-1"
              style={{ height: '200px' }}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Notification Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {['SYSTEM', 'OTHER', 'ADMIN'].map((typeOption) => (
                  <SelectItem key={typeOption} value={typeOption}>
                    {typeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSendNotification} className="w-full bg-green-600 text-white">
            Send Notification To All Users
          </Button>
        </div>
      </main>
    </div>
  )
}

export default KirimNotifikasiPage