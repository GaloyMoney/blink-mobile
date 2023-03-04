import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
  gql,
  ApolloLink,
} from "@apollo/client"
import {
  ContactsDocument,
  ContactsQuery,
  IntraLedgerPaymentSendDocument,
  IntraLedgerPaymentSendMutation,
  LnInvoicePaymentSendMutation,
  LnInvoicePaymentSendDocument,
  LnNoAmountInvoiceCreateDocument,
  LnNoAmountInvoicePaymentSendDocument,
  LnNoAmountInvoicePaymentSendMutation,
  LnNoAmountUsdInvoicePaymentSendDocument,
  LnNoAmountUsdInvoicePaymentSendMutation,
  UserUpdateLanguageDocument,
  WalletCurrency,
  WalletsDocument,
  WalletsQuery,
} from "../../app/graphql/generated"
import { RetryLink } from "@apollo/client/link/retry"

import fetch from "cross-fetch"

type Config = {
  network: string
  graphqlUrl: string
}

const config = {
  network: "signet",
  graphqlUrl: "https://api.staging.galoy.io/graphql",
}

const createGaloyServerClient = (config: Config) => (authToken: string) => {
  const httpLink = createHttpLink({
    uri: config.graphqlUrl,
    headers: {
      authorization: authToken ? `Bearer ${authToken}` : "",
    },
    fetch,
  })

  const retryLink = new RetryLink()

  const link = ApolloLink.from([retryLink, httpLink])

  return new ApolloClient({
    ssrMode: true,
    link,
    cache: new InMemoryCache(),
  })
}

const getRandomToken = (arr: string[]): string => {
  const randomIndex = Math.floor(Math.random() * arr.length)
  console.log("Choosing token at random index: ", randomIndex)
  return arr[randomIndex]
}

const authTokens = process.env.GALOY_TEST_TOKENS?.split(",")
if (authTokens === undefined) {
  console.error("-----------------------------")
  console.error("GALOY_TEST_TOKENS not set")
  console.error("-----------------------------")
  process.exit(1)
}

export const userToken = getRandomToken(authTokens)

const receiverToken = process.env.GALOY_TOKEN_2 || ""

gql`
  query wallets {
    me {
      id
      defaultAccount {
        id
        wallets {
          walletCurrency
          id
        }
      }
    }
  }
`

export const checkContact = async (username?: string) => {
  const client = createGaloyServerClient(config)(userToken)
  const contactResult = await client.query<ContactsQuery>({
    query: ContactsDocument,
    fetchPolicy: "no-cache",
  })
  const contactList = contactResult.data.me?.contacts
  const isContactAvailable = contactResult.data.me?.contacts.some(
    (contact) => contact.username.toLocaleLowerCase() === username?.toLocaleLowerCase(),
  )
  return { isContactAvailable, contactList }
}

const getWalletId = async (
  client: ApolloClient<NormalizedCacheObject>,
  walletCurrency: WalletCurrency,
) => {
  const accountResult = await client.query<WalletsQuery>({
    query: WalletsDocument,
    fetchPolicy: "no-cache",
  })
  const walletId = accountResult.data.me?.defaultAccount.wallets.filter(
    (w) => w.walletCurrency === walletCurrency,
  )[0].id

  return walletId
}

export const getInvoice = async () => {
  const client = createGaloyServerClient(config)(receiverToken)
  const walletId = await getWalletId(client, "BTC")

  const result = await client.mutate({
    variables: { input: { walletId } }, // (lookup wallet 2 id from graphql) i.e "8914b38f-b0ea-4639-9f01-99c03125eea5"
    mutation: LnNoAmountInvoiceCreateDocument,
    fetchPolicy: "no-cache",
  })
  const invoice = result.data.lnNoAmountInvoiceCreate.invoice.paymentRequest

  return invoice
}

export const payAmountInvoice = async ({
  invoice,
  memo,
}: {
  invoice: string
  memo: string
}) => {
  const client = createGaloyServerClient(config)(receiverToken)
  const walletId = await getWalletId(client, "BTC")

  const result = await client.mutate<LnInvoicePaymentSendMutation>({
    variables: {
      input: {
        memo,
        walletId,
        paymentRequest: invoice,
      },
    },
    mutation: LnInvoicePaymentSendDocument,
    fetchPolicy: "no-cache",
  })
  const paymentStatus = result.data?.lnInvoicePaymentSend.status
  return { paymentStatus, result }
}

export const payNoAmountInvoice = async ({
  invoice,
  walletCurrency,
}: {
  invoice: string
  walletCurrency: WalletCurrency
}) => {
  const client = createGaloyServerClient(config)(receiverToken)
  const walletId = await getWalletId(client, walletCurrency)
  const mutation =
    walletCurrency === WalletCurrency.Btc
      ? LnNoAmountInvoicePaymentSendDocument
      : LnNoAmountUsdInvoicePaymentSendDocument
  const amount = walletCurrency === WalletCurrency.Btc ? 150 : 2

  const result = await client.mutate<
    LnNoAmountInvoicePaymentSendMutation | LnNoAmountUsdInvoicePaymentSendMutation
  >({
    variables: {
      input: {
        walletId,
        paymentRequest: invoice,
        amount,
      },
    },
    mutation,
    fetchPolicy: "no-cache",
  })
  let paymentStatus: string | undefined | null
  if (result.data) {
    if ("lnNoAmountInvoicePaymentSend" in result.data) {
      paymentStatus = result.data?.lnNoAmountInvoicePaymentSend.status
    } else if ("lnNoAmountUsdInvoicePaymentSend" in result.data) {
      paymentStatus = result.data?.lnNoAmountUsdInvoicePaymentSend.status
    }
  }
  return { paymentStatus, result }
}

export const resetLanguage = async () => {
  const client = createGaloyServerClient(config)(userToken)

  return client.mutate({
    variables: {
      input: {
        language: "",
      },
    },
    mutation: UserUpdateLanguageDocument,
    fetchPolicy: "no-cache",
  })
}

export const payTestUsername = async () => {
  const userClient = createGaloyServerClient(config)(userToken)
  const recipientClient = createGaloyServerClient(config)(receiverToken)
  const walletId = await getWalletId(userClient, "BTC")
  const recipientWalletId = await getWalletId(recipientClient, "BTC")

  const result = await userClient.mutate<IntraLedgerPaymentSendMutation>({
    variables: {
      input: {
        walletId,
        recipientWalletId,
        amount: 100,
      },
    },
    mutation: IntraLedgerPaymentSendDocument,
    fetchPolicy: "no-cache",
  })
  return result
}
