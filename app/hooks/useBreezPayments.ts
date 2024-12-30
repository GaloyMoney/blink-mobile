import * as sdk from "@breeztech/react-native-breez-sdk-liquid"

export const formatPaymentsBreezSDK = (
  txid: unknown,
  payments: sdk.Payment[],
  convertedAmount: number,
) => {
  const response: sdk.Payment[] = payments
  const responseTx = response.find((tx) => tx.txId === txid)
  let tx: any = {}
  if (responseTx) {
    const amountSat = responseTx.amountSat
    // round up to 2 decimal places
    const moneyAmount = (convertedAmount / 100).toString()
    const transformedData = {
      id: responseTx.txId || "",
      direction: responseTx.paymentType === "receive" ? "RECEIVE" : "SEND",
      status: responseTx.status.toUpperCase(),
      memo: responseTx.details.description,
      settlementAmount: amountSat,
      settlementCurrency: "BTC",
      settlementDisplayAmount: moneyAmount,
      settlementDisplayCurrency: "USD",
      settlementVia: {
        __typename: "SettlementViaLn",
        paymentSecret:
          responseTx.details.type === sdk.PaymentDetailsVariant.LIGHTNING
            ? responseTx.details.preimage
            : "",
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
        paymentHash:
          responseTx.details.type === sdk.PaymentDetailsVariant.LIGHTNING
            ? responseTx.details.paymentHash || ""
            : "",
      },
      __typename: "Transaction",
    }
    tx = transformedData
  }
  return tx
}
