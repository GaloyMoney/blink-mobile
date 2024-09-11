import * as sdk from "@breeztech/react-native-breez-sdk-liquid"
import { TransactionFragment } from "@app/graphql/generated"

export const formatPaymentsBreezSDK = (
  txid: unknown,
  payments: sdk.Payment[],
  convertedAmount: number,
) => {
  const response: sdk.Payment[] = payments
  const responseTx = response.find((tx) => tx.txId === txid)
  let tx: TransactionFragment = {} as TransactionFragment
  if (responseTx) {
    const amountSat = responseTx.amountSat
    // round up to 2 decimal places
    const moneyAmount = (convertedAmount / 100).toString()
    const transformedData: TransactionFragment = {
      // Map fields from response to fields of TransactionFragment, e.g.,
      id: responseTx.txId || "",
      direction: responseTx.paymentType === "receive" ? "RECEIVE" : "SEND",
      status:
        (responseTx.status === sdk.PaymentState.PENDING ? "PENDING" : "SUCCESS") ||
        "FAILURE",
      memo: responseTx.description,
      settlementAmount: amountSat,
      settlementCurrency: "BTC",
      settlementDisplayAmount: moneyAmount,
      settlementDisplayCurrency: "USD",
      settlementVia: {
        __typename: "SettlementViaLn",
        paymentSecret: responseTx.preimage,
      },
      createdAt: responseTx.timestamp,
      settlementFee: responseTx.feesSat,
      settlementDisplayFee: "BTC",
      settlementPrice: {
        base: amountSat,
        offset: 0,
        currencyUnit: "SAT",
        formattedAmount: "SAT",
        __typename: "PriceOfOneSettlementMinorUnitInDisplayMinorUnit",
      },
      initiationVia: {
        __typename: "InitiationViaLn",
        paymentHash: responseTx.bolt11 || "",
      },
      __typename: "Transaction",
    }
    tx = transformedData
  }
  return tx
}
