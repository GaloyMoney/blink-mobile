type Chat = {
  readonly id: string
  readonly name: string
  readonly username: string
  readonly alias?: string | null
  picture: string | null
  readonly transactionsCount: number | null
}

type NostrProfile = {
  pubkey: string
  name: string
  nip05: string
  picture: string
}
