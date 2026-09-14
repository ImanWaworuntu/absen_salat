"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

import { createAdminClient } from "@/utils/supabase/server"

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const adminClient = createAdminClient()
  const { data } = await adminClient.from('user_roles').select('role').eq('user_id', user.id).single()
  
  return {
    email: user.email,
    role: data?.role || 'guru'
  }
}
