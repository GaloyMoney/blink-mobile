import * as React from "react"
import { Linking, TouchableWithoutFeedback, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

// eslint-disable-next-line camelcase
import { useFragment_experimental } from "@apollo/client"
import { TransactionDate } from "@app/components/transaction-date"
import { useDescriptionDisplay } from "@app/components/transaction-item"
import { WalletSummary } from "@app/components/wallet-summary"
import {
  SettlementVia,
  TransactionFragment,
  TransactionFragmentDoc,
  WalletCurrency,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"

import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { useAppConfig } from "@app/hooks"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { toWalletAmount } from "@app/types/amounts"
import { isIos } from "@app/utils/helper"
import { GaloyInfo } from "@app/components/atomic/galoy-info"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

const Row = ({
  entry,
  value,
  __typename,
  content,
}: {
  entry: string
  value?: string | JSX.Element
  __typename?: "SettlementViaIntraLedger" | "SettlementViaLn" | "SettlementViaOnChain"
  content?: unknown
}) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  return (
    <View style={styles.description}>
      <>
        <Text style={styles.entry}>
          {entry}
          {__typename === "SettlementViaOnChain" && (
            <Icon name="open-outline" size={18} color={colors.grey0} />
          )}
        </Text>
        {content || (
          <View style={styles.valueContainer}>
            <Text selectable style={styles.value}>
              {value}
            </Text>
          </View>
        )}
      </>
    </View>
  )
}

const typeDisplay = (instance: SettlementVia) => {
  switch (instance.__typename) {
    case "SettlementViaOnChain":
      return "OnChain"
    case "SettlementViaLn":
      return "Lightning"
    case "SettlementViaIntraLedger":
      return "IntraLedger"
  }
}

type Props = {
  route: RouteProp<RootStackParamList, "transactionDetail">
}

export const TransactionDetailScreen: React.FC<Props> = ({ route }) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { formatMoneyAmount } = useDisplayCurrency()
  const {
    appConfig: { galoyInstance },
  } = useAppConfig()
  const { txid } = route.params

  const viewInExplorer = (hash: string): Promise<Linking> =>
    Linking.openURL(galoyInstance.blockExplorer + hash)

  const { data: tx } = useFragment_experimental<TransactionFragment>({
    fragment: TransactionFragmentDoc,
    fragmentName: "Transaction",
    from: {
      __typename: "Transaction",
      id: txid,
    },
  })

  const { LL } = useI18nContext()
  const { formatCurrency } = useDisplayCurrency()

  const description = useDescriptionDisplay({
    tx,
    bankName: galoyInstance.name,
  })

  // FIXME doesn't work with storybook
  // TODO: translation
  if (!tx || Object.keys(tx).length === 0)
    return <Text>{"No transaction found with this ID (should not happen)"}</Text>

  const {
    id,
    settlementCurrency,
    settlementAmount,
    settlementDisplayFee,
    settlementDisplayAmount,
    settlementDisplayCurrency,
    settlementFee,

    settlementVia,
    initiationVia,
  } = tx

  const isReceive = tx.direction === "RECEIVE"

  const walletCurrency = settlementCurrency as WalletCurrency
  const spendOrReceiveText = isReceive
    ? LL.TransactionDetailScreen.received()
    : LL.TransactionDetailScreen.spent()

  const displayAmount = formatCurrency({
    amountInMajorUnits: settlementDisplayAmount,
    currency: settlementDisplayCurrency,
  })

  const formattedPrimaryFeeAmount = formatCurrency({
    amountInMajorUnits: settlementDisplayFee,
    currency: settlementDisplayCurrency,
  })

  const formattedSettlementFee = formatMoneyAmount({
    moneyAmount: toWalletAmount({
      amount: settlementFee,
      currency: settlementCurrency,
    }),
  })

  const onChainTxBroadcasted =
    settlementVia.__typename === "SettlementViaOnChain" &&
    settlementVia.transactionHash !== null
  const onChainTxNotBroadcasted =
    settlementVia.__typename === "SettlementViaOnChain" &&
    settlementVia.transactionHash === null

  // only show a secondary amount if it is in a different currency than the primary amount
  const formattedSecondaryFeeAmount =
    tx.settlementDisplayCurrency === tx.settlementCurrency
      ? undefined
      : formattedSettlementFee

  const formattedFeeText =
    formattedPrimaryFeeAmount +
    (formattedSecondaryFeeAmount ? ` (${formattedSecondaryFeeAmount})` : ``)
  const Wallet = (
    <WalletSummary
      amountType={isReceive ? "RECEIVE" : "SEND"}
      settlementAmount={toWalletAmount({
        amount: Math.abs(settlementAmount),
        currency: settlementCurrency,
      })}
      txDisplayAmount={settlementDisplayAmount}
      txDisplayCurrency={settlementDisplayCurrency}
    />
  )

  return (
    <Screen unsafe preset="scroll">
      <View
        style={[
          styles.amountDetailsContainer,
          {
            backgroundColor: colors.grey5,
          },
        ]}
      >
        <View accessible={false} style={styles.closeIconContainer}>
          <GaloyIconButton
            name="close"
            onPress={navigation.goBack}
            iconOnly={true}
            size={"large"}
          />
        </View>
        <View style={styles.amountView}>
          <IconTransaction
            isReceive={isReceive}
            walletCurrency={walletCurrency}
            pending={false}
            onChain={false}
          />
          <Text type="h2">{spendOrReceiveText}</Text>
          <Text type="h1">{displayAmount}</Text>
        </View>
      </View>

      <View style={styles.transactionDetailView}>
        {onChainTxNotBroadcasted && (
          <View style={styles.txNotBroadcast}>
            <GaloyInfo>{LL.TransactionDetailScreen.txNotBroadcast()}</GaloyInfo>
          </View>
        )}
        <Row
          entry={
            isReceive
              ? LL.TransactionDetailScreen.receivingAccount()
              : LL.TransactionDetailScreen.sendingAccount()
          }
          content={Wallet}
        />
        <Row entry={LL.common.date()} value={<TransactionDate {...tx} />} />
        {!isReceive && <Row entry={LL.common.fees()} value={formattedFeeText} />}
        <Row entry={LL.common.description()} value={description} />
        {settlementVia.__typename === "SettlementViaIntraLedger" && (
          <Row
            entry={LL.TransactionDetailScreen.paid()}
            value={settlementVia.counterPartyUsername || galoyInstance.name}
          />
        )}
        <Row entry={LL.common.type()} value={typeDisplay(settlementVia)} />
        {settlementVia.__typename === "SettlementViaLn" &&
          initiationVia.__typename === "InitiationViaLn" && (
            <Row entry="Hash" value={initiationVia.paymentHash} />
          )}
        {onChainTxBroadcasted && (
          <TouchableWithoutFeedback
            onPress={() => viewInExplorer(settlementVia.transactionHash || "")}
          >
            <View>
              <Row
                entry="Hash"
                value={settlementVia.transactionHash || ""}
                __typename={settlementVia.__typename}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
        {id && <Row entry="id" value={id} />}
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  closeIconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 10,
  },

  amountText: {
    fontSize: 18,
    marginVertical: 6,
  },

  amountDetailsContainer: {
    paddingTop: isIos ? 36 : 0,
  },

  amountView: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -12 }],
  },

  description: {
    marginBottom: 6,
  },

  entry: {
    marginBottom: 6,
  },

  transactionDetailView: {
    marginHorizontal: 24,
    marginVertical: 12,
  },
  valueContainer: {
    flexDirection: "row",
    minHeight: 60,
    padding: 14,
    backgroundColor: colors.grey5,
    alignItems: "center",
    borderRadius: 8,
  },
  value: {
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  txNotBroadcast: {
    marginBottom: 16,
  },
}))
