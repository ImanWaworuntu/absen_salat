"use client"

import { useState, useEffect } from "react"
import { getGurus, createGuru, deleteGuru } from "./actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Trash2, UserPlus, ShieldAlert } from "lucide-react"

type UserItem = {
  id: string;
  email: string | undefined;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async (background = false) => {
    if (!background) setLoading(true)
    const data = await getGurus()
    setUsers(data)
    if (!background) setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const res = await createGuru(formData)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Akun guru berhasil dibuat!")
      e.currentTarget.reset()
      await fetchUsers(true)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus guru ini? Mereka tidak akan bisa login lagi.")) return;
    
    const res = await deleteGuru(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Akun berhasil dihapus!")
      await fetchUsers(true)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Tambah dan hapus akses guru untuk sistem absen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah Guru */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Tambah Guru
            </CardTitle>
            <CardDescription>Buat akun baru untuk staf guru.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input id="username" name="username" type="text" placeholder="Contoh: agus123" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Buat Akun"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Daftar Guru */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daftar Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Memuat data...</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Username</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{user.email?.replace('@smanet.local', '')}</td>
                        <td className="px-4 py-3">
                          {user.role === 'admin' ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max">
                              <ShieldAlert className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                              Guru
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.role !== 'admin' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
