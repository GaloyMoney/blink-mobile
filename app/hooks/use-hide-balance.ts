import { useQuery } from "@apollo/client"
import { HIDE_BALANCE } from "../graphql/client-only-query"

export const useHideBalance = (): boolean => {
  const { data } = useQuery(HIDE_BALANCE)
  return data?.hideBalance ?? false
}
