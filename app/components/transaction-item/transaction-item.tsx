import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "react-native-elements"
import * as React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { IconTransaction } from "../icon-transactions"
import { palette } from "../../theme/palette"
import { query_transactions_wallet_transactions } from "../../graphql/__generated__/query_transactions"
import { ParamListBase } from "@react-navigation/native"
import { prefCurrencyVar as primaryCurrencyVar } from "../../graphql/client-only-query"

import * as currency_fmt from "currency.js"
import i18n from "i18n-js"
import moment, { Moment } from "moment"

const MEMO_SHARING_SATS_THRESHOLD = 1000

const styles = EStyleSheet.create({
  container: {
    paddingVertical: 9,
  },

  pending: {
    color: palette.midGrey,
  },

  send: {
    color: palette.darkGrey,
  },

  receive: {
    color: palette.green,
  },
})

export interface TransactionItemProps {
  navigation: StackNavigationProp<ParamListBase>
  tx: query_transactions_wallet_transactions
  subtitle?: boolean
}

moment.locale(i18n.locale)

const dateDisplay = ({ createdAt }) =>
  moment.duration(Math.min(0, moment.unix(createdAt).diff(moment()))).humanize(true)

const amountDisplay = ({ primaryCurrency, settlementAmount, settlementPrice }) => {
  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100
  const usdAmount = settlementAmount * usdPerSat

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

const descriptionDisplay = ({
  settlementAmount,
  memo,
  direction,
  recipientUsername,
  __typename,
}) => {
  const shouldDisplayMemo =
    settlementAmount === 0 || settlementAmount >= MEMO_SHARING_SATS_THRESHOLD

  if (shouldDisplayMemo) {
    if (memo) {
      return memo
    }
  }

  const isReceive = direction === "RECEIVE"

  if (recipientUsername) {
    return isReceive ? `From ${recipientUsername}` : `To ${recipientUsername}`
  }

  switch (__typename) {
    case "OnChainTransaction":
      return "OnChain Receipt"
    case "LnTransaction":
      return "Invoice"
    case "IntraLedgerTransaction":
      return isReceive ? "From BitcoinBeach Wallet" : "To BitcointBeach Wallet"
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

  return (
    <ListItem
      containerStyle={styles.container}
      onPress={() => navigation.navigate("transactionDetail", { tx })}
    >
      <IconTransaction isReceive={isReceive} size={24} pending={isPending} />
      <ListItem.Content>
        <ListItem.Title>{descriptionDisplay(tx)}</ListItem.Title>
        <ListItem.Subtitle>{subtitle ? dateDisplay(tx) : undefined}</ListItem.Subtitle>
      </ListItem.Content>
      <Text style={amountDisplayStyle({ isReceive, isPending })}>
        {amountDisplay({ ...tx, primaryCurrency })}
      </Text>
    </ListItem>
  )
}
