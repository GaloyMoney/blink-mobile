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
  LnNoAmountInvoiceCreateDocument,
  LnNoAmountInvoicePaymentSendDocument,
  UserUpdateLanguageDocument,
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

const randomizeTokens = (arr: string[]): string => {
  const randomIndex = Math.floor(Math.random() * arr.length)
  return arr[randomIndex]
}

const authTokens = process.env.GALOY_TEST_TOKENS?.split(",") || []
const receiverToken = process.env.GALOY_TOKEN_2 || ""
export const mobileUserToken = randomizeTokens(authTokens)

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
  const client = createGaloyServerClient(config)(mobileUserToken)
  const contactResult = await client.query<ContactsQuery>({
    query: ContactsDocument,
    fetchPolicy: "no-cache",
  })
  const contactList = contactResult.data.me?.contacts
  const isContactAvailable = contactResult.data.me?.contacts.some(
    (contact) => contact.username === username,
  )
  return { isContactAvailable, contactList }
}

const getWalletId = async (client: ApolloClient<NormalizedCacheObject>) => {
  const accountResult = await client.query<WalletsQuery>({
    query: WalletsDocument,
    fetchPolicy: "no-cache",
  })
  const walletId = accountResult.data.me?.defaultAccount.wallets.filter(
    (w) => w.walletCurrency === "BTC",
  )[0].id

  return walletId
}

export const getInvoice = async () => {
  const client = createGaloyServerClient(config)(receiverToken)
  const walletId = await getWalletId(client)

  const result = await client.mutate({
    variables: { input: { walletId } }, // (lookup wallet 2 id from graphql) i.e "8914b38f-b0ea-4639-9f01-99c03125eea5"
    mutation: LnNoAmountInvoiceCreateDocument,
    fetchPolicy: "no-cache",
  })
  const invoice = result.data.lnNoAmountInvoiceCreate.invoice.paymentRequest

  return invoice
}

export const payInvoice = async (invoice: string) => {
  const client = createGaloyServerClient(config)(receiverToken)
  const walletId = await getWalletId(client)

  return client.mutate({
    variables: {
      input: {
        walletId,
        paymentRequest: invoice,
        amount: 150,
      },
    },
    mutation: LnNoAmountInvoicePaymentSendDocument,
    fetchPolicy: "no-cache",
  })
}

export const resetLanguage = async () => {
  const client = createGaloyServerClient(config)(mobileUserToken)

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
