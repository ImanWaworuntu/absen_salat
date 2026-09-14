"use client"

import { useEffect, useState } from "react"
import { getStudents } from "@/app/(dashboard)/students/actions"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import Image from "next/image"

type Student = {
  id: string
  nis: string
  full_name: string
  class_name: string
  qr_token: string
}

export default function PrintStudents() {
  const [students, setStudents] = useState<Student[]>([])
  
  useEffect(() => {
    getStudents().then(res => {
      if (res.success && res.data) {
        setStudents(res.data)
      }
    })
  }, [])

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-6 print:space-y-0 print:max-w-none">
        <div className="flex justify-between items-center print:hidden bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-xl font-bold">Preview Cetak Kartu QR</h1>
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak Sekarang
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-4">
          {students.map(student => (
            <div 
              key={student.id} 
              className="border-2 border-primary/20 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 break-inside-avoid shadow-sm print:shadow-none"
            >
              <div className="flex items-center gap-2 mb-2 border-b border-primary/10 w-full pb-2 justify-center">
                <Image src="/logo smanet.jpeg" alt="Logo" width={28} height={28} className="object-contain" />
                <span className="font-bold text-[10px] text-primary">SMAN 7 MAKASSAR</span>
              </div>
              <QRCodeSVG value={student.qr_token} size={120} level="H" includeMargin={true} />
              <div className="pt-2 space-y-1">
                <h2 className="font-bold text-sm leading-tight px-1 line-clamp-2">{student.full_name}</h2>
                <div className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                  Kelas {student.class_name}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">{student.nis}</p>
              </div>
            </div>
          ))}
        </div>
        
        {students.length === 0 && (
          <div className="text-center py-20 text-muted-foreground print:hidden">
            Memuat data siswa atau tidak ada data...
          </div>
        )}
      </div>
    </div>
  )
}
