'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/header'
import { toast } from 'sonner'

interface RoomChat {
  roomChatId: string;
  lawanUserEmail: string;
  createdAt: string;
}

export default function ChatPage() {
  const [roomChats, setRoomChats] = useState<RoomChat[]>([])
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    

    if (!token || !userId) {
      toast.error("Anda belum login. Silakan login kembali.")
      router.push('/login')
      return
    }

    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_URL}/roomchats/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!res.ok) {
          const raw = await res.text()
          console.warn("Gagal fetch room:", res.status, raw)
          throw new Error("Gagal mengambil room chat")
        }

        const data = await res.json()
        setRoomChats(data)
      } catch (error) {
        toast.error("Gagal memuat daftar chat.")
        console.error("Fetch Room Error:", error)
      }
    }

    setRole(role)

    fetchRooms()
  }, [router])


  const handleBroadcast = async () => {
    const token = localStorage.getItem('token')
    const senderId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    if (!broadcastMessage.trim() || !senderId) return

    try {
      await toast.promise(
        fetch(`${API_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            roomChatId: null,
            senderId,
            content: broadcastMessage,
            sendType: 'TO_ALL',
            role
          })
        }),
        {
          loading: 'Mengirim broadcast...',
          success: 'Broadcast berhasil dikirim ke semua penyewa!',
          error: 'Broadcast gagal dikirim.'
        }
      )
      setBroadcastMessage('')
    } catch (err) {
      toast.error("Terjadi kesalahan tak terduga.")
      console.error(err)
    }
  }

  return (
    <>
      <Header />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Chat Saya</h1>

        {/* Broadcast Box */}
        {role === 'OWNER' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">📢 Broadcast Pesan</h2>
            <p className="text-sm text-gray-500 mb-4">
              Kirim pesan ke semua penyewa kos Anda secara serentak.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                placeholder="Contoh: Kamar Kos sedang ada yang kosong!"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
              <Button
                onClick={handleBroadcast}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              >
                Kirim Broadcast
              </Button>
            </div>
          </div>
        )}

        {/* List Room Chat */}
        <div className="grid gap-4">
          {roomChats.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              Belum ada chat tersedia.
            </p>
          ) : (
            roomChats.map((room) => (
              <Card
                key={room.roomChatId}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-green-50 transition border border-gray-200 shadow-sm rounded-xl"
                onClick={() => router.push(`/chat/${room.roomChatId}`)}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src="/images/login.png"
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                  />
                </div>

                {/* Chat Info */}
                <div className="flex flex-col">
                  <p className="font-semibold text-green-800">{room.lawanUserEmail}</p>
                  <p className="text-sm text-gray-500">
                    Mulai sejak: {new Date(room.createdAt).toLocaleString()}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}