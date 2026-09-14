"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Student = {
  id: string;
  nis: string;
  full_name: string;
  class_name: string;
  qr_token: string;
};

export default function Home() {
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [studentResult, setStudentResult] = useState<Student | null>(null);

  const supabase = createClient();

  // 1. Fetch available classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      const { data, error } = await supabase.from("students").select("class_name");
      if (data) {
        const unique = Array.from(new Set(data.map((d) => d.class_name).filter(Boolean)));
        unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        setClasses(unique);
      }
      setLoadingClasses(false);
    };
    fetchClasses();
  }, []);

  // 2. Fetch students when a class is selected
  useEffect(() => {
    if (!selectedClass) {
      setStudentsInClass([]);
      setSelectedStudentId("");
      return;
    }
    const fetchStudents = async () => {
      const { data } = await supabase
        .from("students")
        .select("id, full_name, class_name, qr_token, nis")
        .eq("class_name", selectedClass)
        .order("full_name");
      if (data) {
        setStudentsInClass(data);
      }
    };
    fetchStudents();
    setSelectedStudentId(""); // Reset student selection
  }, [selectedClass]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudentId) {
      toast.error("Silakan pilih kelas dan nama Anda");
      return;
    }

    setLoadingSearch(true);
    setStudentResult(null);

    // Simulated delay for micro-animation feel
    await new Promise(resolve => setTimeout(resolve, 400));

    const found = studentsInClass.find(s => s.id === selectedStudentId);
    if (found) {
      setStudentResult(found);
    } else {
      toast.error("Data siswa tidak ditemukan");
    }
    setLoadingSearch(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-2xl mx-auto space-y-8 z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto bg-white/50 backdrop-blur-sm p-3 rounded-full shadow-lg inline-block border border-white/50">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center bg-white">
              <Image
                src="/logo-smanet-clean.png"
                alt="Logo SMAN 7"
                width={100}
                height={100}
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 drop-shadow-sm">
            SISALAT SMAN 7 Makassar
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium">
            Sistem Salat SMA Negeri 7 Makassar
          </p>
        </motion.div>

        {/* Search Card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-2xl border-white/40 bg-white/60 backdrop-blur-xl">
            <CardHeader className="border-b border-white/40 pb-6">
              <CardTitle className="text-xl">Cari QR Code Anda</CardTitle>
              <CardDescription>
                Pilih kelas lalu temukan nama Anda untuk menampilkan QR Code presensi.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Class */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kelas</label>
                    <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val || "")} disabled={loadingClasses}>
                      <SelectTrigger className="bg-white/80 h-12">
                        <SelectValue placeholder={loadingClasses ? "Memuat kelas..." : "Pilih Kelas Anda"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>Kelas {cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Student Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Lengkap</label>
                    <Select 
                      value={selectedStudentId} 
                      onValueChange={(val) => setSelectedStudentId(val || "")} 
                      disabled={!selectedClass || studentsInClass.length === 0}
                    >
                      <SelectTrigger className="bg-white/80 h-12">
                        <SelectValue placeholder={
                          !selectedClass ? "Pilih kelas dahulu" : 
                          studentsInClass.length === 0 ? "Memuat siswa..." : 
                          "Pilih Nama Anda"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {studentsInClass.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-md font-semibold bg-green-600 hover:bg-green-700 transition-all active:scale-[0.98]" 
                  disabled={loadingSearch || !selectedStudentId}
                >
                  {loadingSearch ? "Mencari..." : "Tampilkan QR Code"}
                </Button>
              </form>

              {/* Result Animation */}
              <AnimatePresence>
                {studentResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="bg-white/80 p-6 rounded-2xl flex flex-col items-center gap-6 border border-green-100 shadow-inner">
                      <div className="bg-white p-5 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-300">
                        <QRCodeSVG
                          value={studentResult.qr_token}
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      
                      <div className="text-center space-y-3 w-full">
                        <h4 className="text-2xl font-bold text-gray-800">{studentResult.full_name}</h4>
                        <div className="flex flex-wrap items-center justify-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                            <UserCircle className="w-4 h-4" /> NIS: {studentResult.nis}
                          </span>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            {studentResult.class_name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 px-4">
                          Tunjukkan QR Code ini kepada Guru untuk memindai kehadiran salat Anda. 
                          Code ini unik dan berlaku selamanya.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-green-600 transition-colors font-medium">
              ©
            </Link>{" "}
            Pandu Digital SMANET 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
}
