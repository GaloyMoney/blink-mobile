import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "react-native-elements"
import * as React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { IconTransaction } from "../icon-transactions"
import { palette } from "../../theme/palette"
import { ParamListBase } from "@react-navigation/native"
import { prefCurrencyVar as primaryCurrencyVar } from "../../graphql/client-only-query"

import * as currency_fmt from "currency.js"
import i18n from "i18n-js"
import moment from "moment"

const styles = EStyleSheet.create({
  container: {
    paddingVertical: 9,
  },

  pending: {
    color: palette.midGrey,
  },

  receive: {
    color: palette.green,
  },

  send: {
    color: palette.darkGrey,
  },
})

export interface TransactionItemProps {
  navigation: StackNavigationProp<ParamListBase>
  tx: WalletTransaction
  subtitle?: boolean
}

moment.locale(i18n.locale)

const dateDisplay = ({ createdAt }) =>
  moment.duration(Math.min(0, moment.unix(createdAt).diff(moment()))).humanize(true)

const computeUsdAmount = (tx: WalletTransaction) => {
  const { settlementAmount, settlementPrice } = tx
  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100
  return settlementAmount * usdPerSat
}

const amountDisplay = ({ primaryCurrency, settlementAmount, usdAmount }) => {
  const symbol = primaryCurrency === "BTC" ? "" : "$"
  const precision = primaryCurrency === "BTC" ? 0 : Math.abs(usdAmount) < 0.01 ? 4 : 2

  return currency_fmt
    .default(primaryCurrency === "BTC" ? settlementAmount : usdAmount, {
      separator: ",",
      symbol,
      precision,
    })
    .format()
}

const descriptionDisplay = (tx: WalletTransaction) => {
  const { memo, direction, settlementVia } = tx
  if (memo) {
    return memo
  }

  const isReceive = direction === "RECEIVE"

  switch (settlementVia.__typename) {
    case "SettlementViaOnChain":
      return "OnChain Receipt"
    case "SettlementViaLn":
      return "Invoice"
    case "SettlementViaIntraLedger":
      return isReceive
        ? `From ${settlementVia.counterPartyUsername || "BitcoinBeach Wallet"}`
        : `To ${settlementVia.counterPartyUsername || "BitcointBeach Wallet"}`
  }
}

const amountDisplayStyle = ({ isReceive, isPending }) => {
  if (isPending) {
    return styles.pending
  }

  return isReceive ? styles.receive : styles.send
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  navigation,
  subtitle = false,
}: TransactionItemProps) => {
  const primaryCurrency = primaryCurrencyVar()

  const isReceive = tx.direction === "RECEIVE"
  const isPending = tx.status === "PENDING"
  const description = descriptionDisplay(tx)
  const usdAmount = computeUsdAmount(tx)

  return (
    <ListItem
      containerStyle={styles.container}
      onPress={() =>
        navigation.navigate("transactionDetail", {
          ...tx,
          isReceive,
          isPending,
          description,
          usdAmount,
        })
      }
    >
      <IconTransaction isReceive={isReceive} size={24} pending={isPending} />
      <ListItem.Content>
        <ListItem.Title>{description}</ListItem.Title>
        <ListItem.Subtitle>{subtitle ? dateDisplay(tx) : undefined}</ListItem.Subtitle>
      </ListItem.Content>
      <Text style={amountDisplayStyle({ isReceive, isPending })}>
        {amountDisplay({ ...tx, usdAmount, primaryCurrency })}
      </Text>
    </ListItem>
  )
}
