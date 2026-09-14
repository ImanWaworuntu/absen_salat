"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { getStudents } from "@/app/(dashboard)/students/actions"

type Student = {
  id: string
  nis: string
  full_name: string
  class_name: string
  qr_token: string
}

import { Suspense } from "react"

function PrintContent() {
  const searchParams = useSearchParams()
  const filterClass = searchParams.get("class") || "Semua"
  const filterStudentId = searchParams.get("student") || "Semua"
  
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const res = await getStudents({ class_name: filterClass, student_id: filterStudentId })
      if (res.success) {
        setStudents(res.data)
        setTimeout(() => {
          window.print()
        }, 1000)
      } else {
        setError(true)
      }
      setLoading(false)
    }
    loadData()
  }, [filterClass, filterStudentId])

  if (loading) return <div className="p-8 text-center text-xl">Menyiapkan dokumen untuk dicetak...</div>
  if (error) return <div className="p-8 text-center text-red-500 text-xl">Gagal memuat data. Silakan tutup halaman ini dan coba lagi.</div>

  return (
    <div className="p-4 sm:p-8 bg-white min-h-screen">
      <div className="mb-4 print:hidden text-center">
        <button 
          onClick={() => window.print()} 
          className="bg-primary text-primary-foreground px-4 py-2 rounded shadow hover:bg-primary/90"
        >
          Cetak Sekarang
        </button>
        <p className="text-muted-foreground mt-2 text-sm">Jika dialog cetak tidak muncul otomatis, klik tombol di atas.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4 max-w-[210mm] mx-auto">
        {students.map(s => (
          <div key={s.id} className="border-2 border-black rounded-lg p-3 flex flex-col items-center text-center break-inside-avoid shadow-sm print:shadow-none">
            <div className="flex flex-col items-center mb-2 w-full border-b pb-1 border-slate-200">
              <div className="flex items-center gap-1.5 w-full justify-center">
                <img src="/logo smanet.jpeg" alt="Logo" className="w-5 h-5 object-contain" />
                <h3 className="font-bold text-[12px] leading-none tracking-tight">SISALAT SMANET</h3>
              </div>
              <p className="text-[7px] font-medium mt-1 text-slate-700 text-center leading-tight">Sistem Salat SMA Negeri 7 Makassar</p>
            </div>
            <div className="bg-white p-1 rounded mb-2 border border-slate-200">
              <QRCodeSVG value={s.qr_token} size={110} level="M" />
            </div>
            <p className="font-bold text-[11px] uppercase line-clamp-2 min-h-[30px] flex items-center justify-center w-full leading-tight">{s.full_name}</p>
            <p className="text-[10px] font-medium text-slate-700 mt-1">{s.nis}</p>
            <p className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full mt-1 border border-slate-300">{s.class_name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PrintStudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xl">Memuat...</div>}>
      <PrintContent />
    </Suspense>
  )
}
