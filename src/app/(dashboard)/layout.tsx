import { getUserProfile } from "./actions"
import ClientSidebar from "./ClientSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      <ClientSidebar role={profile?.role || "guru"} email={profile?.email || null} />
      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
