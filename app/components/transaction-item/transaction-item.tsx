import React from "react"
import { Text, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

// eslint-disable-next-line camelcase
import { useFragment_experimental } from "@apollo/client"
import {
  TransactionFragment,
  TransactionFragmentDoc,
  WalletCurrency,
  useHideBalanceQuery,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { testProps } from "@app/utils/testProps"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "@rneui/base"

import { useAppConfig } from "@app/hooks"
import { makeStyles } from "@rneui/themed"
import { palette } from "../../theme/palette"
import { IconTransaction } from "../icon-transactions"
import { TransactionDate } from "../transaction-date"
import HideableArea from "../hideable-area/hideable-area"
import { toWalletAmount } from "@app/types/amounts"

const useStyles = makeStyles((theme) => ({
  container: {
    height: 60,
    paddingVertical: 9,
    borderColor: theme.colors.lighterGreyOrBlack,
    borderBottomWidth: 2,
    overflow: "hidden",
    backgroundColor: theme.colors.whiteOrDarkGrey,
  },
  containerFirst: {
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  containerLast: {
    overflow: "hidden",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  lastListItemContainer: {
    borderBottomWidth: 0,
  },
  hiddenBalanceContainer: {
    fontSize: 16,
    color: theme.colors.grey1,
  },
  pending: {
    color: theme.colors.grey7,
    textAlign: "right",
    flexWrap: "wrap",
  },
  receive: {
    color: palette.green,
    textAlign: "right",
    flexWrap: "wrap",
  },
  send: {
    color: theme.colors.grey1,
    textAlign: "right",
    flexWrap: "wrap",
  },
  text: {
    color: theme.colors.grey1,
  },
}))

// This should extend the Transaction directly from the cache
export const descriptionDisplay = ({
  tx,
  bankName,
}: {
  tx: TransactionFragment
  bankName: string
}) => {
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
        ? `From ${settlementVia.counterPartyUsername || bankName + " User"}`
        : `To ${settlementVia.counterPartyUsername || bankName + " User"}`
  }
}

const AmountDisplayStyle = ({
  isReceive,
  isPending,
}: {
  isReceive: boolean
  isPending: boolean
}) => {
  const styles = useStyles()

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
  const styles = useStyles()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data: tx } = useFragment_experimental<TransactionFragment>({
    fragment: TransactionFragmentDoc,
    fragmentName: "Transaction",
    from: {
      __typename: "Transaction",
      id: txid,
    },
  })

  const {
    appConfig: { galoyInstance },
  } = useAppConfig()
  const { formatMoneyAmount, formatCurrency } = useDisplayCurrency()
  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const isBalanceVisible = hideBalance ?? false
  if (!tx || Object.keys(tx).length === 0) {
    return null
  }

  const isReceive = tx.direction === "RECEIVE"
  const isPending = tx.status === "PENDING"
  const description = descriptionDisplay({
    tx,
    bankName: galoyInstance.name,
  })
  const walletCurrency = tx.settlementCurrency as WalletCurrency

  const formattedSettlementAmount = formatMoneyAmount({
    moneyAmount: toWalletAmount({
      amount: tx.settlementAmount,
      currency: tx.settlementCurrency,
    }),
  })

  const formattedDisplayAmount = formatCurrency({
    amountInMajorUnits: tx.settlementDisplayAmount,
    currency: tx.settlementDisplayCurrency,
  })

  const formattedSecondaryAmount =
    tx.settlementDisplayCurrency === tx.settlementCurrency
      ? undefined
      : formattedSettlementAmount

  return (
    <View
      style={[isLast ? styles.containerLast : {}, isFirst ? styles.containerFirst : {}]}
    >
      <ListItem
        {...testProps("transaction-item")}
        containerStyle={[styles.container, isLast ? styles.lastListItemContainer : {}]}
        onPress={() =>
          navigation.navigate("transactionDetail", {
            txid: tx.id,
          })
        }
      >
        <IconTransaction
          onChain={tx.settlementVia.__typename === "SettlementViaOnChain"}
          isReceive={isReceive}
          pending={isPending}
          walletCurrency={walletCurrency}
        />
        <ListItem.Content {...testProps("list-item-content")}>
          <ListItem.Title
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.text}
            {...testProps("tx-description")}
          >
            {description}
          </ListItem.Title>
          <ListItem.Subtitle style={styles.text}>
            {subtitle ? (
              <TransactionDate diffDate={true} friendly={true} {...tx} />
            ) : undefined}
          </ListItem.Subtitle>
        </ListItem.Content>

        <HideableArea
          isContentVisible={isBalanceVisible}
          hiddenContent={<Icon style={styles.hiddenBalanceContainer} name="eye" />}
        >
          <View>
            <Text style={AmountDisplayStyle({ isReceive, isPending })}>
              {formattedDisplayAmount}
            </Text>
            {formattedSecondaryAmount ? (
              <Text style={AmountDisplayStyle({ isReceive, isPending })}>
                {formattedSecondaryAmount}
              </Text>
            ) : null}
          </View>
        </HideableArea>
      </ListItem>
    </View>
  )
}
