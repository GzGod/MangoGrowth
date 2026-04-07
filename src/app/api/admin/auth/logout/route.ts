import { routeErrorResponse } from '@/lib/auth/request'
import { clearAdminSessionResponse } from '@/lib/admin-auth/service'

export async function POST() {
  try {
    return clearAdminSessionResponse()
  } catch (error) {
    return routeErrorResponse(error)
  }
}
