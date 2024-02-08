import {
  LnInvoiceCreateMutation,
  LnNoAmountInvoiceCreateMutation,
  OnChainAddressCurrentMutation,
  WalletCurrency,
} from "@app/graphql/generated"
import {
  CreatePaymentRequestParams,
  GetFullUriFn,
  Invoice,
  PaymentRequest,
  PaymentRequestState,
  PaymentRequestStateType,
  PaymentRequestInformation,
} from "./index.types"
import { BtcMoneyAmount } from "@app/types/amounts"
import { getPaymentRequestFullUri, prToDateString } from "./helpers"
import { bech32 } from "bech32"

// Breez SDK
import {
  receivePaymentBreezSDK,
  receiveOnchainBreezSDK,
  breezHealthCheck,
} from "@app/utils/breez-sdk"
import { LnInvoice, SwapInfo } from "@breeztech/react-native-breez-sdk"
import { GraphQLError } from "graphql/error/GraphQLError"

export const createPaymentRequest = (
  params: CreatePaymentRequestParams,
): PaymentRequest => {
  let { state, info } = params
  if (!state) state = PaymentRequestState.Idle

  const setState = (state: PaymentRequestStateType) => {
    if (state === PaymentRequestState.Loading)
      return createPaymentRequest({ ...params, state, info: undefined })
    return createPaymentRequest({ ...params, state })
  }

  // Breez SDK
  const fetchBreezOnchain = async () => {
    try {
      const populateFormattedBreezOnChain = (
        rawOnChainData: SwapInfo | undefined,
      ): Promise<OnChainAddressCurrentMutation | null | undefined> => {
        if (rawOnChainData) {
          const formattedBreezOnChain: OnChainAddressCurrentMutation = {
            onChainAddressCurrent: {
              errors: [], // TODO: Add error handling
              address: rawOnChainData.bitcoinAddress,
              __typename: "OnChainAddressPayload",
            },
            __typename: "Mutation",
          }
          return Promise.resolve(formattedBreezOnChain)
        }
        return Promise.resolve(null)
      }
      const breezOnChainData = populateFormattedBreezOnChain
      const fetchedBreezOnChain = await receiveOnchainBreezSDK({})
      const formattedOnChain = await breezOnChainData(fetchedBreezOnChain)
      return formattedOnChain
    } catch (error) {
      console.error("Error fetching breezOnChain:", error)
    }
  }

  const fetchBreezInvoice = async (
    amount?: number | undefined,
    memo?: string | undefined,
  ) => {
    try {
      let breezInvoiceData
      if (amount) {
        const populateFormattedBreezInvoice = (
          rawInvoiceData: LnInvoice | undefined,
        ): Promise<
          LnNoAmountInvoiceCreateMutation | LnInvoiceCreateMutation | null | undefined
        > => {
          if (rawInvoiceData) {
            const formattedBreezInvoice: LnInvoiceCreateMutation = {
              lnInvoiceCreate: {
                errors: [],
                invoice: {
                  paymentHash: rawInvoiceData.paymentHash,
                  paymentRequest: rawInvoiceData.bolt11,
                  paymentSecret: rawInvoiceData.paymentSecret
                    ? Array.from(rawInvoiceData.paymentSecret)
                        .map((byte) => byte.toString(16))
                        .join("")
                    : "",
                  __typename: "LnInvoice",
                },
                __typename: "LnInvoicePayload",
              },
              __typename: "Mutation",
            }
            return Promise.resolve(formattedBreezInvoice)
          }
          return Promise.resolve(null)
        }
        breezInvoiceData = populateFormattedBreezInvoice
      } else {
        const populateFormattedNoAmountBreezInvoice = (
          rawInvoiceData: LnInvoice | undefined,
        ): Promise<
          LnNoAmountInvoiceCreateMutation | LnInvoiceCreateMutation | null | undefined
        > => {
          if (rawInvoiceData) {
            const formattedBreezInvoice: LnNoAmountInvoiceCreateMutation = {
              lnNoAmountInvoiceCreate: {
                errors: [],
                invoice: {
                  paymentHash: rawInvoiceData.paymentHash,
                  paymentRequest: rawInvoiceData.bolt11,
                  paymentSecret: rawInvoiceData.paymentSecret
                    ? Array.from(rawInvoiceData.paymentSecret)
                        .map((byte) => byte.toString(16))
                        .join("")
                    : "",
                  __typename: "LnNoAmountInvoice",
                },
                __typename: "LnNoAmountInvoicePayload",
              },
              __typename: "Mutation",
            }
            return Promise.resolve(formattedBreezInvoice)
          }
          return Promise.resolve(null)
        }
        breezInvoiceData = populateFormattedNoAmountBreezInvoice
      }
      const amountSats = amount ? amount : 1
      const memoDetail = memo ? memo : "Invoice to BTC wallet"
      console.log("creating breez invoice")
      const fetchedBreezInvoice = await receivePaymentBreezSDK({
        amountMsat: amountSats * 1000,
        description: memoDetail,
      })
      const formattedInvoice = await breezInvoiceData(fetchedBreezInvoice.lnInvoice)
      return formattedInvoice
    } catch (error) {
      console.error("Error fetching breezInvoice:", error)
    }
  }

  // The hook should setState(Loading) before calling this
  const generateQuote: () => Promise<PaymentRequest> = async () => {
    const { creationData, mutations } = params
    const pr = { ...creationData } // clone creation data object
    let breezNoAmountInvoiceCreateData:
      | LnNoAmountInvoiceCreateMutation
      | LnInvoiceCreateMutation
      | null
      | undefined
    let breezOnChainAddressCurrentData: OnChainAddressCurrentMutation | null | undefined
    if (
      creationData.receivingWalletDescriptor.currency === WalletCurrency.Btc &&
      pr.type === Invoice.Lightning
    ) {
      breezNoAmountInvoiceCreateData = await fetchBreezInvoice(
        pr.settlementAmount?.amount,
        pr.memo,
      )
    } else if (
      creationData.receivingWalletDescriptor.currency === WalletCurrency.Btc &&
      pr.type === Invoice.OnChain
    ) {
      breezOnChainAddressCurrentData = await fetchBreezOnchain()
    }

    let info: PaymentRequestInformation | undefined

    // Default memo
    if (!pr.memo) pr.memo = "Invoice to USD wallet"

    // On Chain BTC
    if (pr.type === Invoice.OnChain) {
      let data = null
      let errors: readonly GraphQLError[] | undefined = []
      if (
        pr.receivingWalletDescriptor &&
        pr.receivingWalletDescriptor.currency === WalletCurrency.Usd
      ) {
        console.log("Creating Ibex Bitcoin On Chain Invoice")
        const result = await mutations.onChainAddressCurrent({
          variables: { input: { walletId: pr.receivingWalletDescriptor.id } },
        })
        data = result.data
        errors = result.errors || []
      } else if (
        pr.receivingWalletDescriptor &&
        pr.receivingWalletDescriptor.currency === WalletCurrency.Btc &&
        breezOnChainAddressCurrentData
      ) {
        console.log("Creating Breez BTC Bitcoin On Chain Invoice")
        data = breezOnChainAddressCurrentData
        errors = []
      }

      if (pr.settlementAmount && pr.settlementAmount.currency !== WalletCurrency.Btc)
        throw new Error("Onchain invoices only support BTC")

      const address = data?.onChainAddressCurrent?.address || undefined

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.OnChain,
          input: address || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      info = {
        data: address
          ? {
              invoiceType: Invoice.OnChain,
              getFullUriFn,
              address,
              amount: pr.settlementAmount as BtcMoneyAmount,
              memo: pr.memo,
            }
          : undefined,
        applicationErrors: data?.onChainAddressCurrent?.errors,
        gqlErrors: errors,
      }

      // Lightning without Amount (or zero-amount)
    } else if (
      pr.type === Invoice.Lightning &&
      (pr.settlementAmount === undefined || pr.settlementAmount.amount === 0) &&
      pr.receivingWalletDescriptor.currency === WalletCurrency.Btc
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let errors: any
      if (breezNoAmountInvoiceCreateData) {
        data = breezNoAmountInvoiceCreateData
        errors = []
      }

      const dateString = prToDateString(
        data?.lnNoAmountInvoiceCreate.invoice?.paymentRequest ?? "",
        "mainnet", // pr.network ,
      )

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: data?.lnNoAmountInvoiceCreate.invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      info = {
        data: data?.lnNoAmountInvoiceCreate.invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...data?.lnNoAmountInvoiceCreate.invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors: data?.lnNoAmountInvoiceCreate?.errors,
        gqlErrors: errors,
      }

      // Lightning with BTC Amount
    } else if (
      pr.type === Invoice.Lightning &&
      pr.settlementAmount &&
      pr.settlementAmount?.currency === WalletCurrency.Btc
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let errors: any
      if (breezNoAmountInvoiceCreateData) {
        data = breezNoAmountInvoiceCreateData
        errors = []
      }

      const dateString = prToDateString(
        data?.lnInvoiceCreate.invoice?.paymentRequest ?? "",
        "mainnet", // pr.network,
      )

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: data?.lnInvoiceCreate.invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      info = {
        data: data?.lnInvoiceCreate.invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...data?.lnInvoiceCreate.invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors: data?.lnInvoiceCreate?.errors,
        gqlErrors: errors,
      }
      // Lightning with USD Amount
    } else if (
      pr.type === Invoice.Lightning &&
      pr.settlementAmount &&
      pr.settlementAmount?.currency === WalletCurrency.Usd
    ) {
      const { data, errors } = await mutations.lnUsdInvoiceCreate({
        variables: {
          input: {
            walletId: pr.receivingWalletDescriptor.id,
            amount: pr.settlementAmount.amount,
            memo: pr.memo,
          },
        },
      })

      const dateString = prToDateString(
        data?.lnUsdInvoiceCreate.invoice?.paymentRequest ?? "",
        "mainnet", // pr.network,
      )

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: data?.lnUsdInvoiceCreate.invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      info = {
        data: data?.lnUsdInvoiceCreate.invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...data?.lnUsdInvoiceCreate.invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors: data?.lnUsdInvoiceCreate?.errors,
        gqlErrors: errors,
      }
      // Lightning with USD without amount
    } else if (
      pr.type === Invoice.Lightning &&
      (pr.settlementAmount === undefined || pr.settlementAmount.amount === 0)
    ) {
      console.log("Creating Ibex Lightning Invoice")
      breezHealthCheck()
      const { data, errors } = await mutations.lnUsdInvoiceCreate({
        variables: {
          input: {
            walletId: pr.receivingWalletDescriptor.id,
            amount: 0,
            memo: pr.memo,
          },
        },
      })
      const dateString = prToDateString(
        data?.lnUsdInvoiceCreate.invoice?.paymentRequest ?? "",
        "mainnet", // pr.network,
      )

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: data?.lnUsdInvoiceCreate.invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      info = {
        data: data?.lnUsdInvoiceCreate.invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...data?.lnUsdInvoiceCreate.invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors: data?.lnUsdInvoiceCreate?.errors,
        gqlErrors: errors,
      }

      // Paycode
    } else if (pr.type === Invoice.PayCode && pr.username) {
      const lnurl: string = await new Promise((resolve) => {
        resolve(
          bech32.encode(
            "lnurl",
            bech32.toWords(
              Buffer.from(`${pr.posUrl}/.well-known/lnurlp/${pr.username}`, "utf8"),
            ),
            1500,
          ),
        )
      })

      // To make the page render at loading state
      // (otherwise jittery because encode takes ~10ms on slower phones)
      await new Promise((r) => {
        setTimeout(r, 50)
      })

      const webURL = `${pr.posUrl}/${pr.username}`
      const qrCodeURL = webURL.toUpperCase() + "?lightning=" + lnurl.toUpperCase()

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.PayCode,
          input: qrCodeURL,
          uppercase,
          prefix,
        })

      info = {
        data: {
          invoiceType: Invoice.PayCode,
          username: pr.username,
          getFullUriFn,
        },
        applicationErrors: undefined,
        gqlErrors: undefined,
      }
    } else if (pr.type === Invoice.PayCode && !pr.username) {
      // Can't create paycode payment request for a user with no username set so info will be empty
      return createPaymentRequest({
        ...params,
        state: PaymentRequestState.Created,
        info: undefined,
      })
    } else {
      info = undefined
      console.log(JSON.stringify({ pr }, null, 2))
      throw new Error("Unknown Payment Request Type Encountered - Please Report")
    }

    let state: PaymentRequestStateType = PaymentRequestState.Created
    if (!info || info.applicationErrors?.length || info.gqlErrors?.length || !info.data) {
      state = PaymentRequestState.Error
    }

    return createPaymentRequest({ ...params, info, state })
  }

  return { ...params, state, info, generateRequest: generateQuote, setState }
}
