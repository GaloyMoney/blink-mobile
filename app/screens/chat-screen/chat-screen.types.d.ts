type Chat = {
  readonly id: string
  readonly name: string
  readonly username: string
  readonly alias?: string | null
  lud16: string
  picture: string | null
  readonly transactionsCount: number | null
}

type NostrProfile = {
  pubkey: string
  name: string
  nip05: string
  picture: string
  lud16: string
}
