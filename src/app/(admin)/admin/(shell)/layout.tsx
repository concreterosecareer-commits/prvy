import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <AdminSidebar displayName="Admin" username="admin" />
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-5 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
