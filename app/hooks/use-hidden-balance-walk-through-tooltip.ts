import { useQuery } from "@apollo/client"
import { HIDDEN_BALANCE_TOOL_TIP } from "../graphql/client-only-query"

export const useHiddenBalanceToolTip = (): boolean => {
  const { data } = useQuery(HIDDEN_BALANCE_TOOL_TIP)
  return data?.hiddenBalanceToolTip ?? false
}
