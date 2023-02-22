import { gql } from "@apollo/client"
import {
  useLnInvoiceCreateMutation,
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
  useOnChainAddressCurrentMutation,
  WalletCurrency,
} from "@app/graphql/generated"
import { useLnUpdateHashPaid } from "@app/graphql/ln-update-context"
import { PaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ConvertPaymentAmount } from "../send-bitcoin-screen/payment-details"
import {
  createPaymentRequestDetails,
  CreatePaymentRequestDetailsParams,
} from "./payment-requests"
import { PaymentRequest, PaymentRequestType } from "./payment-requests/index.types"
import {
  ErrorType,
  UsePaymentRequestState,
  UsePaymentRequestParams,
  UsePaymentRequestResult,
  PaymentRequestState,
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
    const setCreatePaymentRequestDetailsParams = (
      params: CreatePaymentRequestDetailsParams<WalletCurrency>,
      generatePaymentRequestAfter = false,
    ) => {
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
    >(
      field: T,
      value: CreatePaymentRequestDetailsParams<WalletCurrency>[T],
      generatePaymentRequestAfter = false,
    ) => {
      const newParams: CreatePaymentRequestDetailsParams<WalletCurrency> = {
        ...createPaymentRequestDetailsParams,
        [field]: value,
      }

      setCreatePaymentRequestDetailsParams(newParams, generatePaymentRequestAfter)
    }

    return {
      setCreatePaymentRequestDetailsParams,
      setAmount: (
        amount: PaymentAmount<WalletCurrency>,
        generatePaymentRequestAfter = false,
      ) => createSetterMethod("unitOfAccountAmount", amount, generatePaymentRequestAfter),

      setMemo: (memo: string, generatePaymentRequestAfter = false) =>
        createSetterMethod("memo", memo, generatePaymentRequestAfter),

      setReceivingWalletDescriptor: (
        receivingWalletDescriptor: WalletDescriptor<WalletCurrency>,
        generatePaymentRequestAfter = false,
      ) =>
        createSetterMethod(
          "receivingWalletDescriptor",
          receivingWalletDescriptor,
          generatePaymentRequestAfter,
        ),

      setPaymentRequestType: (
        paymentRequestType: PaymentRequestType,
        generatePaymentRequestAfter = false,
      ) =>
        createSetterMethod(
          "paymentRequestType",
          paymentRequestType,
          generatePaymentRequestAfter,
        ),

      generatePaymentRequest: () =>
        generatePaymentRequestWithParams(createPaymentRequestDetailsParams),

      setConvertPaymentAmount: (
        convertPaymentAmount: ConvertPaymentAmount,
        generatePaymentRequestAfter = false,
      ) =>
        createSetterMethod(
          "convertPaymentAmount",
          convertPaymentAmount,
          generatePaymentRequestAfter,
        ),
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
