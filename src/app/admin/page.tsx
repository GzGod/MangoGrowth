import { redirect } from 'next/navigation'

import { AdminScreen } from '@/components/admin/admin-screen'
import { getAdminSession } from '@/lib/admin-auth/service'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await getAdminSession()

  if (!admin) {
    redirect('/admin/login')
  }

  return <AdminScreen admin={admin} />
}
