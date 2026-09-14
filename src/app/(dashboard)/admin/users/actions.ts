"use server"

import { createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getGurus() {
  const admin = createAdminClient()
  
  // get all roles
  const { data: roles } = await admin.from('user_roles').select('*')
  
  // get all users
  const { data: { users }, error } = await admin.auth.admin.listUsers()
  
  if (error || !users) return []
  
  return users.map(user => {
    const role = roles?.find(r => r.user_id === user.id)?.role || 'guru'
    return {
      id: user.id,
      email: user.email,
      role,
      created_at: user.created_at
    }
  }).sort((a, b) => {
    // Sort admin first, then by email
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return (a.email || "").localeCompare(b.email || "");
  })
}

export async function createGuru(formData: FormData) {
  let username = formData.get("username") as string
  const password = formData.get("password") as string
  
  if (!username || !password) return { error: "Username dan password wajib diisi" }
  
  username = username.trim()
  const email = username.includes("@") ? username : `${username}@smanet.local`

  const admin = createAdminClient()
  
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (error) return { error: error.message }
  
  if (data.user) {
    await admin.from('user_roles').insert({
      user_id: data.user.id,
      role: 'guru'
    })
  }
  
  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteGuru(id: string) {
  const admin = createAdminClient()
  
  // delete user from auth.users (will cascade to user_roles)
  const { error } = await admin.auth.admin.deleteUser(id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/admin/users')
  return { success: true }
}
