"use server"

import { createClient } from "@/utils/supabase/server"


export async function getStudents(filters?: { class_name?: string, student_id?: string }) {
  const supabase = await createClient()
  let query = supabase.from("students").select("*")
  
  if (filters?.class_name && filters.class_name !== "Semua") {
    query = query.eq("class_name", filters.class_name)
  }
  if (filters?.student_id && filters.student_id !== "Semua") {
    query = query.eq("id", filters.student_id)
  }

  const { data, error } = await query

  if (error) {
    console.error(error)
    return { success: false, error: error.message, data: [] }
  }

  const sortedData = (data || []).sort((a, b) => {
    const classCompare = a.class_name.localeCompare(b.class_name, undefined, { numeric: true, sensitivity: 'base' })
    if (classCompare !== 0) return classCompare
    return a.full_name.localeCompare(b.full_name, undefined, { numeric: true, sensitivity: 'base' })
  })

  return { success: true, data: sortedData }
}
