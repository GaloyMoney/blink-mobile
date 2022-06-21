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
        console.debug(e)
      })
    }
    if (error.networkError && previousData) {
      // Call to mainquery has failed but we have data in the cache
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          errors.push({ message: translate("errors.network.request") })
        } else {
          // We failed to fetch the data because the device is offline
          errors.push({ message: translate("errors.network.connection") })
        }
      })
    }
    if (error.networkError && !previousData) {
      // This is the first execution of mainquery and it has failed
      crashlytics().recordError(error.networkError)
      // TODO: check if error is INVALID_AUTHENTICATION here
    }
  }
  const userPreferredLanguage = data?.me?.language
  const wallets = data?.me?.defaultAccount?.wallets
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId
  const defaultWallet = wallets?.find((wallet) => wallet?.id === defaultWalletId)
  const btcWallet = wallets?.find((wallet) => wallet?.__typename === "BTCWallet")
  const usdWallet = wallets?.find((wallet) => wallet?.__typename === "UsdWallet")

  const btcWalletBalance = btcWallet?.balance
  const usdWalletBalance = usdWallet?.balance ?? 0
  const btcWalletId = btcWallet?.id
  const usdWalletId = usdWallet?.id
  const me = data?.me || {}
  const myPubKey = data?.globals?.nodesIds?.[0] ?? ""
  const username = data?.me?.username
  const phoneNumber = data?.me?.phone
  const mobileVersions = data?.mobileVersions
  const mergedTransactions = me.defaultAccount?.transactions.edges

  const initialBtcPrice = data?.btcPrice

  return {
    userPreferredLanguage,
    btcWalletBalance,
    usdWalletBalance,
    btcWalletId,
    usdWalletId,
    defaultWalletId,
    defaultWallet,
    mergedTransactions,
    wallets,
    me,
    myPubKey,
    username,
    phoneNumber,
    mobileVersions,
    initialBtcPrice,
    loading,
    refetch,
    errors,
  }
}

export default useMainQuery
