type MaybeLocalUser = {
  email: string | null
  walletAddress: string | null
}

type PrivyLinkedAccount = {
  type?: string
  address?: string | null
  email?: string | null
}

type MaybePrivyUser = {
  email?: { address?: string | null } | null
  linkedAccounts?: PrivyLinkedAccount[] | null
  linked_accounts?: PrivyLinkedAccount[] | null
}

function truncateWalletAddress(value: string) {
  if (value.length <= 14) {
    return value
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export function getPrivyLinkedAccounts(privyUser: MaybePrivyUser | null | undefined) {
  return privyUser?.linkedAccounts ?? privyUser?.linked_accounts ?? []
}

export function extractPrivyEmail(privyUser: MaybePrivyUser | null | undefined) {
  const directEmail = privyUser?.email?.address?.trim().toLowerCase()
  if (directEmail) {
    return directEmail
  }

  const linkedAccounts = getPrivyLinkedAccounts(privyUser)
  const accountWithEmail = linkedAccounts.find((account) => {
    const email = account.email?.trim()
    const address = account.address?.trim()
    return Boolean(email) || Boolean(address && address.includes('@'))
  })

  const candidate = accountWithEmail?.email?.trim() ?? accountWithEmail?.address?.trim() ?? null
  return candidate ? candidate.toLowerCase() : null
}

export function extractPrivyWalletAddress(privyUser: MaybePrivyUser | null | undefined) {
  const linkedAccounts = getPrivyLinkedAccounts(privyUser)
  return linkedAccounts.find((account) => typeof account.address === 'string' && account.address.trim().length > 0 && !account.address.includes('@'))
    ?.address?.trim() ?? null
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
