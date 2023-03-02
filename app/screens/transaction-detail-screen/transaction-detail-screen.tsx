// eslint-disable-next-line camelcase
import { useFragment_experimental } from "@apollo/client"
import { TransactionDate } from "@app/components/transaction-date"
import { descriptionDisplay } from "@app/components/transaction-item"
import { WalletSummary } from "@app/components/wallet-summary"
import {
  SettlementVia,
  Transaction,
  TransactionFragmentDoc,
  WalletCurrency,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Divider } from "@rneui/base"
import * as React from "react"
import { Linking, Text, TouchableWithoutFeedback, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { CloseCross } from "../../components/close-cross"
import { IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { TextCurrencyForAmount } from "../../components/text-currency"
import { BLOCKCHAIN_EXPLORER_URL } from "../../config/support"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme"

const viewInExplorer = (hash: string): Promise<Linking> =>
  Linking.openURL(BLOCKCHAIN_EXPLORER_URL + hash)

const styles = EStyleSheet.create({
  amount: {
    color: palette.white,
    fontSize: "32rem",
  },

  amountSecondary: {
    color: palette.white,
    fontSize: "16rem",
  },

  amountText: {
    color: palette.white,
    fontSize: "18rem",
    marginVertical: "6rem",
  },

  amountView: {
    alignItems: "center",
    paddingBottom: "24rem",
    paddingTop: "48rem",
  },

  description: {
    marginVertical: 12,
  },
  divider: {
    backgroundColor: palette.midGrey,
    marginVertical: "12rem",
  },
  entry: {
    color: palette.darkGrey,
    marginBottom: "6rem",
  },
  transactionDetailText: {
    color: palette.darkGrey,
    fontSize: "18rem",
    fontWeight: "bold",
  },
  transactionDetailView: {
    marginHorizontal: "24rem",
    marginVertical: "24rem",
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
    fontSize: "14rem",
    fontWeight: "bold",
  },
})

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
}) => (
  <View style={styles.description}>
    <>
      <Text style={styles.entry}>
        {entry + " "}
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

const typeDisplay = (instance: SettlementVia) => {
  switch (instance.__typename) {
    case "SettlementViaOnChain":
      return "OnChain"
    case "SettlementViaLn":
      return "Lightning"
    case "SettlementViaIntraLedger":
      return "BitcoinBeach"
  }
}

type Props = {
  route: RouteProp<RootStackParamList, "transactionDetail">
}

export const TransactionDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { formatMoneyAmount } = useDisplayCurrency()

  const { txid } = route.params

  const { data: tx } = useFragment_experimental<Transaction>({
    fragment: TransactionFragmentDoc,
    fragmentName: "Transaction",
    from: {
      __typename: "Transaction",
      id: txid,
    },
  })

  const { LL } = useI18nContext()
  const { formatToDisplayCurrency, computeUsdAmount } = useDisplayCurrency()

  // TODO: translation
  if (!tx || Object.keys(tx).length === 0)
    return <Text>{"No transaction found with this ID (should not happen)"}</Text>

  const {
    id,
    settlementCurrency,
    settlementAmount,
    settlementFee,
    settlementPrice,

    settlementVia,
    initiationVia,
  } = tx

  const isReceive = tx.direction === "RECEIVE"
  const description = descriptionDisplay(tx)

  const walletCurrency = settlementCurrency as WalletCurrency
  const spendOrReceiveText = isReceive
    ? LL.TransactionDetailScreen.received()
    : LL.TransactionDetailScreen.spent()

  const { base, offset } = settlementPrice

  // FIXME: remove custom calculation
  const usdPerSat = base / 10 ** offset / 100

  const displayAmount = computeUsdAmount(tx)

  const feeEntry =
    settlementCurrency === WalletCurrency.Btc
      ? `${settlementFee} sats (${formatToDisplayCurrency(settlementFee * usdPerSat)})`
      : formatMoneyAmount({
          amount: settlementFee,
          currency: settlementCurrency as WalletCurrency,
        })

  const walletSummary = (
    <WalletSummary
      walletCurrency={walletCurrency}
      amountType={isReceive ? "RECEIVE" : "SEND"}
      balanceInDisplayCurrency={Math.abs(displayAmount)}
      btcBalanceInSats={
        walletCurrency === WalletCurrency.Btc ? Math.abs(settlementAmount) : undefined
      }
    />
  )

  return (
    <Screen backgroundColor={palette.lighterGrey} unsafe preset="scroll">
      <View
        style={[
          styles.amountView,
          {
            backgroundColor:
              walletCurrency === WalletCurrency.Usd
                ? palette.usdPrimary
                : palette.btcPrimary,
          },
        ]}
      >
        <IconTransaction
          isReceive={isReceive}
          walletCurrency={walletCurrency}
          pending={false}
          onChain={false}
        />
        <Text style={styles.amountText}>{spendOrReceiveText}</Text>
        <TextCurrencyForAmount
          amount={Math.abs(displayAmount)}
          currency="display"
          style={styles.amount}
        />
        {walletCurrency === WalletCurrency.Btc && (
          <TextCurrencyForAmount
            amount={Math.abs(settlementAmount)}
            currency="BTC"
            style={styles.amountSecondary}
            satsIconSize={20}
            iconColor={palette.white}
          />
        )}
      </View>
      <View style={styles.transactionDetailView}>
        <Text style={styles.transactionDetailText}>
          {LL.TransactionDetailScreen.detail()}
        </Text>
        <Divider style={styles.divider} />
        {/* NEED TRANSLATION */}
        <Row
          entry={isReceive ? "Receiving Wallet" : "Sending Wallet"}
          content={walletSummary}
        />
        <Row entry={LL.common.date()} value={<TransactionDate {...tx} />} />
        {!isReceive && <Row entry={LL.common.fees()} value={feeEntry} />}
        <Row entry={LL.common.description()} value={description} />
        {settlementVia.__typename === "SettlementViaIntraLedger" && (
          <Row
            entry={LL.TransactionDetailScreen.paid()}
            value={settlementVia.counterPartyUsername || "BitcoinBeach Wallet"}
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
      <CloseCross color={palette.white} onPress={() => navigation.goBack()} />
    </Screen>
  )
}
