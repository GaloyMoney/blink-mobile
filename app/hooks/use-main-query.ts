import { useQuery } from "@apollo/client"
import { MAIN_QUERY } from "@app/graphql/query"
import useToken from "@app/utils/use-token"
import NetInfo from "@react-native-community/netinfo"
import { translateUnknown as translate } from "@galoymoney/client"
import crashlytics from "@react-native-firebase/crashlytics"

const useMainQuery = (): useMainQueryOutput => {
  const { hasToken } = useToken()
  const { data, previousData, error, loading, refetch } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
    fetchPolicy: "cache-and-network",
  })
  let errors = []
  if (error) {
    if (error.graphQLErrors?.length > 0 && previousData) {
      // We got an error back from the server but we have data in the cache
      errors = [...error.graphQLErrors]
    }
    if (error.graphQLErrors?.length > 0 && !previousData) {
      // This is the first execution of mainquery and we received errors back from the server
      error.graphQLErrors.forEach((e) => {
        crashlytics().recordError(e)
        console.log(e)
      })
    }
    if (error.networkError && previousData) {
      // Call to mainquery has failed but we have data in the cache
      NetInfo.fetch().then((state) => {
        if (!state.isConnected) {
          // We failed to fetch the data because the device is offline
          errors.push({ message: translate("errors.network.connection") })
        } else {
          errors.push({ message: translate("errors.network.request") })
        }
      })
    }
    if (error.networkError && !previousData) {
      // This is the first execution of mainquery and it has failed
      crashlytics().recordError(error.networkError)
      // TODO: check if error is INVALID_AUTHENTICATION here
      // throw new Error(
      //   "Did not receive a response from main query.  Either the network is offline or servers are not responding.",
      // )
    }
  }
  const userPreferredLanguage = data?.me?.language
  const btcWallet = data?.me?.defaultAccount?.wallets?.find(
    (wallet) => wallet?.__typename === "BTCWallet",
  )
  const btcWalletBalance = btcWallet?.balance
  const btcWalletId = btcWallet?.id
  const transactionsEdges = btcWallet?.transactions?.edges
  const me = data?.me || {}
  const myPubKey = data?.globals?.nodesIds?.[0] ?? ""
  const username = data?.me?.username
  const phoneNumber = data?.me?.phone
  const mobileVersions = data?.mobileVersions

  return {
    userPreferredLanguage,
    btcWalletBalance,
    btcWalletId,
    transactionsEdges,
    me,
    myPubKey,
    username,
    phoneNumber,
    mobileVersions,
    loading,
    refetch,
    errors,
  }
}

export default useMainQuery
