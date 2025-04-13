import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "sonner"

export default function PushAndCheckLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
} 