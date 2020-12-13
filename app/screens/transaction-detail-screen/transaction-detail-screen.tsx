import * as React from "react"
import { Text, TextInput, View } from "react-native"
import { Divider } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import { colorTypeFromIconType, IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { TextCurrency } from "../../components/text-currency"
import { TransactionItemProps } from "../../components/transaction-item"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { currencyFormatting } from "../../utils/currencyConversion"

const styles = EStyleSheet.create({
  amountText: {
    fontSize: "18rem",
    marginVertical: "6rem",
    color: palette.white,
  },

  amount: {
    fontSize: "32rem",
    color: palette.white,
  },

  amountSecondary: {
    fontSize: "16rem",
    color: palette.white,
  },

  amountView: {
    alignItems: "center",
    paddingTop: "48rem",
    paddingBottom: "24rem",
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
    <Text selectable style={styles.value}>{value}</Text>
  </View>
)

export const TransactionDetailScreen = ({ route, navigation }) => {
  
  const { currency, amount, hash, description, fee, isReceive, id, usd, feeUsd, date_format, type, pending, username } = route.params.tx as TransactionItemProps

  const spendOrReceiveText = isReceive ? 
    translate("TransactionDetailScreen.received") : 
    translate("TransactionDetailScreen.spent")

  let feeEntry = `${fee} sats ($${currencyFormatting["USD"](feeUsd)})`

  return (
    <Screen backgroundColor={palette.white} unsafe={true} preset="scroll">
      <View style={[styles.amountView, {backgroundColor: colorTypeFromIconType({isReceive, pending})}]}>
        <IconTransaction isReceive={isReceive} size={100} transparent={true} />
        <Text style={styles.amountText}>{spendOrReceiveText}</Text>
        {!!usd &&
          <TextCurrency amount={Math.abs(usd)} currency={"USD"} style={styles.amount} />
        }
        <TextCurrency amount={Math.abs(amount)} currency={currency} style={styles.amountSecondary} />
      </View>

      <View style={styles.transactionDetailView}>
        <Text style={styles.transactionDetailText}>{translate("TransactionDetailScreen.detail")}</Text>
        <Divider style={styles.divider} />
        <Row entry={translate("common.date")} value={date_format} />
        {!isReceive && 
          <Row entry={translate("common.fees")} value={feeEntry} />
        }
        <Row entry={translate("common.description")} value={description} />
        {username &&
          <Row entry={"Paid to/from"} value={username} />
        }
        <Row entry={translate("common.type")} value={type} />
        {hash &&
          <Row entry={"Hash"} value={hash} />
        }
        {id &&
          <Row entry={"id"} value={id} />
        }
      </View>
      <CloseCross color={palette.white} onPress={() => navigation.goBack()} />
    </Screen>
  )
}
