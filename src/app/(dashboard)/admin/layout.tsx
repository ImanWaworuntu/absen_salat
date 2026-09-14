import { getUserProfile } from "@/app/(dashboard)/actions"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect("/login")
  }
  
  if (profile.role !== "admin") {
    redirect("/scan")
  }

  return <>{children}</>
}
