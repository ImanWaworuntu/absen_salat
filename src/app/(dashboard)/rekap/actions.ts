"use server"

import { createClient } from "@/utils/supabase/server"

export async function getRekapClasses() {
  const supabase = await createClient()
  const { data } = await supabase.from("students").select("class_name")
  return Array.from(new Set(data?.map(c => c.class_name) || [])).sort()
}

export async function getRekap(filters: { class_name?: string, student_id?: string, date_range?: { start: string, end: string }, prayer_type?: string }) {
  const supabase = await createClient()

  let studentsQuery = supabase.from("students").select("id, nis, full_name, class_name").order("class_name").order("full_name")
  if (filters.class_name && filters.class_name !== "Semua") {
    studentsQuery = studentsQuery.eq("class_name", filters.class_name)
  }
  if (filters.student_id && filters.student_id !== "Semua") {
    studentsQuery = studentsQuery.eq("id", filters.student_id)
  }
  
  const { data: students, error: studentsError } = await studentsQuery
  if (studentsError) return { success: false, error: studentsError.message }

  let logsQuery = supabase.from("prayer_logs").select("student_id, prayer_type, prayer_date")
  if (filters.date_range && filters.date_range.start) {
    logsQuery = logsQuery.gte("prayer_date", filters.date_range.start)
    if (filters.date_range.end) {
      logsQuery = logsQuery.lte("prayer_date", filters.date_range.end)
    }
  }
  if (filters.prayer_type && filters.prayer_type !== "Semua") {
    logsQuery = logsQuery.eq("prayer_type", filters.prayer_type)
  }
  
  const { data: logs, error: logsError } = await logsQuery
  if (logsError) return { success: false, error: logsError.message }

  const rekap = (students || []).map(student => {
    const studentLogs = (logs || []).filter(l => l.student_id === student.id)
    const totalZuhur = studentLogs.filter(l => l.prayer_type === 'zuhur').length
    const totalAsar = studentLogs.filter(l => l.prayer_type === 'asar').length
    return {
      ...student,
      total_zuhur: totalZuhur,
      total_asar: totalAsar,
      total_semua: totalZuhur + totalAsar
    }
  })

  const { data: allClasses } = await supabase.from("students").select("class_name")
  const uniqueClasses = Array.from(new Set(allClasses?.map(c => c.class_name) || [])).sort()

  return { success: true, data: rekap, classes: uniqueClasses }
}
