import { gql, useReactiveVar } from "@apollo/client"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar } from "../../graphql/client-only-query"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { toastShow } from "../../utils/toast"

import {
  TransactionFragment,
  useTransactionListForContactQuery,
} from "@app/graphql/generated"
import { SectionTransactions } from "../transaction-screen/index.d"

const styles = EStyleSheet.create({
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
    flex: 1,
    backgroundColor: palette.lighterGrey,
    borderRadius: "10rem",
    borderColor: palette.lightGrey,
    borderWidth: 2,
    overflow: "hidden",
  },

  contactTransactionListContainer: {},
  sectionHeaderContainer: {
    backgroundColor: palette.lighterGrey,
    color: palette.darkGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },

  sectionHeaderText: {
    color: palette.darkGrey,
    fontSize: 18,
  },
})

gql`
  query transactionListForContact(
    $username: Username!
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      contactByUsername(username: $username) {
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }
`

const isToday = (tx: TransactionFragment) => sameDay(tx.createdAt, new Date())

const isYesterday = (tx: TransactionFragment) =>
  sameDay(tx.createdAt, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx: TransactionFragment) => sameMonth(tx.createdAt, new Date())

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  contactUsername: string
}

export const ContactTransactionsDataInjected = ({
  navigation,
  contactUsername,
}: Props) => {
  const { LL } = useI18nContext()
  const { error, data, fetchMore } = useTransactionListForContactQuery({
    variables: { username: contactUsername },
  })
  const prefCurrency = useReactiveVar(prefCurrencyVar)

  if (error) {
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return <></>
  }

  const transactions = data?.me?.contactByUsername?.transactions

  if (!transactions) {
    return <></>
  }

  const txs = transactions?.edges?.map((edge) => edge.node) ?? []
  const pageInfo = transactions?.pageInfo

  const fetchNextTransactionsPage = () => {
    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          username: contactUsername,
          after: pageInfo.endCursor,
        },
      })
    }
  }

  const sections: SectionTransactions[] = []
  const today: TransactionFragment[] = []
  const yesterday: TransactionFragment[] = []
  const thisMonth: TransactionFragment[] = []
  const before: TransactionFragment[] = []

  for (const tx of txs) {
    if (isToday(tx) || tx.status === "PENDING") {
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
    sections.push({ title: LL.PriceScreen.today(), data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: LL.PriceScreen.yesterday(), data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: LL.PriceScreen.thisMonth(), data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: LL.PriceScreen.prevMonths(), data: before })
  }

  return (
    <ContactTransactions
      navigation={navigation}
      prefCurrency={prefCurrency}
      nextPrefCurrency={nextPrefCurrency}
      sections={sections}
      fetchNextTransactionsPage={fetchNextTransactionsPage}
    />
  )
}

type ContactTransactionsProps = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  prefCurrency: string
  nextPrefCurrency: () => void
  sections: SectionTransactions[]
  fetchNextTransactionsPage: () => void
}

export const ContactTransactions: React.FC<ContactTransactionsProps> = ({
  navigation,
  prefCurrency,
  nextPrefCurrency,
  sections,
  fetchNextTransactionsPage,
}) => {
  const { LL } = useI18nContext()

  return (
    <View style={styles.screen}>
      <SectionList
        style={styles.contactTransactionListContainer}
        renderItem={({ item }) => (
          <TransactionItem key={`txn-${item.id}`} navigation={navigation} tx={item} />
        )}
        initialNumToRender={20}
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
              {LL.TransactionScreen.noTransaction()}
            </Text>
          </View>
        }
        sections={sections}
        keyExtractor={(item) => item.id}
        onEndReached={fetchNextTransactionsPage}
        onEndReachedThreshold={0.5}
      />
    </View>
  )
}
