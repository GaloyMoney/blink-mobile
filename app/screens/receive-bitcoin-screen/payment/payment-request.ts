import { WalletCurrency } from "@app/graphql/generated"
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
} from "@app/utils/breez-sdk-liquid"

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

  // Breez SDK OnChain
  const fetchBreezOnchain = async (amount?: number) => {
    try {
      const fetchedBreezOnChain = await receiveOnchainBreezSDK(amount)
      return fetchedBreezOnChain.destination
    } catch (error) {
      console.error("Error fetching breezOnChain:", error)
    }
  }

  // Breez SDK Lightning
  const fetchBreezInvoice = async (amount?: number, memo?: string) => {
    try {
      const fetchedBreezInvoice = await receivePaymentBreezSDK(amount, memo)
      const formattedBreezInvoice = {
        lnInvoiceCreate: {
          errors: [],
          invoice: {
            paymentHash: fetchedBreezInvoice.paymentHash,
            paymentRequest: fetchedBreezInvoice.bolt11,
            paymentSecret: fetchedBreezInvoice.paymentSecret
              ? Array.from(fetchedBreezInvoice.paymentSecret)
                  .map((byte) => byte.toString(16))
                  .join("")
              : "",
          },
        },
      }
      return formattedBreezInvoice
    } catch (error) {
      console.error("Error fetching breezInvoice:", error)
    }
  }

  const generateQuote: () => Promise<PaymentRequest> = async () => {
    const { creationData, mutations } = params
    const pr = { ...creationData } // clone creation data object
    let info: PaymentRequestInformation | undefined

    const generateLightningInfo = (
      invoice: any,
      applicationErrors: any,
      gqlErrors: any,
    ) => {
      const dateString = prToDateString(
        invoice.paymentRequest ?? "",
        "mainnet", // pr.network ,
      )

      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.Lightning,
          input: invoice?.paymentRequest || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      return {
        data: invoice
          ? {
              invoiceType: Invoice.Lightning,
              ...invoice,
              expiresAt: dateString ? new Date(dateString) : undefined,
              getFullUriFn,
            }
          : undefined,
        applicationErrors,
        gqlErrors,
      }
    }

    const generateOnChainInfo = (
      address: string,
      applicationErrors: any,
      gqlErrors: any,
    ) => {
      const getFullUriFn: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          type: Invoice.OnChain,
          input: address || "",
          amount: pr.settlementAmount?.amount,
          memo: pr.memo,
          uppercase,
          prefix,
        })

      return {
        data: address
          ? {
              invoiceType: Invoice.OnChain,
              getFullUriFn,
              address,
              amount: pr.settlementAmount as BtcMoneyAmount,
              memo: pr.memo,
            }
          : undefined,
        applicationErrors,
        gqlErrors,
      }
    }

    // Default memo
    if (!pr.memo) {
      pr.memo = `Pay to Flash Wallet User${pr.username ? ": " + pr.username : ""}`
    }

    if (creationData.receivingWalletDescriptor.currency === WalletCurrency.Btc) {
      // Handle BTC payment requests
      if (pr.type === Invoice.Lightning) {
        const fetchedBreezInvoice: any = await fetchBreezInvoice(
          pr.settlementAmount?.amount,
          pr.memo,
        )
        info = generateLightningInfo(fetchedBreezInvoice.lnInvoiceCreate.invoice, [], [])
      } else if (pr.type === Invoice.OnChain) {
        const fetchedBreezOnchain = await fetchBreezOnchain(pr.settlementAmount?.amount)
        info = generateOnChainInfo(fetchedBreezOnchain || "", [], [])
      }
    } else {
      // Handle USD payment requests
      if (pr.type === Invoice.Lightning) {
        if (pr.settlementAmount && pr.settlementAmount?.currency === WalletCurrency.Usd) {
          console.log("Invoice create amount: ", pr.settlementAmount.amount)
          const { data, errors } = await mutations.lnUsdInvoiceCreate({
            variables: {
              input: {
                walletId: pr.receivingWalletDescriptor.id,
                amount: pr.settlementAmount.amount,
                memo: pr.memo,
              },
            },
          })
          info = generateLightningInfo(
            data?.lnUsdInvoiceCreate.invoice,
            data?.lnUsdInvoiceCreate?.errors,
            errors,
          )
        } else if (
          pr.settlementAmount === undefined ||
          pr.settlementAmount.amount === 0
        ) {
          const { data, errors } = await mutations.lnUsdInvoiceCreate({
            variables: {
              input: {
                walletId: pr.receivingWalletDescriptor.id,
                amount: 0,
                memo: pr.memo,
              },
            },
          })

          info = generateLightningInfo(
            data?.lnUsdInvoiceCreate.invoice,
            data?.lnUsdInvoiceCreate?.errors,
            errors,
          )
        }
      } else if (pr.type === Invoice.OnChain) {
        const result = await mutations.onChainAddressCurrent({
          variables: { input: { walletId: pr.receivingWalletDescriptor.id } },
        })

        info = generateOnChainInfo(
          result.data?.onChainAddressCurrent.address || "",
          result.data?.onChainAddressCurrent.errors,
          result.errors,
        )
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
    }

    let state: PaymentRequestStateType = PaymentRequestState.Created
    if (!info || info.applicationErrors?.length || info.gqlErrors?.length || !info.data) {
      state = PaymentRequestState.Error
    }

    return createPaymentRequest({ ...params, info, state })
  }

  return { ...params, state, info, generateRequest: generateQuote, setState }
}
