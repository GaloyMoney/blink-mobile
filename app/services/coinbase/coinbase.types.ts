import { GeneralApiProblem } from "./coinbase-problem"

// export interface Price {
//   price: number
// }

export type GetPriceResult = { kind: "ok", price: number } | GeneralApiProblem