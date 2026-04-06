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

export function extractPrivyIdentity(privyUser: MaybePrivyUser | null | undefined) {
  if (!privyUser) {
    return {
      email: null,
      walletAddress: null,
    }
  }

  const linkedAccounts = privyUser.linkedAccounts ?? privyUser.linked_accounts ?? []
  const email = privyUser.email?.address?.toLowerCase() ?? linkedAccounts.find((account) => account.type === 'email')?.email ?? null
  const walletAddress = linkedAccounts.find((account) => typeof account.address === 'string' && account.address.trim().length > 0)?.address ?? null

  return {
    email,
    walletAddress,
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
