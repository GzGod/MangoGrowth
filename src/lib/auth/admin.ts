export function parseBootstrapAdminEmails(value: string | undefined) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isBootstrapAdmin(email: string | null | undefined, adminEmails: string[]) {
  if (!email) {
    return false
  }

  return adminEmails.includes(email.trim().toLowerCase())
}
