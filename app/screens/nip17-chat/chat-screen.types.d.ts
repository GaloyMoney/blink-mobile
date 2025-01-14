type Chat = {
  readonly id: string
  readonly name?: string
  readonly username?: string
  readonly alias?: string | null
  lud16?: string
  picture?: string | null
  readonly transactionsCount?: number | null
  groupId: string
}

type NIP17Chat = {
  id: string
  subject: string
  participants: string[]
}

type NostrProfile = {
  pubkey?: string
  username?: string
  name?: string
  nip05?: string
  picture?: string
  lud16?: string
}
