"use server"

import { createClient } from "@/utils/supabase/server"

export async function recordAttendance(qrToken: string, prayerType: 'zuhur' | 'asar') {
  const supabase = await createClient()

  // 1. Get Teacher ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Akses ditolak. Silakan login." }

  // 2. Find Student by qrToken
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, class_name")
    .eq("qr_token", qrToken)
    .single()

  if (studentError || !student) {
    return { success: false, message: "QR Code tidak valid atau siswa tidak ditemukan." }
  }

  // 3. Record attendance
  const { error: insertError } = await supabase
    .from("prayer_logs")
    .insert({
      student_id: student.id,
      prayer_type: prayerType,
      recorded_by: user.id,
    })

  if (insertError) {
    if (insertError.code === '23505') { // Unique violation
      return { success: false, alreadyRecorded: true, message: `Siswa ${student.full_name} sudah tercatat presensi ${prayerType} hari ini.` }
    }
    console.error("Insert error:", insertError)
    return { success: false, message: "Terjadi kesalahan sistem saat menyimpan data." }
  }

  return { success: true, message: `Berhasil mencatat kehadiran ${prayerType} untuk ${student.full_name}.`, student }
}
