type GetFullUriInput = {
  input: string
  amount?: number
  memo?: string
  uppercase?: boolean
  prefix?: boolean
  type?: "bitcoin" | "lightning"
}
