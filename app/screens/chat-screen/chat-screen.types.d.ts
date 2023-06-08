type Chat = {
  npub: string
  nsec: string
  readonly id: string
  readonly username: string
  readonly alias?: string | null
  readonly transactionsCount: number
}
