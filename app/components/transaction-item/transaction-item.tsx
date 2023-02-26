// eslint-disable-next-line camelcase
import { useFragment_experimental } from "@apollo/client"
import {
  Transaction,
  TransactionFragmentDoc,
  useHideBalanceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { satAmountDisplay } from "@app/utils/currencyConversion"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "@rneui/base"
import * as React from "react"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { prefCurrencyVar as primaryCurrencyVar } from "../../graphql/client-only-query"
import { palette } from "../../theme/palette"
import { IconTransaction } from "../icon-transactions"
import { TransactionDate } from "../transaction-date"

const styles = EStyleSheet.create({
  container: {
    paddingVertical: 9,
    borderColor: palette.lighterGrey,
    borderBottomWidth: "2rem",
    overflow: "hidden",
  },
  containerFirst: {
    overflow: "hidden",
    borderTopLeftRadius: "12rem",
    borderTopRightRadius: "12rem",
  },
  containerLast: {
    overflow: "hidden",
    borderBottomLeftRadius: "12rem",
    borderBottomRightRadius: "12rem",
  },
  lastListItemContainer: {
    borderBottomWidth: 0,
  },
  hiddenBalanceContainer: {
    fontSize: "16rem",
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

const computeUsdAmount = (tx: Transaction) => {
  const { settlementAmount, settlementPrice } = tx
  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100
  return settlementAmount * usdPerSat
}

const descriptionDisplay = (tx: Transaction) => {
  const { memo, direction, settlementVia } = tx
  if (memo) {
    return memo
  }

  const isReceive = direction === "RECEIVE"

  switch (settlementVia.__typename) {
    case "SettlementViaOnChain":
      return "OnChain Payment"
    case "SettlementViaLn":
      return "Invoice"
    case "SettlementViaIntraLedger":
      return isReceive
        ? `From ${settlementVia.counterPartyUsername || "BitcoinBeach Wallet"}`
        : `To ${settlementVia.counterPartyUsername || "BitcoinBeach Wallet"}`
  }
}

const amountDisplayStyle = ({
  isReceive,
  isPending,
}: {
  isReceive: boolean
  isPending: boolean
}) => {
  if (isPending) {
    return styles.pending
  }

  return isReceive ? styles.receive : styles.send
}

type Props = {
  isFirst?: boolean
  isLast?: boolean
  txid: string
  subtitle?: boolean
}

export const TransactionItem: React.FC<Props> = ({
  txid,
  subtitle = false,
  isFirst = false,
  isLast = false,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data: tx } = useFragment_experimental<Transaction>({
    fragment: TransactionFragmentDoc,
    fragmentName: "Transaction",
    from: {
      __typename: "Transaction",
      id: txid,
    },
  })

  const primaryCurrency = primaryCurrencyVar()
  const { data: { hideBalance } = {} } = useHideBalanceQuery()

  const [txHideBalance, setTxHideBalance] = useState(hideBalance)
  const { formatToDisplayCurrency } = useDisplayCurrency()
  useEffect(() => {
    setTxHideBalance(hideBalance)
  }, [hideBalance])

  console.log("tx", tx, txid)

  if (!tx || Object.keys(tx).length === 0) {
    return null
  }

  const isReceive = tx.direction === "RECEIVE"
  const isPending = tx.status === "PENDING"
  const description = descriptionDisplay(tx)
  const usdAmount = computeUsdAmount(tx)
  const walletCurrency = tx.settlementCurrency as WalletCurrency
  const pressTxAmount = () => setTxHideBalance((prev) => !prev)

  return (
    <View
      style={[isLast ? styles.containerLast : {}, isFirst ? styles.containerFirst : {}]}
    >
      <ListItem
        containerStyle={[styles.container, isLast ? styles.lastListItemContainer : {}]}
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
        <IconTransaction
          onChain={tx.settlementVia.__typename === "SettlementViaOnChain"}
          isReceive={isReceive}
          pending={isPending}
          walletCurrency={walletCurrency}
        />
        <ListItem.Content>
          <ListItem.Title>{description}</ListItem.Title>
          <ListItem.Subtitle>
            {subtitle ? (
              <TransactionDate tx={tx} diffDate={true} friendly={true} />
            ) : undefined}
          </ListItem.Subtitle>
        </ListItem.Content>
        {txHideBalance ? (
          <Icon
            style={styles.hiddenBalanceContainer}
            name="eye"
            onPress={pressTxAmount}
          />
        ) : (
          <Text
            style={amountDisplayStyle({ isReceive, isPending })}
            onPress={hideBalance ? pressTxAmount : undefined}
          >
            {primaryCurrency === "BTC" && tx.settlementCurrency === WalletCurrency.Btc
              ? satAmountDisplay(tx.settlementAmount)
              : formatToDisplayCurrency(usdAmount)}
          </Text>
        )}
      </ListItem>
    </View>
  )
}
