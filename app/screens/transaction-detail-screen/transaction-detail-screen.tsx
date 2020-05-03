import * as React from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import { TextCurrency } from "../../components/text-currency"
import { palette } from "../../theme/palette"
import { AccountDetailItemProps } from "../account-detail-screen"
import { Divider } from "react-native-elements"
import { CloseCross } from "../../components/close-cross"
import { IconTransaction } from "../../components/icon-transactions"


const styles = EStyleSheet.create({
  screen: {
    backgroundColor: palette.white
  },

  amountText: {
    fontSize: "18rem",
    marginVertical: "6rem",
    color: palette.white,
  },

  amount: {
    fontSize: "32rem",
    color: palette.white,
    fontWeight: "bold",
  },

  amountView: {
    alignItems: "center",
    paddingVertical: "48rem",
    backgroundColor: palette.orange,
  },

  description: {
    marginVertical: 12,
  },

  map: {
    height: 150,
    marginBottom: 12,
    marginLeft: "auto",
    marginRight: 30,
    width: 150,
  },

  entry: {
    color: palette.midGrey,
    marginBottom: "6rem",
  },

  value: {
    color: palette.darkGrey,
    fontSize: "14rem",
    fontWeight: "bold",
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

  divider: {
    backgroundColor: palette.midGrey,
    marginVertical: "12rem",
  }
})

const Row = ({ entry, value }) => (
  <View style={styles.description}>
    <Text style={styles.entry}>{entry}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
)

export const TransactionDetailScreen = ({ route, navigation }) => {
  
  const { currency, account, amount, created_at, hash, type, description, 
    destination } = route.params as AccountDetailItemProps

  const spendOrReceive = amount < 0 ? "spent" : "received"

  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }
  const date_format = created_at.toLocaleString("en-US", options)

  return (
    <Screen style={styles.screen}>
      <View style={styles.amountView}>
      <IconTransaction type={type.includes("invoice") ? "receive" : "send"} size={100} />
      <Text style={styles.amountText}>You {spendOrReceive}</Text>
        <TextCurrency amount={Math.abs(amount)} currency={currency} 
          style={styles.amount} />
      </View>

      <View style={styles.transactionDetailView}>
        <Text style={styles.transactionDetailText}>Transaction Details</Text>
        <Divider style={styles.divider} />
        <Row entry={"Date"} value={date_format}></Row>
        <Row entry={"Description"} value={description} />
        <Row entry={"Hash"} value={hash} />
      </View>
      <CloseCross color={palette.white} onPress={() => navigation.goBack()} />
    </Screen>
  )
}
