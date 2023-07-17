import React from "react"
import { View } from "react-native"
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

import { useAppConfig } from "@app/hooks"
import { toWalletAmount } from "@app/types/amounts"
import { Text, makeStyles, ListItem } from "@rneui/themed"
import HideableArea from "../hideable-area/hideable-area"
import { IconTransaction } from "../icon-transactions"
import { TransactionDate } from "../transaction-date"
import { useI18nContext } from "@app/i18n/i18n-react"

// This should extend the Transaction directly from the cache
export const useDescriptionDisplay = ({
  tx,
  bankName,
}: {
  tx: TransactionFragment | undefined
  bankName: string
}) => {
  const { LL } = useI18nContext()

  if (!tx) {
    return ""
  }

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
        ? `${LL.common.from()} ${
            settlementVia.counterPartyUsername || bankName + " User"
          }`
        : `${LL.common.to()} ${settlementVia.counterPartyUsername || bankName + " User"}`
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
  txid: string
  subtitle?: boolean
  isFirst?: boolean
  isLast?: boolean
  isOnHomeScreen?: boolean
}

export const TransactionItem: React.FC<Props> = ({
  txid,
  subtitle = false,
  isFirst = false,
  isLast = false,
  isOnHomeScreen = false,
}) => {
  const styles = useStyles({
    isFirst,
    isLast,
    isOnHomeScreen,
  })

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

  const description = useDescriptionDisplay({
    tx,
    bankName: galoyInstance.name,
  })

  if (!tx || Object.keys(tx).length === 0) {
    return null
  }

  const isReceive = tx.direction === "RECEIVE"
  const isPending = tx.status === "PENDING"

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
    <ListItem
      {...testProps("transaction-item")}
      containerStyle={styles.container}
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
          {...testProps("tx-description")}
        >
          {description}
        </ListItem.Title>
        <ListItem.Subtitle>
          {subtitle ? <TransactionDate diffDate={true} {...tx} /> : undefined}
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
  )
}

type UseStyleProps = {
  isFirst?: boolean
  isLast?: boolean
  isOnHomeScreen?: boolean
}

const useStyles = makeStyles(({ colors }, props: UseStyleProps) => ({
  container: {
    height: 60,
    paddingVertical: 9,
    borderColor: colors.grey4,
    overflow: "hidden",
    backgroundColor: colors.grey5,
    borderTopWidth: (props.isFirst && props.isOnHomeScreen) || !props.isFirst ? 1 : 0,
    borderBottomLeftRadius: props.isLast && props.isOnHomeScreen ? 12 : 0,
    borderBottomRightRadius: props.isLast && props.isOnHomeScreen ? 12 : 0,
  },
  hiddenBalanceContainer: {
    fontSize: 16,
    color: colors.grey0,
  },
  pending: {
    color: colors.grey1,
    textAlign: "right",
    flexWrap: "wrap",
  },
  receive: {
    color: colors.green,
    textAlign: "right",
    flexWrap: "wrap",
  },
  send: {
    color: colors.grey0,
    textAlign: "right",
    flexWrap: "wrap",
  },
}))
