import { StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"
import * as React from "react"
import { Text, View } from "react-native"
import { Divider } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import {
  colorTypeFromIconType,
  IconTransaction,
} from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { TextCurrency } from "../../components/text-currency"
import { translate } from "../../i18n"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { currencyFormatting } from "../../utils/currencyConversion"
import moment from "moment"

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
    color: palette.midGrey,
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

  value: {
    color: palette.darkGrey,
    fontSize: "14rem",
    fontWeight: "bold",
  },
})

const Row = ({ entry, value }: { entry: string; value: string }) => (
  <View style={styles.description}>
    <Text style={styles.entry}>{entry}</Text>
    <Text selectable style={styles.value}>
      {value}
    </Text>
  </View>
)

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionDetail">
  route: RouteProp<RootStackParamList, "transactionDetail">
}

const typeDisplay = (type: TransactionType) => {
  switch (type) {
    case "OnChainTransaction":
      return "OnChain"
    case "LnTransaction":
      return "Lightning"
    case "IntraLedgerTransaction":
      return "BitcoinBeach"
  }
}

export const TransactionDetailScreen: ScreenType = ({ route, navigation }: Props) => {
  const {
    settlementAmount,
    settlementFee,
    settlementPrice,
    usdAmount,

    paymentHash,
    description,
    id,
    __typename,
    otherPartyUsername,

    isReceive,
    isPending,
    createdAt,
  } = route.params

  const spendOrReceiveText = isReceive
    ? translate("TransactionDetailScreen.received")
    : translate("TransactionDetailScreen.spent")

  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100

  const feeEntry = `${settlementFee} sats ($${currencyFormatting.USD(
    settlementFee * usdPerSat,
  )})`

  const dateDisplay = moment.unix(createdAt).toDate().toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })

  return (
    <Screen backgroundColor={palette.white} unsafe preset="scroll">
      <View
        style={[
          styles.amountView,
          { backgroundColor: colorTypeFromIconType({ isReceive, isPending }) },
        ]}
      >
        <IconTransaction isReceive={isReceive} size={100} transparent />

        <Text style={styles.amountText}>{spendOrReceiveText}</Text>
        <TextCurrency amount={Math.abs(usdAmount)} currency="USD" style={styles.amount} />
        <TextCurrency
          amount={Math.abs(settlementAmount)}
          currency="BTC"
          style={styles.amountSecondary}
        />
      </View>

      <View style={styles.transactionDetailView}>
        <Text style={styles.transactionDetailText}>
          {translate("TransactionDetailScreen.detail")}
        </Text>
        <Divider style={styles.divider} />
        <Row entry={translate("common.date")} value={dateDisplay} />
        {!isReceive && <Row entry={translate("common.fees")} value={feeEntry} />}
        <Row entry={translate("common.description")} value={description} />
        {otherPartyUsername && (
          <Row
            entry={translate("TransactionDetailScreen.paid")}
            value={otherPartyUsername}
          />
        )}
        <Row entry={translate("common.type")} value={typeDisplay(__typename)} />
        {paymentHash && <Row entry="Hash" value={paymentHash} />}
        {id && <Row entry="id" value={id} />}
      </View>
      <CloseCross color={palette.white} onPress={() => navigation.goBack()} />
    </Screen>
  )
}
