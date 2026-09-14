"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  let username = formData.get("username") as string
  if (username && !username.includes("@")) {
    username = `${username.trim()}@smanet.local`
  }

  const data = {
    email: username,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Email atau password salah.' }
  }

  revalidatePath("/", "layout")
  redirect("/scan")
}
