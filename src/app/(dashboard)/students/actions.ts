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
    .order("class_name", { ascending: true })
    .order("full_name", { ascending: true })
  
  if (error) {
    console.error(error)
    return { success: false, error: error.message, data: [] }
  }
  return { success: true, data }
}
