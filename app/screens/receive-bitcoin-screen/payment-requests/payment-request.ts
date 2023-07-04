import { decodeInvoiceString, Network as NetworkLibGaloy } from "@galoymoney/client"
import { getPaymentRequestFullUri, TYPE_LIGHTNING_BTC } from "./helpers"
import {
  CreatePaymentRequestParams,
  GeneratedPaymentRequest,
  GeneratedPaymentRequestErrors,
  GeneratePaymentRequestFn,
  GetFullUriFn,
  LightningPaymentRequestData,
  OnChainPaymentRequestData,
  PaymentRequest,
  PaymentRequestAmountData,
  SetAmount,
  SetConvertMoneyAmount,
  SetMemo,
  SetPaymentRequestData,
  SetReceivingWalletDescriptor,
  SetState,
} from "./index.types"

import { WalletCurrency } from "@app/graphql/generated"

export const createPaymentRequest = <T extends WalletCurrency>(
  params: CreatePaymentRequestParams<T> & {
    generatedRequest?: GeneratedPaymentRequest
    generatedErrors?: GeneratedPaymentRequestErrors
  },
): PaymentRequest<T> => {
  const {
    state,
    unitOfAccountAmount,
    paymentRequestData,
    convertMoneyAmount,
    receivingWalletDescriptor,
    network,
  } = params

  let paymentRequestAmountData: PaymentRequestAmountData<T> = {}
  if (unitOfAccountAmount) {
    const settlementAmount = convertMoneyAmount(
      unitOfAccountAmount,
      receivingWalletDescriptor.currency,
    )
    paymentRequestAmountData = {
      unitOfAccountAmount,
      settlementAmount,
    }
  }

  const permissions = {
    canSetReceivingWalletDescriptor: false,
    canSetMemo: false,
    canSetAmount: false,
  }

  switch (paymentRequestData.paymentRequestType) {
    case PaymentRequest.Lightning:
      permissions.canSetReceivingWalletDescriptor = true
    case PaymentRequest.OnChain:
      permissions.canSetMemo = true
      permissions.canSetAmount = true
  }

  const setState: SetState<T> = (state) => createPaymentRequest({ ...params, state })

  const setPaymentRequestData: SetPaymentRequestData<T> = (paymentRequestData) =>
    createPaymentRequest({ ...params, paymentRequestData })

  const setConvertMoneyAmount: SetConvertMoneyAmount<T> = (convertMoneyAmount) =>
    createPaymentRequest({ ...params, convertMoneyAmount })

  let setReceivingWalletDescriptor: SetReceivingWalletDescriptor<T> | undefined
  if (permissions.canSetReceivingWalletDescriptor)
    setReceivingWalletDescriptor = (receivingWalletDescriptor) =>
      createPaymentRequest({ ...params, receivingWalletDescriptor })

  let setMemo: SetMemo<T> | undefined
  if (
    permissions.canSetMemo &&
    paymentRequestData.paymentRequestType !== PaymentRequest.PayCode // for ts
  )
    setMemo = (memo) =>
      createPaymentRequest({
        ...params,
        paymentRequestData: { ...paymentRequestData, memo },
      })

  let setAmount: SetAmount<T> | undefined
  if (permissions.canSetAmount)
    setAmount = (unitOfAccountAmount) =>
      createPaymentRequest({ ...params, unitOfAccountAmount })

  let generate: GeneratePaymentRequestFn<T>

  if (paymentRequestData.paymentRequestType === PaymentRequest.OnChain) {
    generate = async ({ onChainAddressCurrent }) => {
      const { data, errors } = await onChainAddressCurrent({
        variables: {
          input: {
            walletId: receivingWalletDescriptor.id,
          },
        },
      })

      const address = data?.onChainAddressCurrent.address
      const applicationErrors = data?.onChainAddressCurrent?.errors

      const generatedPaymentRequestData: OnChainPaymentRequestData | undefined = address
        ? {
            address,
            memo: paymentRequestData.memo,
            amount: paymentRequestData.amount,
            paymentRequestType: PaymentRequest.OnChain,
          }
        : undefined

      const getFullUri: GetFullUriFn = ({ uppercase, prefix }) =>
        getPaymentRequestFullUri({
          input: generatedPaymentRequestData?.address ?? "",
          amount: paymentRequestData.amount?.amount,
          memo: paymentRequestData.memo,
          uppercase,
          prefix,
        })
      const paymentRequestDisplay = getFullUri({})

      const generatedRequest: GeneratedPaymentRequest = {
        paymentRequestData: generatedPaymentRequestData,
        getFullUri,
        paymentRequestDisplay,
      }

      const generatedErrors: GeneratedPaymentRequestErrors = {
        gqlErrors: errors,
        applicationErrors,
      }

      return createPaymentRequest({ ...params, generatedRequest, generatedErrors })
    }
  } else if (paymentRequestData.paymentRequestType === PaymentRequest.Lightning) {
    // Has amount
    generate = async ({
      lnInvoiceCreate,
      lnUsdInvoiceCreate,
      lnNoAmountInvoiceCreate,
    }) => {
      if (paymentRequestAmountData.settlementAmount?.amount) {
        const lnAmountInput = {
          variables: {
            input: {
              amount: paymentRequestAmountData.settlementAmount?.amount,
              walletId: receivingWalletDescriptor.id,
              memo: paymentRequestData.memo,
            },
          },
        }

        let generatedPaymentRequestData: LightningPaymentRequestData | undefined
        let generatedErrors: GeneratedPaymentRequestErrors

        if (receivingWalletDescriptor.currency === WalletCurrency.Btc) {
          const { data, errors } = await lnInvoiceCreate(lnAmountInput)
          const applicationErrors = data?.lnInvoiceCreate?.errors

          generatedPaymentRequestData = data?.lnInvoiceCreate.invoice
            ? {
                paymentRequestType: PaymentRequest.Lightning,
                memo: paymentRequestData.memo,
                ...data?.lnInvoiceCreate.invoice,
              }
            : undefined

          generatedErrors = {
            gqlErrors: errors,
            applicationErrors,
          }
        } else {
          const { data, errors } = await lnUsdInvoiceCreate(lnAmountInput)
          const applicationErrors = data?.lnUsdInvoiceCreate?.errors

          generatedPaymentRequestData = data?.lnUsdInvoiceCreate.invoice
            ? {
                paymentRequestType: PaymentRequest.Lightning,
                memo: paymentRequestData.memo,
                ...data?.lnUsdInvoiceCreate.invoice,
              }
            : undefined

          generatedErrors = {
            gqlErrors: errors,
            applicationErrors,
          }
        }

        const dateString = decodeInvoiceString(
          generatedPaymentRequestData?.paymentRequest ?? "",
          network as NetworkLibGaloy,
        ).timeExpireDateString
        const expiration = dateString ? new Date(dateString) : undefined

        const getFullUri: GetFullUriFn = ({ uppercase, prefix }) =>
          getPaymentRequestFullUri({
            input: generatedPaymentRequestData?.paymentRequest ?? "",
            uppercase,
            prefix,
            type: TYPE_LIGHTNING_BTC,
          })
        const paymentRequestDisplay = getFullUri({})

        const generatedRequest: GeneratedPaymentRequest = {
          expiration,
          paymentRequestData: generatedPaymentRequestData,
          getFullUri,
          paymentRequestDisplay,
        }
        return createPaymentRequest({ ...params, generatedRequest, generatedErrors })
      } else {
        // No Amount Invoice
        const { data, errors } = await lnNoAmountInvoiceCreate({
          variables: {
            input: {
              walletId: receivingWalletDescriptor.id,
              memo: paymentRequestData.memo,
            },
          },
        })

        const applicationErrors = data?.lnNoAmountInvoiceCreate?.errors
        const generatedPaymentRequestData: LightningPaymentRequestData | undefined = data
          ?.lnNoAmountInvoiceCreate.invoice
          ? {
              paymentRequestType: PaymentRequest.Lightning,
              memo: paymentRequestData.memo,
              ...data?.lnNoAmountInvoiceCreate.invoice,
            }
          : undefined

        const dateString = decodeInvoiceString(
          generatedPaymentRequestData?.paymentRequest ?? "",
          network as NetworkLibGaloy,
        ).timeExpireDateString
        const expiration = dateString ? new Date(dateString) : undefined

        const getFullUri: GetFullUriFn = ({ uppercase, prefix }) =>
          getPaymentRequestFullUri({
            input: generatedPaymentRequestData?.paymentRequest ?? "",
            uppercase,
            prefix,
            type: TYPE_LIGHTNING_BTC,
          })
        const paymentRequestDisplay = getFullUri({})

        const generatedRequest: GeneratedPaymentRequest = {
          expiration,
          paymentRequestData: generatedPaymentRequestData,
          getFullUri,
          paymentRequestDisplay,
        }

        const generatedErrors: GeneratedPaymentRequestErrors = {
          gqlErrors: errors,
          applicationErrors,
        }

        return createPaymentRequest({ ...params, generatedRequest, generatedErrors })
      }
    }
  } else {
    generate = async () => createPaymentRequest({ ...params })
  }

  return {
    ...permissions,
    ...paymentRequestAmountData,
    state,
    paymentRequestData,
    receivingWalletDescriptor,
    unitOfAccountAmount,
    setState,
    setReceivingWalletDescriptor,
    setPaymentRequestData,
    setConvertMoneyAmount,
    generate,
    convertMoneyAmount,
  }
}
