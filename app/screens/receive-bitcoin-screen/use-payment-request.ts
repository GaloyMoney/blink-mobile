import { gql } from "@apollo/client"
import {
  useLnInvoiceCreateMutation,
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
  useOnChainAddressCurrentMutation,
  WalletCurrency,
} from "@app/graphql/generated"
import { useLnUpdateHashPaid } from "@app/graphql/ln-update-context"
import { logGeneratePaymentRequest } from "@app/utils/analytics"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  createPaymentRequestDetails,
  CreatePaymentRequestDetailsParams,
} from "./payment-requests"
import { PaymentRequest } from "./payment-requests/index.types"
import {
  ErrorType,
  UsePaymentRequestState,
  UsePaymentRequestParams,
  UsePaymentRequestResult,
  PaymentRequestState,
  SetCreatePaymentRequestDetailsParamsParams,
  SetAmountParams,
  SetMemoParams,
  SetReceivingWalletDescriptorParams,
  SetPaymentRequestTypeParams,
  SetConvertMoneyAmountParams,
} from "./use-payment-request.types"

gql`
  mutation lnNoAmountInvoiceCreate($input: LnNoAmountInvoiceCreateInput!) {
    lnNoAmountInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentHash
        paymentRequest
        paymentSecret
      }
    }
  }

  mutation lnInvoiceCreate($input: LnInvoiceCreateInput!) {
    lnInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentHash
        paymentRequest
        paymentSecret
        satoshis
      }
    }
  }

  mutation onChainAddressCurrent($input: OnChainAddressCurrentInput!) {
    onChainAddressCurrent(input: $input) {
      errors {
        message
      }
      address
    }
  }

  mutation lnUsdInvoiceCreate($input: LnUsdInvoiceCreateInput!) {
    lnUsdInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentHash
        paymentRequest
        paymentSecret
        satoshis
      }
    }
  }
`

