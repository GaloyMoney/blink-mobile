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
import { createInvoiceDetails, CreateInvoiceDetailsParams } from "./invoices"
import { InvoiceType } from "./invoices/index.types"
import {
  ErrorType,
  InvoiceState,
  ReceiveBitcoinState,
  UseReceiveBitcoinParams,
  UseReceiveBitcoinResult,
} from "./use-receive-bitcoin.types"

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
  initialCreateInvoiceDetailsParams,
}: UseReceiveBitcoinParams<WalletCurrency>): UseReceiveBitcoinResult => {
  const [lnNoAmountInvoiceCreate] = useLnNoAmountInvoiceCreateMutation()
  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()
  const [lnInvoiceCreate] = useLnInvoiceCreateMutation()
  const [onChainAddressCurrent] = useOnChainAddressCurrentMutation()
  const lastHash = useLnUpdateHashPaid()
  const [invoiceState, setInvoiceState] = useState<InvoiceState<WalletCurrency>>({
    createInvoiceDetailsParams: initialCreateInvoiceDetailsParams,
    invoiceDetails:
      initialCreateInvoiceDetailsParams &&
      createInvoiceDetails(initialCreateInvoiceDetailsParams),
    state: ReceiveBitcoinState.Idle,
  })

  const { createInvoiceDetailsParams } = invoiceState

  const generateInvoiceWithParams = useCallback(
    async (createInvoiceDetailsParams: CreateInvoiceDetailsParams<WalletCurrency>) => {
      const invoiceDetails = createInvoiceDetails(createInvoiceDetailsParams)
      setInvoiceState({
        invoiceDetails,
        createInvoiceDetailsParams,
        state: ReceiveBitcoinState.LoadingInvoice,
      })

      const { invoice, gqlErrors, applicationErrors } =
        await invoiceDetails.generateInvoice({
          lnInvoiceCreate,
          lnNoAmountInvoiceCreate,
          lnUsdInvoiceCreate,
          onChainAddressCurrent,
        })

      if (gqlErrors.length || applicationErrors.length || !invoice) {
        return setInvoiceState({
          invoiceDetails,
          createInvoiceDetailsParams,
          state: ReceiveBitcoinState.Error,
          error: ErrorType.Generic,
        })
      }

      return setInvoiceState({
        invoiceDetails,
        createInvoiceDetailsParams,
        state: ReceiveBitcoinState.InvoiceCreated,
        invoice,
      })
    },
    [
      setInvoiceState,
      lnInvoiceCreate,
      lnNoAmountInvoiceCreate,
      lnUsdInvoiceCreate,
      onChainAddressCurrent,
    ],
  )

  const setterMethods = useMemo(() => {
    const setCreateInvoiceDetailsParams = (
      params: CreateInvoiceDetailsParams<WalletCurrency>,
    ) => {
      setInvoiceState({
        state: ReceiveBitcoinState.Idle,
        createInvoiceDetailsParams: params,
        invoiceDetails: createInvoiceDetails(params),
      })
    }

    if (!createInvoiceDetailsParams) {
      return {
        setCreateInvoiceDetailsParams,
      } as const
    }

    const createSetterMethod = <
      T extends keyof CreateInvoiceDetailsParams<WalletCurrency>,
    >(
      field: T,
      value: CreateInvoiceDetailsParams<WalletCurrency>[T],
      generateInvoiceAfter = false,
    ) => {
      const newParams: CreateInvoiceDetailsParams<WalletCurrency> = {
        ...createInvoiceDetailsParams,
        [field]: value,
      }
      generateInvoiceAfter
        ? generateInvoiceWithParams(newParams)
        : setCreateInvoiceDetailsParams(newParams)
    }

    return {
      setCreateInvoiceDetailsParams,
      setAmount: (amount: PaymentAmount<WalletCurrency>, generateInvoiceAfter = false) =>
        createSetterMethod("unitOfAccountAmount", amount, generateInvoiceAfter),

      setMemo: (memo: string, generateInvoiceAfter = false) =>
        createSetterMethod("memo", memo, generateInvoiceAfter),

      setReceivingWalletDescriptor: (
        receivingWalletDescriptor: WalletDescriptor<WalletCurrency>,
        generateInvoiceAfter = false,
      ) =>
        createSetterMethod(
          "receivingWalletDescriptor",
          receivingWalletDescriptor,
          generateInvoiceAfter,
        ),

      setInvoiceType: (invoiceType: InvoiceType, generateInvoiceAfter = false) =>
        createSetterMethod("invoiceType", invoiceType, generateInvoiceAfter),

      setConvertPaymentAmount: (
        convertPaymentAmount: ConvertPaymentAmount,
        generateInvoiceAfter = false,
      ) =>
        createSetterMethod(
          "convertPaymentAmount",
          convertPaymentAmount,
          generateInvoiceAfter,
        ),
    } as const
  }, [createInvoiceDetailsParams, generateInvoiceWithParams])

  const generateInvoice =
    createInvoiceDetailsParams &&
    (() => generateInvoiceWithParams(createInvoiceDetailsParams))

  // Check if invoice has been paid
  useEffect(() => {
    const invoiceData = invoiceState.invoice?.invoiceData
    if (
      invoiceData &&
      invoiceData.invoiceType === InvoiceType.Lightning &&
      invoiceState.state === ReceiveBitcoinState.InvoiceCreated &&
      lastHash === invoiceData.paymentHash
    ) {
      setInvoiceState({
        ...invoiceState,
        state: ReceiveBitcoinState.Paid,
      })
    }
  }, [invoiceState, lastHash])

  const checkExpiredAndGetRemainingSeconds =
    invoiceState.state === ReceiveBitcoinState.InvoiceCreated
      ? (currentTime: Date): number | undefined => {
          const expiration = invoiceState.invoice?.expiration
          if (expiration) {
            const secondsRemaining = Math.floor(
              (expiration.getTime() - currentTime.getTime()) / 1000,
            )
            if (secondsRemaining < 0) {
              setInvoiceState({
                ...invoiceState,
                state: ReceiveBitcoinState.Expired,
              })
            }
            return secondsRemaining
          }
          return undefined
        }
      : undefined

  return {
    invoiceState,
    generateInvoice,
    generateInvoiceWithParams,
    checkExpiredAndGetRemainingSeconds,
    ...setterMethods,
  } as const
}
