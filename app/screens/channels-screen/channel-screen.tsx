import * as React from "react"

import { View, StyleSheet } from "react-native"

import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"

import { DataStore } from "../../models/data-store"
import { AccountType, CurrencyType } from "../../utils/enum"
import { palette } from "../../theme/palette"

export interface AccountDetailScreenProps {
  account: AccountType
  dataStore: DataStore
}

export interface AccountDetailItemProps {
  // TODO check validity of this interface
  name: string
  amount: number
  cashback?: number
  currency: CurrencyType
  date: Date
  addr?: string
  index: number
  icon: string
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: color.primary,
  },

  buttonContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },

  cashback: {
    fontSize: 12,
  },

  flex: {
    flex: 1,
  },

  fundingText: {
    color: color.primary,
    fontSize: 16,
    paddingVertical: 20,
    textAlign: "center",
    textDecorationLine: "underline",
  },

  headerSection: {
    backgroundColor: palette.white,
    color: color.text,
    fontSize: 18,
    padding: 22,
  },

  horizontal: {
    flexDirection: "row",
  },

  icon: {
    marginRight: 24,
    textAlign: "center",
    width: 32,
  },

  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 24,
    marginVertical: 12,
  },

  itemText: {
    color: color.text,
    fontSize: 18,
  },

  text: {
    color: palette.darkGrey,
    fontSize: 16,
    marginBottom: 10,
    marginHorizontal: 20,
    textAlign: "center",
  },

  vertical: {
    flexDirection: "column",
  },

  viewModal: {
    alignItems: "center",
    backgroundColor: palette.white,
    height: 250,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
})

export const ChannelScreen: React.FC<AccountDetailItemProps> = (props) => {
  return (
    <Screen>
      <View key={props.index} style={styles.itemContainer}>
        <Icon name={props.icon} style={styles.icon} color={color.primary} size={28} />
        <View style={styles.flex}>
          <Text style={styles.itemText}>Titi</Text>
        </View>
      </View>
    </Screen>
  )
}
