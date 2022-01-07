import { useQuery } from "@apollo/client"
import { TRANSACTIONS_LIST } from "@app/graphql/query"

export const useTransactions = () => {
  const { error, data, refetch, loading, fetchMore } = useQuery(TRANSACTIONS_LIST, {
    variables: { first: 20, after: null },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })

  const transactions = data?.me?.defaultAccount?.wallets[0]?.transactions?.edges.map(
    (edge) => ({ ...edge.node, cursor: edge.cursor }),
  )
  const pageInfo = data?.me?.defaultAccount?.wallets[0]?.transactions?.pageInfo
  console.log(pageInfo)
  console.log(transactions)
  return {
    error,
    transactions,
    pageInfo,
    refetch,
    loading,
    fetchMore,
  }
}
