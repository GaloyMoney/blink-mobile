import * as React from "react"
import { useState } from "react"
import { inject, observer } from "mobx-react"
import { Text, View, Alert, StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button } from "react-native-elements"
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: color.primary,
    marginHorizontal: 20,
    marginVertical: 10,
  },

  horizontalContainer: {
    // flex: 1,
    flexDirection: "row",
  },

  icon: {
    color: palette.darkGrey,
    marginRight: 15,
  },

  invoiceContainer: {
    alignSelf: "flex-end",
    flex: 1,
  },

  note: {
    color: palette.darkGrey,
    fontSize: 18,
    marginLeft: 10,
    textAlign: "left",
  },

  section: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  smallText: {
    color: palette.darkGrey,
    fontSize: 18,
    marginBottom: 10,
    textAlign: "left",
  },

  squareButton: {
    backgroundColor: color.primary,
    height: 70,
    width: 70,
  },
})

export const BankTransferScreen: React.FC = () => {
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
}
