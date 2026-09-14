"use client"

import { useState } from "react"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await login(formData)
    
    // Jika login berhasil, redirect akan dipicu di server action
    // Jadi baris ini hanya dieksekusi jika ada error
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto bg-white p-4 rounded-full shadow-lg inline-block mb-4">
            <Image
              src="/logo smanet.jpeg"
              alt="Logo SMAN 7"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">Portal Guru</h1>
          <p className="text-muted-foreground">Masuk untuk mengelola presensi salat</p>
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Masukkan email dan password akun guru Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="guru@sman7.sch.id"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memeriksa..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            &larr; Kembali ke Pencarian QR Siswa
          </Link>
        </div>
      </div>
    </div>
  )
}
