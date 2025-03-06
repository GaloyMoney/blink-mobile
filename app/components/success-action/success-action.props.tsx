import { LNURLPaySuccessAction } from "lnurl-pay/dist/types/types"

export type SuccessActionComponentProps = {
  successAction?: LNURLPaySuccessAction
  preimage?: string
}
