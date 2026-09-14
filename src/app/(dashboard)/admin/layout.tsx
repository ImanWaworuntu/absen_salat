import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }
  
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()
  
  if (data?.role !== "admin") {
    redirect("/scan")
  }

  return <>{children}</>
}
