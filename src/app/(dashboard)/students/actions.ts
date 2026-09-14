"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

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

export async function addStudent(formData: FormData) {
  const supabase = await createClient()
  
  const nis = formData.get("nis") as string
  const full_name = formData.get("full_name") as string
  const class_name = formData.get("class_name") as string
  const gender = formData.get("gender") as "L" | "P"

  const { error } = await supabase
    .from("students")
    .insert({ nis, full_name, class_name, gender })

  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath("/students")
  return { success: true }
}

export async function deleteStudent(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath("/students")
  return { success: true }
}
