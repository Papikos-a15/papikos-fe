'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/header'
import { toast } from 'sonner'
import { Send, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  senderId: string
  senderEmail: string
  content: string
  timestamp: string
  isEdited: boolean
}

export default function RoomChatPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { roomId } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('userId')
    setUserId(id)
    fetchMessages()
  }, [roomId])

  const fetchMessages = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/messages?roomId=${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setMessages(data)
    scrollToBottom()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    const token = localStorage.getItem('token')
    const senderId = localStorage.getItem('userId')
    if (!newMessage.trim() || !senderId) return

    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        roomChatId: roomId,
        senderId,
        content: newMessage,
        sendType: 'TO_ONE'
      })
    })

    toast.success("Pesan berhasil dikirim!")
    setNewMessage('')
    fetchMessages()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  const handleEditSave = async () => {
    if (!editId || !editContent.trim()) return
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/messages/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newContent: editContent })
    })
    setEditId(null)
    toast.success('Pesan berhasil diedit!')
    fetchMessages()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/messages/${deleteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    setDeleteId(null)
    toast.success('Pesan berhasil dihapus!')
    fetchMessages()
  }

  return (
    <>
      <Header />
      <div className="relative h-screen pt-6 max-w-3xl mx-auto">
        {/* Chat Area */}
        <div className="overflow-y-auto pb-28 px-6 space-y-6 h-full">
          {messages.map((msg) => {
            const isSelf = msg.senderId === userId
            return (
              <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-5 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img
                    src="/images/login.png"
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="relative group">
                    <div className={`rounded-xl px-4 py-3 max-w-[100%] break-words shadow-md ${
                      isSelf
                        ? 'bg-green-50 text-right'
                        : 'bg-white border border-gray-300 text-left'
                    }`}>
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1 block text-end">
                      {new Date(msg.timestamp).toLocaleTimeString()} {msg.isEdited && '· diedit'}
                    </span>
                    {isSelf && (
                      <div className="absolute -bottom-6 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <Button size="icon" variant="ghost" className="h-6 w-6 p-0"
                          onClick={() => {
                            setEditId(msg.id)
                            setEditContent(msg.content)
                          }}>
                          <Pencil size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 p-0"
                          onClick={() => setDeleteId(msg.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Tulis pesan..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <Button
            onClick={handleSend}
            className="rounded-full bg-green-700 hover:bg-green-800 text-white w-10 h-10 p-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
          <DialogContent>
            <DialogTitle className="text-lg font-semibold">Edit Pesan</DialogTitle>
            <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditId(null)}>Batal</Button>
              <Button className="bg-green-700" onClick={handleEditSave}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogTitle className="text-lg font-semibold">Hapus Pesan</DialogTitle>
            <p className="text-sm text-gray-600">Pesan yang sudah dihapus tidak dapat dikembalikan.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button className="text-white"variant="destructive" onClick={handleDeleteConfirm}>Hapus</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}