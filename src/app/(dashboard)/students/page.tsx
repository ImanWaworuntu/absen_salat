"use client"

import { useEffect, useState } from "react"
import { getStudents } from "./actions"
import { getRekapClasses } from "../rekap/actions"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Printer } from "lucide-react"

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
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [classes, setClasses] = useState<string[]>([])
  const [filterClass, setFilterClass] = useState("Semua")
  const [filterStudentId, setFilterStudentId] = useState("Semua")
  const [studentsInClass, setStudentsInClass] = useState<{id: string, full_name: string}[]>([])

  useEffect(() => {
    getRekapClasses().then(setClasses)
  }, [])

  useEffect(() => {
    if (filterClass === "Semua") {
      setStudentsInClass([])
      setFilterStudentId("Semua")
      return
    }
    const fetchStudents = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("students").select("id, full_name").eq("class_name", filterClass).order("full_name")
      if (data) setStudentsInClass(data)
    }
    fetchStudents()
    setFilterStudentId("Semua")
  }, [filterClass])

  const loadData = async () => {
    setLoading(true)
    const res = await getStudents({ class_name: filterClass, student_id: filterStudentId })
    if (res.success) {
      setStudents(res.data)
    } else {
      toast.error("Gagal memuat data siswa")
    }
    setLoading(false)
    setHasSearched(true)
  }

  const handlePrint = () => {
    let url = "/print/students"
    const params = new URLSearchParams()
    if (filterClass !== "Semua") params.append("class", filterClass)
    if (filterStudentId !== "Semua") params.append("student", filterStudentId)
    
    if (params.toString()) {
      url += "?" + params.toString()
    }
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Siswa</h1>
          <p className="text-muted-foreground">Kelola data siswa dan cetak QR Code massal.</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto" disabled={!hasSearched || students.length === 0}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak QR yang Ditampilkan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Pencarian</CardTitle>
          <CardDescription>Pilih kelas atau siswa spesifik untuk memuat data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full md:w-1/3">
              <Label>Kelas</Label>
              <Select value={filterClass} onValueChange={(v) => setFilterClass(v || "Semua")}>
                <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Kelas</SelectItem>
                  {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 w-full md:w-1/3">
              <Label>Nama Siswa</Label>
              <Select value={filterStudentId} onValueChange={(v) => setFilterStudentId(v || "Semua")} disabled={filterClass === "Semua"}>
                <SelectTrigger><SelectValue placeholder="Semua Siswa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Siswa</SelectItem>
                  {studentsInClass.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={loadData} className="w-full md:w-auto" disabled={loading}>
              Terapkan
            </Button>
          </div>
        </CardContent>
      </Card>

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : !hasSearched ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Pilih filter kelas/siswa dan klik Terapkan untuk menampilkan data.
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Tidak ada data siswa yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nis}</TableCell>
                      <TableCell>{s.full_name}</TableCell>
                      <TableCell>{s.class_name}</TableCell>
                      <TableCell>{s.gender}</TableCell>
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
