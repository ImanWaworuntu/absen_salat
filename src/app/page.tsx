"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, UserCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

type Student = {
  id: string;
  nis: string;
  full_name: string;
  class_name: string;
  qr_token: string;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Silakan masukkan nama Anda");
      return;
    }

    setLoading(true);
    setStudents([]);

    // Cari berdasarkan nama (case-insensitive)
    const { data, error } = await supabase
      .from("students")
      .select("id, nis, full_name, class_name, qr_token")
      .ilike("full_name", `%${searchQuery}%`)
      .limit(10);

    setLoading(false);

    if (error) {
      toast.error("Gagal mengambil data dari server");
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      setStudents(data);
    } else {
      toast.error("Nama siswa tidak ditemukan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto bg-white p-4 rounded-full shadow-lg inline-block">
            <Image
              src="/logo smanet.jpeg"
              alt="Logo SMAN 7"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Presensi Salat SMAN 7
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Cari dan tampilkan QR Code Anda untuk melakukan presensi ibadah harian.
          </p>
        </div>

        <Card className="shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle>Cari QR Code Siswa</CardTitle>
            <CardDescription>
              Masukkan sebagian atau seluruh nama lengkap Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Contoh: Budi Santoso"
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-12 w-full sm:w-auto" disabled={loading}>
                  {loading ? "Mencari..." : "Cari Siswa"}
                </Button>
              </div>
            </form>

            {students.length > 0 && (
              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-semibold text-center border-b pb-2">
                  Hasil Pencarian
                </h3>
                <div className="grid gap-6">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="bg-muted/50 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 border border-border/50"
                    >
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <QRCodeSVG
                          value={student.qr_token}
                          size={150}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-2">
                        <h4 className="text-xl font-bold">{student.full_name}</h4>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <UserCircle className="w-4 h-4" />
                            <span>NIS: {student.nis}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-sm font-medium">
                              Kelas {student.class_name}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Tunjukkan QR Code ini kepada Guru untuk memindai kehadiran salat Anda.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Akses Guru (Login) &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
