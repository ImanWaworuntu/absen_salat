"use server"
import { createClient, createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getLogs(date: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('prayer_logs')
    .select(`id, prayer_type, prayer_date, scanned_at, students!inner(id, full_name, class_name)`)
    .eq('prayer_date', date)
    .order('scanned_at', { ascending: false })
    
  if (error) return []
  return data
}

export async function getStudentsForManual() {
  const supabase = await createClient()
  const { data } = await supabase.from('students').select('id, full_name, class_name').order('class_name').order('full_name')
  return data || []
}

export async function deleteLog(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Akses ditolak" }

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('prayer_logs').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/attendance')
  return { success: true }
}

export async function addManualLog(formData: FormData) {
  const student_id = formData.get("student_id") as string
  const prayer_type = formData.get("prayer_type") as string
  const date = formData.get("date") as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Akses ditolak" }

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('prayer_logs').insert({
    student_id,
    prayer_type,
    prayer_date: date,
    recorded_by: user.id
  })
  
  if (error) {
    if (error.code === '23505') return { error: "Siswa sudah tercatat absen untuk salat ini." }
    return { error: error.message }
  }
  revalidatePath('/admin/attendance')
  return { success: true }
}
