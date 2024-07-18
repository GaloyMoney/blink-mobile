type Card = {
  readonly id: string
  readonly name: string
  readonly username: string
  readonly alias?: string | null
  lud16: string
  picture: string | null
  readonly transactionsCount: number | null
}

type FlashCards = {
  uuid: string
  name: string
  amount: string
  qr: string
  order: number
}
