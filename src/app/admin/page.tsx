import { redirect } from 'next/navigation'

import { AdminScreen } from '@/components/admin/admin-screen'
import { AppShell } from '@/components/layout/Sidebar'
import { getAdminSession } from '@/lib/admin-auth/service'

export default async function AdminPage() {
  const admin = await getAdminSession()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <AppShell>
      <AdminScreen admin={admin} />
    </AppShell>
  )
}
