import { MUTATIONS, createGaloyServerClient, GaloyGQL } from "@galoymoney/client"
import { ApolloQueryResult, gql } from "@apollo/client"

const config = {
  network: "signet",
  graphqlUrl: "https://api.staging.galoy.io/graphql",
}

const authToken = process.env.GALOY_TOKEN_2

export const getInvoice = async () => {
  const client = createGaloyServerClient({ config })({ authToken })
  // get BTC wallet id
  const accountResult: ApolloQueryResult<{ me: GaloyGQL.MeFragment }> =
    await client.query({
      query: gql`
        {
          me {
            defaultAccount {
              wallets {
                walletCurrency
                id
              }
            }
          }
        }
      `,
      fetchPolicy: "no-cache",
    })
  const walletId = accountResult.data.me.defaultAccount.wallets.filter(
    (w) => w.walletCurrency === "BTC",
  )[0].id

  const result = await client.mutate({
    variables: { input: { walletId } }, // (lookup wallet 2 id from graphql) i.e "8914b38f-b0ea-4639-9f01-99c03125eea5"
    mutation: MUTATIONS.lnNoAmountInvoiceCreate,
    fetchPolicy: "no-cache",
  })
  const invoice = result.data.lnNoAmountInvoiceCreate.invoice.paymentRequest

  return invoice
}

export const payInvoice = async (invoice: string) => {
  const client = createGaloyServerClient({ config })({ authToken })
  const accountResult: ApolloQueryResult<{ me: GaloyGQL.MeFragment }> =
    await client.query({
      query: gql`
        {
          me {
            defaultAccount {
              wallets {
                walletCurrency
                id
              }
            }
          }
        }
      `,
      fetchPolicy: "no-cache",
    })
  const walletId = accountResult.data.me.defaultAccount.wallets.filter(
    (w) => w.walletCurrency === "BTC",
  )[0].id

  return client.mutate({
    variables: {
      input: {
        walletId,
        paymentRequest: invoice,
        amount: 5,
      },
    },
    mutation: MUTATIONS.lnNoAmountInvoicePaymentSend,
    fetchPolicy: "no-cache",
  })
}
