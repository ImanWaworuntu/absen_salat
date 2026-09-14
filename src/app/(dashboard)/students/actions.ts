"use server"

import { createClient } from "@/utils/supabase/server"


export async function getStudents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("class_name", { ascending: true })
    .order("full_name", { ascending: true })
  
  if (error) {
    console.error(error)
    return { success: false, error: error.message, data: [] }
  }
  return { success: true, data }
}
