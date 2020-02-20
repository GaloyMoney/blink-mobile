import * as React from "react"
import { useState } from "react"
import { inject, observer } from "mobx-react"
import { Text, View, Alert, StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button } from "react-native-elements"
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"

const styles = StyleSheet.create({
  squareButton: {
    width: 70,
    height: 70,
    backgroundColor: color.primary,
  },

  smallText: {
    fontSize: 18,
    color: palette.darkGrey,
    textAlign: "left",
    marginBottom: 10,
  },

  note: {
    fontSize: 18,
    color: palette.darkGrey,
    textAlign: "left",
    marginLeft: 10,
  },

  horizontalContainer: {
    // flex: 1,
    flexDirection: "row",
  },

  icon: {
    marginRight: 15,
    color: palette.darkGrey,
  },

  invoiceContainer: {
    flex: 1,
    alignSelf: "flex-end",
  },

  buttonStyle: {
    backgroundColor: color.primary,
    marginHorizontal: 20,
    marginVertical: 10,
  },

  section: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
})

export const BankTransferScreen: React.FC = inject("dataStore")(
  observer(({ dataStore }) => {
    const [amount, setAmount] = useState(0)
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")

    const { navigate } = useNavigation()

    const Section = ({ title, icon, placeholder = "" }) => {
      return (
        <View style={styles.section}>
          <Text style={styles.smallText}>{title}</Text>
          <View style={styles.horizontalContainer}>
            <Input
              placeholder={placeholder}
              leftIcon={icon}
              // value={}
              containerStyle={styles.invoiceContainer}
            />
          </View>
        </View>
      )
    }

    return (
      <Screen>
        <Section title="Amount" icon={<Text>$</Text>} />
        <Section
          title="From"
          placeholder="Select an account"
          icon={<Icon name="ios-log-out" size={24} color={color.primary} style={styles.icon} />}
        />
        <Section
          title="To"
          placeholder="Select an account"
          icon={<Icon name="ios-log-in" size={24} color={color.primary} style={styles.icon} />}
        />
        <Button
          buttonStyle={styles.buttonStyle}
          title="Transfer"
          onPress={() => Alert.alert("We're still implementing transfer")}
        />
      </Screen>
    )
  }),
)

BankTransferScreen.navigationOptions = () => ({
  title: translate("BankTransferScreen.title"),
})
