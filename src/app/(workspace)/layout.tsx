import { AuthGuard } from '@/components/auth/auth-guard'
import { AppShell } from '@/components/layout/Sidebar'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
