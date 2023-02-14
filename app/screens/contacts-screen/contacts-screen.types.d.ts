type Contact = {
  readonly id: string
  readonly username: string
  readonly alias?: string | null
  readonly transactionsCount: number
}

type ContactWithOnPress = Contact & {
  readonly onPress: () => void
}
