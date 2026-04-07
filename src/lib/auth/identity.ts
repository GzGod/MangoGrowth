type MaybeLocalUser = {
  email: string | null
  walletAddress: string | null
}

type PrivyEmailValue = string | { address?: string | null } | null | undefined
type PrivyWalletValue = { address?: string | null } | null | undefined

type PrivyLinkedAccount = {
  type?: string
  address?: string | null
  email?: PrivyEmailValue
}

type MaybePrivyUser = {
  email?: { address?: string | null } | null
  wallet?: PrivyWalletValue
  google?: { email?: string | null } | null
  discord?: { email?: string | null } | null
  github?: { email?: string | null } | null
  apple?: { email?: string | null } | null
  linkedin?: { email?: string | null } | null
  spotify?: { email?: string | null } | null
  linkedAccounts?: PrivyLinkedAccount[] | null
  linked_accounts?: PrivyLinkedAccount[] | null
}

function truncateWalletAddress(value: string) {
  if (value.length <= 14) {
    return value
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function normalizeString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function normalizeEmail(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim().toLowerCase()
  }

  if (value && typeof value === 'object' && 'address' in value) {
    const nested = normalizeString((value as { address?: unknown }).address)
    return nested ? nested.toLowerCase() : null
  }

  return null
}

function normalizeWalletAddress(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 0 && !value.includes('@')) {
    return value.trim()
  }

  if (value && typeof value === 'object' && 'address' in value) {
    return normalizeWalletAddress((value as { address?: unknown }).address)
  }

  return null
}

export function getPrivyLinkedAccounts(privyUser: MaybePrivyUser | null | undefined) {
  return privyUser?.linkedAccounts ?? privyUser?.linked_accounts ?? []
}

export function extractPrivyEmail(privyUser: MaybePrivyUser | null | undefined) {
  const directEmail = normalizeEmail(privyUser?.email)
  if (directEmail) {
    return directEmail
  }

  const topLevelOauthEmail =
    normalizeEmail(privyUser?.google?.email) ??
    normalizeEmail(privyUser?.discord?.email) ??
    normalizeEmail(privyUser?.github?.email) ??
    normalizeEmail(privyUser?.apple?.email) ??
    normalizeEmail(privyUser?.linkedin?.email) ??
    normalizeEmail(privyUser?.spotify?.email)

  if (topLevelOauthEmail) {
    return topLevelOauthEmail
  }

  const linkedAccounts = getPrivyLinkedAccounts(privyUser)
  const linkedEmail = linkedAccounts
    .map((account) => normalizeEmail(account.email) ?? normalizeEmail(account.address))
    .find(Boolean)

  return linkedEmail ?? null
}

export function extractPrivyWalletAddress(privyUser: MaybePrivyUser | null | undefined) {
  const directWallet = normalizeWalletAddress(privyUser?.wallet)
  if (directWallet) {
    return directWallet
  }

  const linkedAccounts = getPrivyLinkedAccounts(privyUser)
  const linkedWallet = linkedAccounts.map((account) => normalizeWalletAddress(account.address)).find(Boolean)
  return linkedWallet ?? null
}

export function extractPrivyIdentity(privyUser: MaybePrivyUser | null | undefined) {
  if (!privyUser) {
    return {
      email: null,
      walletAddress: null,
    }
  }

  return {
    email: extractPrivyEmail(privyUser),
    walletAddress: extractPrivyWalletAddress(privyUser),
  }
}

export function resolveDisplayIdentity(
  localUser: MaybeLocalUser | null,
  privyIdentity: { email: string | null; walletAddress: string | null },
  isAuthenticated: boolean,
) {
  const email = localUser?.email ?? privyIdentity.email
  if (email) {
    return { label: email, title: email }
  }

  const walletAddress = localUser?.walletAddress ?? privyIdentity.walletAddress
  if (walletAddress) {
    return {
      label: truncateWalletAddress(walletAddress),
      title: walletAddress,
    }
  }

  if (isAuthenticated) {
    return {
      label: '账户已连接',
      title: '账户已连接',
    }
  }

  return {
    label: '未登录',
    title: '未登录',
  }
}
