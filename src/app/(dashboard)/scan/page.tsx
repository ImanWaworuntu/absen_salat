"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { toast } from "sonner"
import { recordAttendance } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Camera, RefreshCw } from "lucide-react"

export default function ScanPage() {
  const [prayerType, setPrayerType] = useState<"zuhur" | "asar">("zuhur")
  const [isScanning, setIsScanning] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isProcessingRef = useRef(false)
  const lastScanRef = useRef<{ text: string, time: number }>({ text: "", time: 0 })

  const playBeep = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      oscillator.type = "sine"
      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.5, context.currentTime)
      oscillator.start()
      gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1)
      oscillator.stop(context.currentTime + 0.1)
    } catch {
      console.log("Audio not supported")
    }
  }

  const handleScan = async (decodedText: string) => {
    if (isProcessingRef.current) return

    const now = Date.now()
    // Ignore the exact same QR code if scanned within the last 5 seconds to prevent accidental duplicate hits
    if (lastScanRef.current.text === decodedText && now - lastScanRef.current.time < 5000) {
      return
    }

    isProcessingRef.current = true
    lastScanRef.current = { text: decodedText, time: now }

    try {
      const res = await recordAttendance(decodedText, prayerType)
      
      if (res.success) {
        toast.success(res.message, { duration: 1000 })
        playBeep()
      } else if (res.alreadyRecorded) {
        toast.warning(res.message, { duration: 2000 })
      } else {
        toast.error(res.message, { duration: 2000 })
      }
    } catch {
      toast.error("Gagal terhubung ke server.", { duration: 2000 })
    }

    // Set a very short cooldown for DIFFERENT QR codes to allow fast scanning
    setTimeout(() => {
      isProcessingRef.current = false
    }, 500)
  }

  const startScanner = async (facingMode = cameraFacing) => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader", { verbose: false, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] })
    }

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }
      await scannerRef.current.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScan,
        undefined
      )
      setIsScanning(true)
    } catch (err) {
      toast.error("Kamera tidak dapat diakses. Pastikan izin diberikan.")
      console.error(err)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleToggleCam = async () => {
    const next = cameraFacing === "environment" ? "user" : "environment"
    setCameraFacing(next)
    if (isScanning) {
      await startScanner(next)
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pemindai QR Code</h1>
        <p className="text-muted-foreground">Pilih jenis salat lalu aktifkan kamera.</p>
        
        <div className="mt-4 bg-muted/50 rounded-lg p-3 inline-flex items-center gap-3 border text-sm font-medium text-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-0.5"></div>
          <div className="flex flex-col">
            <span>
              {currentTime ? currentTime.toLocaleDateString('id-ID', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                timeZone: 'Asia/Makassar' 
              }) : 'Memuat tanggal...'}
            </span>
            {currentTime && (
              <span className="text-muted-foreground font-mono mt-0.5">
                {currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar' })} WITA
              </span>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sesi Presensi</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={prayerType} 
            onValueChange={(v) => setPrayerType(v as "zuhur" | "asar")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="zuhur" id="zuhur" />
              <Label htmlFor="zuhur">Salat Zuhur</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="asar" id="asar" />
              <Label htmlFor="asar">Salat Asar</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Kamera</CardTitle>
            <Button variant="outline" size="sm" onClick={handleToggleCam} disabled={!isScanning}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tukar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-black text-white aspect-square relative flex items-center justify-center">
            <div id="reader" className="w-full h-full [&>video]:object-cover" />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <Camera className="w-12 h-12 text-white/30" />
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            {!isScanning ? (
              <Button className="w-full" onClick={() => startScanner(cameraFacing)}>Mulai Pemindai</Button>
            ) : (
              <Button variant="destructive" className="w-full" onClick={stopScanner}>Hentikan Pemindai</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
