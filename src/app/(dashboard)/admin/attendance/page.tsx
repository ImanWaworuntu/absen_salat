"use client"

import { useState, useEffect } from "react"
import { getLogs, deleteLog, addManualLog, getStudentsForManual } from "./actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Trash2, PlusCircle, Search } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogItem = any
type StudentItem = { id: string, full_name: string, class_name: string }

export default function AdminAttendancePage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [students, setStudents] = useState<StudentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  const fetchLogs = async () => {
    setLoading(true)
    const data = await getLogs(date)
    setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    getStudentsForManual().then(setStudents)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append("date", date)
    
    const res = await addManualLog(formData)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Presensi manual berhasil ditambahkan!")
      fetchLogs()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus catatan presensi ini?")) return;
    
    const res = await deleteLog(id)
    if (res.error) {
      toast.error("Gagal menghapus log")
    } else {
      toast.success("Log berhasil dihapus!")
      fetchLogs()
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Presensi Manual</h1>
        <p className="text-muted-foreground">Tambah atau hapus data absensi siswa secara manual (Mode Admin).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Manual */}
        <Card className="lg:col-span-1 h-max">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Tambah Manual
            </CardTitle>
            <CardDescription>Bypass QR Code untuk siswa yang lupa bawa kartu.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Siswa</Label>
                <Select name="student_id" required>
                  <SelectTrigger><SelectValue placeholder="Pilih Siswa" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.class_name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jenis Salat</Label>
                <Select name="prayer_type" defaultValue="zuhur" required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zuhur">Zuhur</SelectItem>
                    <SelectItem value="asar">Asar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Tambah Kehadiran"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Daftar Log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Riwayat Pemindaian ({date})</CardTitle>
              <Button variant="outline" size="icon" onClick={fetchLogs}><Search className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Memuat riwayat...</p>
            ) : logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 bg-muted/50 rounded-lg">Tidak ada catatan presensi pada tanggal ini.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Siswa</th>
                      <th className="px-4 py-3 font-medium">Kelas</th>
                      <th className="px-4 py-3 font-medium">Salat</th>
                      <th className="px-4 py-3 font-medium">Waktu (Scan)</th>
                      <th className="px-4 py-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{log.students?.full_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{log.students?.class_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.prayer_type === 'zuhur' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {log.prayer_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(log.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(log.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