export const useReceiveBitcoin = ({
  initialCreatePaymentRequestDetailsParams,
}: UsePaymentRequestParams<WalletCurrency>): UsePaymentRequestResult => {
  const [lnNoAmountInvoiceCreate] = useLnNoAmountInvoiceCreateMutation()
  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()
  const [lnInvoiceCreate] = useLnInvoiceCreateMutation()
  const [onChainAddressCurrent] = useOnChainAddressCurrentMutation()
  const lastHash = useLnUpdateHashPaid()
  const [state, setState] = useState<UsePaymentRequestState<WalletCurrency>>({
    createPaymentRequestDetailsParams: initialCreatePaymentRequestDetailsParams,
    paymentRequestDetails:
      initialCreatePaymentRequestDetailsParams &&
      createPaymentRequestDetails(initialCreatePaymentRequestDetailsParams),
    state: PaymentRequestState.Idle,
  })

  const generatePaymentRequestWithParams = useCallback(
    async (
      createPaymentRequestDetailsParams: CreatePaymentRequestDetailsParams<WalletCurrency>,
    ) => {
      const paymentRequestDetails = createPaymentRequestDetails(
        createPaymentRequestDetailsParams,
      )
      setState({
        paymentRequestDetails,
        createPaymentRequestDetailsParams,
        state: PaymentRequestState.Loading,
      })

      const { paymentRequest, gqlErrors, applicationErrors } =
        await paymentRequestDetails.generatePaymentRequest({
          lnInvoiceCreate,
          lnNoAmountInvoiceCreate,
          lnUsdInvoiceCreate,
          onChainAddressCurrent,
        })
      logGeneratePaymentRequest({
        paymentType: createPaymentRequestDetailsParams.paymentRequestType,
        hasAmount: Boolean(paymentRequestDetails.unitOfAccountAmount?.amount),
        receivingWallet: paymentRequestDetails.receivingWalletDescriptor.currency,
      })
      if (gqlErrors.length || applicationErrors.length || !paymentRequest) {
        return setState({
          paymentRequestDetails,
          createPaymentRequestDetailsParams,
          state: PaymentRequestState.Error,
          error: ErrorType.Generic,
        })
      }

      return setState({
        paymentRequestDetails,
        createPaymentRequestDetailsParams,
        state: PaymentRequestState.Created,
        paymentRequest,
      })
    },
    [
      setState,
      lnInvoiceCreate,
      lnNoAmountInvoiceCreate,
      lnUsdInvoiceCreate,
      onChainAddressCurrent,
    ],
  )

  const { createPaymentRequestDetailsParams, state: paymentRequestState } = state

  const setterMethods = useMemo(() => {
    const setCreatePaymentRequestDetailsParams = ({
      params,
      generatePaymentRequestAfter = false,
    }: SetCreatePaymentRequestDetailsParamsParams) => {
      if (generatePaymentRequestAfter) {
        return generatePaymentRequestWithParams(params)
      }
      return setState({
        state: PaymentRequestState.Idle,
        createPaymentRequestDetailsParams: params,
        paymentRequestDetails: createPaymentRequestDetails(params),
      })
    }

    if (!createPaymentRequestDetailsParams) {
      return {
        setCreatePaymentRequestDetailsParams,
      } as const
    }

    const createSetterMethod = <
      T extends keyof CreatePaymentRequestDetailsParams<WalletCurrency>,
    >({
      field,
      value,
      generatePaymentRequestAfter = false,
    }: {
      field: T
      value: CreatePaymentRequestDetailsParams<WalletCurrency>[T]
      generatePaymentRequestAfter: boolean
    }) => {
      const newParams: CreatePaymentRequestDetailsParams<WalletCurrency> = {
        ...createPaymentRequestDetailsParams,
        [field]: value,
      }

      setCreatePaymentRequestDetailsParams({
        params: newParams,
        generatePaymentRequestAfter,
      })
    }

    return {
      setCreatePaymentRequestDetailsParams,
      setAmount: ({ amount, generatePaymentRequestAfter = false }: SetAmountParams) =>
        createSetterMethod({
          field: "unitOfAccountAmount",
          value: amount,
          generatePaymentRequestAfter,
        }),

      setMemo: ({ memo, generatePaymentRequestAfter = false }: SetMemoParams) =>
        createSetterMethod({
          field: "memo",
          value: memo,
          generatePaymentRequestAfter,
        }),

      setReceivingWalletDescriptor: ({
        receivingWalletDescriptor,
        generatePaymentRequestAfter = false,
      }: SetReceivingWalletDescriptorParams) =>
        createSetterMethod({
          field: "receivingWalletDescriptor",
          value: receivingWalletDescriptor,
          generatePaymentRequestAfter,
        }),

      setPaymentRequestType: ({
        paymentRequestType,
        generatePaymentRequestAfter = false,
      }: SetPaymentRequestTypeParams) =>
        createSetterMethod({
          field: "paymentRequestType",
          value: paymentRequestType,
          generatePaymentRequestAfter,
        }),

      generatePaymentRequest: () =>
        generatePaymentRequestWithParams(createPaymentRequestDetailsParams),

      setConvertMoneyAmount: ({
        convertMoneyAmount,
        generatePaymentRequestAfter = false,
      }: SetConvertMoneyAmountParams) =>
        createSetterMethod({
          field: "convertMoneyAmount",
          value: convertMoneyAmount,
          generatePaymentRequestAfter,
        }),
    } as const
  }, [createPaymentRequestDetailsParams, generatePaymentRequestWithParams])

  const checkExpiredAndGetRemainingSeconds =
    paymentRequestState === PaymentRequestState.Created
      ? (currentTime: Date): number | undefined => {
          const expiration = state.paymentRequest?.expiration
          if (expiration) {
            const secondsRemaining = Math.floor(
              (expiration.getTime() - currentTime.getTime()) / 1000,
            )
            if (secondsRemaining < 0) {
              setState({
                ...state,
                state: PaymentRequestState.Expired,
              })
            }
            return secondsRemaining
          }
          return undefined
        }
      : undefined

  // Check if paymentRequest has been paid
  useEffect(() => {
    const paymentRequestData = state.paymentRequest?.paymentRequestData
    if (
      paymentRequestData &&
      paymentRequestData.paymentRequestType === PaymentRequest.Lightning &&
      state.state === PaymentRequestState.Created &&
      lastHash === paymentRequestData.paymentHash
    ) {
      setState({
        ...state,
        state: PaymentRequestState.Paid,
      })
    }
  }, [state, lastHash])

  return {
    ...state,
    checkExpiredAndGetRemainingSeconds,
    ...setterMethods,
  }
}
