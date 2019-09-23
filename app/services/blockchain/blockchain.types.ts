import { GeneralApiProblem } from "./blockchain-problem"

// export interface Price {
//   price: number
// }

export type GetWalletInfo = { kind: "ok", balance: number } | GeneralApiProblem