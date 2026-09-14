"use client"

import { useEffect, useState } from "react"
import { getRekap, getRekapClasses } from "./actions"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Search, CheckCircle2 } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"

type RekapData = {
  id: string
  nis: string
  full_name: string
  class_name: string
  total_zuhur: number
  total_asar: number
  total_semua: number
}

export default function RekapPage() {
  const [data, setData] = useState<RekapData[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  const [filterClass, setFilterClass] = useState("Semua")
  const [filterStudentId, setFilterStudentId] = useState("Semua")
  const [studentsInClass, setStudentsInClass] = useState<{id: string, full_name: string}[]>([])
  
  const [filterPrayer, setFilterPrayer] = useState("Semua")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")

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
    const res = await getRekap({
      class_name: filterClass,
      student_id: filterStudentId,
      prayer_type: filterPrayer,
      date_range: dateStart ? { start: dateStart, end: dateEnd || dateStart } : undefined
    })
    
    if (res.success) {
      setData(res.data || [])
    } else {
      toast.error("Gagal mengambil data rekap")
    }
    setLoading(false)
    setHasSearched(true)
  }

  useEffect(() => {
    getRekapClasses().then(setClasses)
  }, [])

  const handleExport = () => {
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diekspor")
      return
    }

    const ws = XLSX.utils.json_to_sheet(data.map(d => ({
      "NIS": d.nis,
      "Nama Lengkap": d.full_name,
      "Kelas": d.class_name,
      "Hadir Zuhur": d.total_zuhur,
      "Hadir Asar": d.total_asar,
      "Total Kehadiran": d.total_semua
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Presensi")
    XLSX.writeFile(wb, `Rekap_Presensi_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success("File Excel berhasil diunduh")
  }

  const totalKehadiran = data.reduce((acc, curr) => acc + curr.total_semua, 0)
  const avgKehadiran = data.length > 0 ? (totalKehadiran / data.length).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rekap Presensi</h1>
          <p className="text-muted-foreground">Pantau laporan dan analitik kehadiran salat siswa.</p>
        </div>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa Terfilter</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Catatan Kehadiran</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalKehadiran}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata per Siswa</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgKehadiran}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
          <CardDescription>Sesuaikan parameter laporan yang ingin dilihat.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full md:w-1/5">
              <Label>Kelas</Label>
              <Select value={filterClass} onValueChange={(v) => setFilterClass(v || "Semua")}>
                <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Kelas</SelectItem>
                  {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 w-full md:w-1/5">
              <Label>Siswa</Label>
              <Select value={filterStudentId} onValueChange={(v) => setFilterStudentId(v || "Semua")} disabled={filterClass === "Semua"}>
                <SelectTrigger><SelectValue placeholder="Semua Siswa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Siswa</SelectItem>
                  {studentsInClass.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 w-full md:w-1/5">
              <Label>Jenis Salat</Label>
              <Select value={filterPrayer} onValueChange={(v) => setFilterPrayer(v || "Semua")}>
                <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua (Zuhur & Asar)</SelectItem>
                  <SelectItem value="zuhur">Zuhur Saja</SelectItem>
                  <SelectItem value="asar">Asar Saja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full md:w-1/5">
              <Label>Dari Tanggal</Label>
              <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            </div>

            <div className="space-y-2 w-full md:w-1/5">
              <Label>Sampai Tanggal</Label>
              <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} min={dateStart} />
            </div>

            <Button onClick={loadData} className="w-full md:w-auto" disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Terapkan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-right">Hadir Zuhur</TableHead>
                  <TableHead className="text-right">Hadir Asar</TableHead>
                  <TableHead className="text-right font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat data rekap...
                    </TableCell>
                  </TableRow>
                ) : !hasSearched ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Silakan sesuaikan filter lalu klik "Terapkan" untuk melihat data rekap.
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Tidak ada data yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.nis}</TableCell>
                      <TableCell>{d.full_name}</TableCell>
                      <TableCell>{d.class_name}</TableCell>
                      <TableCell className="text-right">{d.total_zuhur}</TableCell>
                      <TableCell className="text-right">{d.total_asar}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{d.total_semua}</TableCell>
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
