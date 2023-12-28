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

  // The hook should setState(Loading) before calling this
  const generateQuote: () => Promise<PaymentRequest> = async () => {
    const { creationData, mutations } = params
    const pr = { ...creationData } // clone creation data object

    let info: PaymentRequestInformation | undefined

    // Default memo
    if (!pr.memo) pr.memo = "Flash Cash"

    // On Chain BTC
    if (pr.type === Invoice.OnChain) {
      const { data, errors } = await mutations.onChainAddressCurrent({
        variables: { input: { walletId: pr.receivingWalletDescriptor.id } },
      })

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
        pr.network,
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
