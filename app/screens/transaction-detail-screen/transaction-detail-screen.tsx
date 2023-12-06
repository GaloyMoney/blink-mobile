import * as React from "react"
import { Linking, RefreshControl, TouchableWithoutFeedback, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import Clipboard from "@react-native-clipboard/clipboard"

import { useFragment } from "@apollo/client"
import { TransactionDate } from "@app/components/transaction-date"
import { useDescriptionDisplay } from "@app/components/transaction-item"
import { WalletSummary } from "@app/components/wallet-summary"
import {
  SettlementVia,
  TransactionFragment,
  TransactionFragmentDoc,
  useTransactionListForDefaultAccountLazyQuery,
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
import { DeepPartialObject } from "@app/components/transaction-item/index.types"
import { ScrollView } from "react-native-gesture-handler"
import { formatTimeToMempool } from "./format-time"
import { toastShow } from "@app/utils/toast"

const Row = ({
  entry,
  value,
  content,
  icons = [],
}: {
  entry: string
  value?: string | null | undefined | JSX.Element
  content?: JSX.Element
  icons?: JSX.Element[]
}) => {
  const styles = useStyles()

  return (
    <View style={styles.description}>
      <View style={styles.container}>
        <Text style={styles.entry} selectable={false}>
          {entry}
        </Text>
        {icons.map((icon, index) => (
          <React.Fragment key={index}>{icon}</React.Fragment>
        ))}
      </View>
      {content ? (
        content
      ) : (
        <View style={styles.valueContainer}>
          <Text selectable={false} style={styles.value}>
            {value}
          </Text>
        </View>
      )}
    </View>
  )
}

const typeDisplay = (instance?: SettlementVia | DeepPartialObject<SettlementVia>) => {
  if (!instance || !instance.__typename) {
    return "Unknown"
  }

  switch (instance.__typename) {
    case "SettlementViaOnChain":
      return "OnChain"
    case "SettlementViaLn":
      return "Lightning"
    case "SettlementViaIntraLedger":
      return "IntraLedger"
    default:
      return "Unknown"
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

  const viewInLightningDecoder = (invoice: string): Promise<Linking> =>
    Linking.openURL("https://lightningdecoder.com/" + invoice)

  const { data: tx } = useFragment<TransactionFragment>({
    fragment: TransactionFragmentDoc,
    fragmentName: "Transaction",
    from: {
      __typename: "Transaction",
      id: txid,
    },
  })

  const [refetch, { loading }] = useTransactionListForDefaultAccountLazyQuery()

  const { LL, locale } = useI18nContext()
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
    createdAt,
    status,
  } = tx

  if (
    !settlementCurrency ||
    settlementAmount === undefined ||
    settlementDisplayFee === undefined ||
    settlementDisplayAmount === undefined ||
    !settlementDisplayCurrency ||
    settlementFee === undefined ||
    !settlementVia ||
    !createdAt ||
    !status
  ) {
    return <Text>missing values to render the screen</Text>
  }

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
    settlementVia?.__typename === "SettlementViaOnChain" &&
    settlementVia.transactionHash !== null
  const onChainTxNotBroadcasted =
    settlementVia?.__typename === "SettlementViaOnChain" &&
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

  const arrivalInMempoolEstimatedAt =
    onChainTxNotBroadcasted &&
    settlementVia?.__typename === "SettlementViaOnChain" &&
    settlementVia.arrivalInMempoolEstimatedAt

  const countdown =
    typeof arrivalInMempoolEstimatedAt === "number"
      ? formatTimeToMempool(arrivalInMempoolEstimatedAt, LL, locale)
      : ""

  const copyToClipboard = ({ content, type }: { content: string; type: string }) => {
    Clipboard.setString(content)
    toastShow({
      type: "success",
      message: LL.TransactionDetailScreen.hasBeenCopiedToClipboard({ type }),
      LL,
    })
  }

  return (
    <Screen unsafe preset="fixed">
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
            onChain={settlementVia?.__typename === "SettlementViaOnChain"}
          />
          <Text type="h2">{spendOrReceiveText}</Text>
          <Text type="h1">{displayAmount}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.transactionDetailView}
        refreshControl={
          onChainTxNotBroadcasted ? (
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={[colors.primary]} // Android refresh indicator colors
              tintColor={colors.primary} // iOS refresh indicator color
            />
          ) : undefined
        }
      >
        {onChainTxNotBroadcasted && (
          <View style={styles.txNotBroadcast}>
            <GaloyInfo>
              {LL.TransactionDetailScreen.txNotBroadcast({ countdown })}
            </GaloyInfo>
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
        <Row
          entry={LL.common.date()}
          value={<TransactionDate createdAt={createdAt} status={status} />}
        />
        {!isReceive && <Row entry={LL.common.fees()} value={formattedFeeText} />}
        <Row entry={LL.common.description()} value={description} />
        {settlementVia?.__typename === "SettlementViaIntraLedger" && (
          <Row
            entry={LL.TransactionDetailScreen.paid()}
            value={settlementVia.counterPartyUsername || galoyInstance.name}
          />
        )}
        <Row entry={LL.common.type()} value={typeDisplay(settlementVia)} />
        {initiationVia?.__typename === "InitiationViaLn" &&
          initiationVia?.paymentHash && (
            <Row
              entry="Hash"
              value={initiationVia?.paymentHash}
              icons={[
                <View key="icon-0">
                  <TouchableWithoutFeedback
                    onPress={() =>
                      copyToClipboard({
                        content: initiationVia?.paymentHash ?? "",
                        type: "Hash",
                      })
                    }
                  >
                    <Icon
                      name="copy-outline"
                      size={22}
                      color={colors.primary}
                      style={styles.icon}
                    />
                  </TouchableWithoutFeedback>
                </View>,
              ]}
            />
          )}

        {settlementVia?.__typename === "SettlementViaLn" && settlementVia?.preImage && (
          <Row
            entry={LL.common.preimageProofOfPayment()}
            value={settlementVia?.preImage}
            icons={[
              <View key="icon-0">
                <TouchableWithoutFeedback
                  onPress={() =>
                    copyToClipboard({
                      content: settlementVia?.preImage || "",
                      type: LL.common.preimageProofOfPayment(),
                    })
                  }
                >
                  <Icon
                    name="copy-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.icon}
                  />
                </TouchableWithoutFeedback>
              </View>,
            ]}
          />
        )}
        {initiationVia?.__typename === "InitiationViaLn" &&
          initiationVia?.paymentRequest && (
            <Row
              entry={LL.common.paymentRequest()}
              value={initiationVia?.paymentRequest}
              icons={[
                <View key="icon-1">
                  <TouchableWithoutFeedback
                    onPress={() =>
                      viewInLightningDecoder(initiationVia?.paymentRequest || "")
                    }
                  >
                    <Icon
                      name="open-outline"
                      size={22}
                      color={colors.primary}
                      style={styles.icon}
                    />
                  </TouchableWithoutFeedback>
                </View>,
                <View key="icon-0">
                  <TouchableWithoutFeedback
                    onPress={() =>
                      copyToClipboard({
                        content: initiationVia?.paymentRequest ?? "",
                        type: LL.common.paymentRequest(),
                      })
                    }
                  >
                    <Icon
                      name="copy-outline"
                      size={22}
                      color={colors.primary}
                      style={styles.icon}
                    />
                  </TouchableWithoutFeedback>
                </View>,
              ]}
            />
          )}
        {onChainTxBroadcasted && (
          <View>
            <Row
              entry="Transaction Hash"
              value={settlementVia.transactionHash || ""}
              icons={[
                <View key="icon-1">
                  <TouchableWithoutFeedback
                    onPress={() => viewInExplorer(settlementVia.transactionHash || "")}
                  >
                    <Icon
                      name="open-outline"
                      size={22}
                      color={colors.primary}
                      style={styles.icon}
                    />
                  </TouchableWithoutFeedback>
                </View>,
                <View key="icon-0">
                  <TouchableWithoutFeedback
                    onPress={() =>
                      copyToClipboard({
                        content: settlementVia.transactionHash || "",
                        type: "Transaction Hash",
                      })
                    }
                  >
                    <Icon
                      name="copy-outline"
                      size={22}
                      color={colors.primary}
                      style={styles.icon}
                    />
                  </TouchableWithoutFeedback>
                </View>,
              ]}
            />
          </View>
        )}
        {id && (
          <Row
            entry="Blink Internal Id"
            value={id}
            icons={[
              <View key="icon-0">
                <TouchableWithoutFeedback
                  onPress={() =>
                    copyToClipboard({
                      content: id,
                      type: "Blink Internal Id",
                    })
                  }
                >
                  <Icon
                    name="copy-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.icon}
                  />
                </TouchableWithoutFeedback>
              </View>,
            ]}
          />
        )}
      </ScrollView>
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
    marginVertical: 4,
  },

  transactionDetailView: {
    marginHorizontal: 24,
    paddingVertical: 12,
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

  icon: {
    marginBottom: 2,
    marginHorizontal: 12,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    verticalAlign: "top",
  },
}))
