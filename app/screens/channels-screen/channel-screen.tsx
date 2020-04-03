import * as React from "react"
import { useState, useEffect } from "react"
import { observer, inject } from "mobx-react"

import {
  View,
  SectionList,
  StyleSheet,
  RefreshControl,
  TouchableWithoutFeedback,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native"

import Modal from "react-native-modal"

import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"

import { BalanceHeader } from "../../components/balance-header"
import { DataStore } from "../../models/data-store"
import { sameDay, sameMonth } from "../../utils/date"
import { CurrencyText } from "../../components/currency-text"
import { TouchableHighlight, TextInput } from "react-native-gesture-handler"
import { AccountType, CurrencyType, FirstChannelStatus } from "../../utils/enum"
import { useNavigation } from '@react-navigation/native'
import { Button } from "react-native-elements"
import { palette } from "../../theme/palette"
import { Side, Onboarding } from "types"
import { translate } from "../../i18n"

import { shortenHash, showFundingTx } from "../../utils/helper"
import { SyncingComponent } from "../../components/syncing"

import functions from "@react-native-firebase/functions"
import { APP_EDUCATION } from "../../app"


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
  cashback: {
    fontSize: 12,
  },

  flex: {
    flex: 1,
  },

  headerSection: {
    fontSize: 18,
    color: color.text,
    padding: 22,
    backgroundColor: palette.white,
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

  vertical: {
    flexDirection: "column",
  },

  horizontal: {
    flexDirection: "row",
  },

  button: {
    backgroundColor: color.primary,
  },

  buttonContainer: {
    paddingHorizontal: 15,
    flex: 1,
  },

  viewModal: {
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    height: 250,
    backgroundColor: palette.white,
    alignItems: "center",
  },

  text: {
    marginHorizontal: 20,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 16,
    color: palette.darkGrey,
  },

  fundingText: {
    fontSize: 16,
    textAlign: "center",
    color: color.primary,
    paddingVertical: 20,
    textDecorationLine: "underline",
  },
})

export const ChannelScreen: React.FC<AccountDetailItemProps> = props => {

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
