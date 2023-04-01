import * as React from "react"
import { Linking, Text, TouchableWithoutFeedback, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

// eslint-disable-next-line camelcase
import { useFragment_experimental } from "@apollo/client"
import { TransactionDate } from "@app/components/transaction-date"
import { descriptionDisplay } from "@app/components/transaction-item"
import { WalletSummary } from "@app/components/wallet-summary"
import {
  SettlementVia,
  TransactionFragment,
  TransactionFragmentDoc,
  WalletCurrency,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "@app/utils/testProps"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Divider } from "@rneui/base"

import { IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { palette } from "../../theme"

import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { useAppConfig } from "@app/hooks"
import { makeStyles } from "@rneui/themed"

const useStyles = makeStyles((theme) => ({
  closeIconContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 10,
  },

  amount: {
    color: palette.white,
    fontSize: 32,
  },

  amountText: {
    color: palette.white,
    fontSize: 18,
    marginVertical: 6,
  },

  amountDetailsContainer: {
    flexDirection: "column",
    paddingBottom: 24,
    paddingTop: 48,
  },

  amountView: {
    alignItems: "center",
    justifyContent: "center",
  },

  description: {
    marginVertical: 12,
  },
  divider: {
    backgroundColor: palette.midGrey,
    marginVertical: 12,
  },
  entry: {
    color: theme.colors.darkGreyOrWhite,
    marginBottom: 6,
  },
  transactionDetailText: {
    color: palette.darkGrey,
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionDetailView: {
    marginHorizontal: 24,
    marginVertical: 24,
  },
  valueContainer: {
    flexDirection: "row",
    height: 50,
    backgroundColor: palette.white,
    alignItems: "center",
    borderRadius: 8,
  },
  value: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  background: {
    color: theme.colors.white,
  },
}))

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
  const styles = useStyles()
  return (
    <View style={styles.description}>
      <>
        <Text style={styles.entry}>
          {entry}
          {__typename === "SettlementViaOnChain" && (
            <Icon name="open-outline" size={18} color={palette.darkGrey} />
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
  const description = descriptionDisplay({
    tx,
    bankName: galoyInstance.name,
  })

  const walletCurrency = settlementCurrency as WalletCurrency
  const spendOrReceiveText = isReceive
    ? LL.TransactionDetailScreen.received()
    : LL.TransactionDetailScreen.spent()

  const displayAmount = formatCurrency({
    amountInMajorUnits: settlementDisplayAmount,
    currency: settlementDisplayCurrency,
  })

  const formattedDisplayFee = formatCurrency({
    amountInMajorUnits: settlementDisplayFee,
    currency: settlementDisplayCurrency,
  })

  const formattedSettlementFee = formatMoneyAmount({
    moneyAmount: {
      amount: settlementFee,
      currency: settlementCurrency,
    },
  })

  const formattedPrimaryFeeAmount = formattedDisplayFee
  const formattedSecondaryFeeAmount =
    tx.settlementDisplayCurrency === tx.settlementCurrency
      ? undefined
      : formattedSettlementFee // only show a secondary amount if it is in a different currency than the primary amount

  const formattedFeeText =
    formattedPrimaryFeeAmount +
    (formattedSecondaryFeeAmount ? ` (${formattedSecondaryFeeAmount})` : ``)
  const walletSummary = (
    <WalletSummary
      amountType={isReceive ? "RECEIVE" : "SEND"}
      settlementAmount={{
        amount: Math.abs(settlementAmount),
        currency: settlementCurrency,
      }}
      txDisplayAmount={settlementDisplayAmount}
      txDisplayCurrency={settlementDisplayCurrency}
    />
  )

  return (
    <Screen backgroundColor={styles.background.color} unsafe preset="scroll">
      <View
        style={[
          styles.amountDetailsContainer,
          {
            backgroundColor:
              walletCurrency === WalletCurrency.Usd
                ? palette.usdPrimary
                : palette.btcPrimary,
          },
        ]}
      >
        <View accessible={false} style={styles.closeIconContainer}>
          <Icon
            {...testProps("close-button")}
            name="ios-close"
            onPress={navigation.goBack}
            color={palette.white}
            size={60}
          />
        </View>
        <View style={styles.amountView}>
          <IconTransaction
            isReceive={isReceive}
            walletCurrency={walletCurrency}
            pending={false}
            onChain={false}
          />
          <Text style={styles.amountText}>{spendOrReceiveText}</Text>
          <Text style={styles.amount}>{displayAmount}</Text>
        </View>
      </View>

      <View style={styles.transactionDetailView}>
        <Text
          {...testProps(LL.TransactionDetailScreen.detail())}
          style={styles.transactionDetailText}
        >
          {LL.TransactionDetailScreen.detail()}
        </Text>
        <Divider style={styles.divider} />
        <Row
          entry={
            isReceive
              ? LL.TransactionDetailScreen.receivingAccount()
              : LL.TransactionDetailScreen.sendingAccount()
          }
          content={walletSummary}
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
        {settlementVia.__typename === "SettlementViaOnChain" && (
          <TouchableWithoutFeedback
            onPress={() => viewInExplorer(settlementVia.transactionHash)}
          >
            <View>
              <Row
                entry="Hash"
                value={settlementVia.transactionHash}
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
