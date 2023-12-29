import * as sdk from "@breeztech/react-native-breez-sdk"
import { TransactionFragment } from "@app/graphql/generated"

export const formatPaymentsBreezSDK = (
  txid: unknown,
  payments: sdk.Payment[],
  btcInDisplayRate: number,
) => {
  const rate = btcInDisplayRate / 100000000
  const response: sdk.Payment[] = payments
  const responseTx = response.find((tx) => tx.id === txid)
  let tx: TransactionFragment | undefined
  if (responseTx) {
    const amountSat = responseTx.amountMsat / 1000
    // round up to 2 decimal places
    const moneyAmount = (Math.ceil(amountSat * rate * 100) / 100).toString()
    const transformedData: TransactionFragment = {
      // Map fields from response to fields of TransactionFragment, e.g.,
      id: responseTx.id,
      direction: responseTx.paymentType === "received" ? "RECEIVE" : "SEND",
      status: (responseTx.pending ? "PENDING" : "SUCCESS") || "FAILURE",
      memo: responseTx.description,
      settlementAmount: amountSat,
      settlementCurrency: "BTC",
      settlementDisplayAmount: moneyAmount,
      settlementDisplayCurrency: "USD",
      settlementVia: {
        __typename: "SettlementViaLn",
        paymentSecret:
          "details" in responseTx && "paymentPreimage" in responseTx.details
            ? responseTx.details.paymentPreimage
            : undefined,
      },
      createdAt: responseTx.paymentTime,
      settlementFee: responseTx.feeMsat / 1000,
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
        paymentHash:
          "details" in responseTx && "paymentHash" in responseTx.details
            ? responseTx.details.paymentHash
            : "",
      },
      __typename: "Transaction",
    }
    tx = transformedData
  }

  return tx
}
