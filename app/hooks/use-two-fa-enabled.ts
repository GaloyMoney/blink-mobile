import { useQuery } from "@apollo/client"
import { GET_TWO_FA_ENABLED } from "../graphql/query"

export const useTwoFAEnabled = (): boolean => {
  const { data } = useQuery(GET_TWO_FA_ENABLED)
  return data?.me?.twoFAEnabled ?? false
}
