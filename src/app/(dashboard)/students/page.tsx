"use client"

import { useEffect, useState } from "react"
import { getStudents, addStudent, deleteStudent } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Printer, Plus, Trash2 } from "lucide-react"

type Student = {
  id: string
  nis: string
  full_name: string
  class_name: string
  gender: string
  qr_token: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const res = await getStudents()
    if (res.success) {
      setStudents(res.data)
    } else {
      toast.error("Gagal memuat data siswa")
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await addStudent(formData)
    if (res.success) {
      toast.success("Siswa berhasil ditambahkan")
      setIsAddOpen(false)
      loadData()
    } else {
      toast.error(res.error || "Gagal menambah siswa")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus data siswa ${name}?`)) return
    
    const res = await deleteStudent(id)
    if (res.success) {
      toast.success("Data berhasil dihapus")
      loadData()
    } else {
      toast.error(res.error || "Gagal menghapus data")
    }
  }

  const handlePrint = () => {
    window.open("/students/print", "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Siswa</h1>
          <p className="text-muted-foreground">Kelola data siswa dan cetak QR Code massal.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak ID Card & QR
          </Button>

          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Siswa
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Data Siswa</DialogTitle>
                <DialogDescription>
                  Masukkan data siswa secara manual. Untuk data massal, gunakan fitur Import CSV di Supabase.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nis">NIS</Label>
                  <Input id="nis" name="nis" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input id="full_name" name="full_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_name">Kelas</Label>
                  <Input id="class_name" name="class_name" placeholder="Contoh: X-1, XI-MIPA-2" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <Select name="gender" required defaultValue="L">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki (L)</SelectItem>
                      <SelectItem value="P">Perempuan (P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Simpan Siswa</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>Total {students.length} siswa terdaftar di sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Belum ada data siswa.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nis}</TableCell>
                      <TableCell>{s.full_name}</TableCell>
                      <TableCell>{s.class_name}</TableCell>
                      <TableCell>{s.gender}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(s.id, s.full_name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
