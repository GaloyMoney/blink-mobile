import { ApolloError, useQuery, useReactiveVar } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import find from "lodash.find"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { WALLET } from "../../graphql/query"
import { nextPrefCurrency, prefCurrencyVar } from "../../graphql/client-only-query"
import { translate } from "../../i18n"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"

const styles = EStyleSheet.create({
  errorText: { alignSelf: "center", color: palette.red, paddingBottom: 18 },

  icon: { top: -4 },

  noTransactionText: {
    fontSize: "24rem",
  },

  noTransactionView: {
    alignItems: "center",
    flex: 1,
    marginVertical: "48rem",
  },

  row: {
    flexDirection: "row",
  },

  screen: {
    backgroundColor: palette.white,
  },

  sectionHeaderContainer: {
    backgroundColor: palette.white,
    color: palette.darkGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 22,
  },

  sectionHeaderText: {
    color: palette.darkGrey,
    fontSize: 18,
  },
})

const isToday = (tx) => sameDay(tx.date, new Date())

const isYesterday = (tx) => sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx) => sameMonth(tx.date, new Date())

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
}

export const TransactionHistoryScreenDataInjected: ScreenType = ({
  navigation,
}: Props) => {
  const currency = "sat" // FIXME

  const { data } = useQuery(WALLET, { fetchPolicy: "cache-only" })

  const sections = []
  const today = []
  const yesterday = []
  const thisMonth = []
  const before = []

  // we need a shallow copy because the array given by useQuery is otherwise immutable
  const transactions = [...find(data.wallet, { id: "BTC" }).transactions]

  while (transactions?.length) {
    // FIXME: optimization need. slow when there are a lot of txs.
    const tx = transactions.shift()

    if (isToday(tx)) {
      today.push(tx)
    } else if (isYesterday(tx)) {
      yesterday.push(tx)
    } else if (isThisMonth(tx)) {
      thisMonth.push(tx)
    } else {
      before.push(tx)
    }
  }

  if (today.length > 0) {
    sections.push({ title: translate("PriceScreen.today"), data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: translate("PriceScreen.yesterday"), data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: translate("PriceScreen.thisMonth"), data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: translate("PriceScreen.prevMonths"), data: before })
  }

  const prefCurrency = useReactiveVar(prefCurrencyVar)

  return (
    <TransactionScreen
      navigation={navigation}
      currency={currency}
      // refreshing={loading}
      // error={error}
      prefCurrency={prefCurrency}
      nextPrefCurrency={nextPrefCurrency}
      // onRefresh={refreshQuery}
      sections={sections}
    />
  )
}

type TransactionScreenProps = {
  refreshing: boolean
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  onRefresh: () => void
  error: ApolloError
  prefCurrency: string
  nextPrefCurrency: () => void
  sections: []
}

export const TransactionScreen: ScreenType = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refreshing,
  navigation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRefresh,
  error,
  prefCurrency,
  nextPrefCurrency,
  sections,
}: TransactionScreenProps) => (
  <Screen style={styles.screen}>
    <SectionList
      // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item, index }) => (
        <TransactionItem key={`txn-${index}`} navigation={navigation} tx={item} />
      )}
      ListHeaderComponent={() => (
        <>
          {error?.graphQLErrors?.map(({ message }, item) => (
            <Text key={`error-${item}`} style={styles.errorText} selectable>
              {message}
            </Text>
          ))}
        </>
      )}
      initialNumToRender={18}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <TouchableOpacity style={styles.row} onPress={nextPrefCurrency}>
            <Text style={styles.sectionHeaderText}>
              {prefCurrency === "BTC" ? "sats" : prefCurrency}{" "}
            </Text>
            <Icon name="ios-swap-vertical" size={32} style={styles.icon} />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.noTransactionView}>
          <Text style={styles.noTransactionText}>
            {translate("TransactionScreen.noTransaction")}
          </Text>
        </View>
      }
      sections={sections}
      keyExtractor={(item, index) => item + index}
    />
  </Screen>
)
