import { ApolloError, gql, useReactiveVar } from "@apollo/client"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ScreenType } from "@app/types/jsx"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar } from "../../graphql/client-only-query"
import type {
  ContactStackParamList,
  RootStackParamList,
} from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { toastShow } from "../../utils/toast"

import {
  TransactionFragment,
  useTransactionListForContactQuery,
} from "@app/graphql/generated"
import { LocalizedString } from "typesafe-i18n"

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

const isToday = (tx) => sameDay(tx.createdAt, new Date())

const isYesterday = (tx) =>
  sameDay(tx.createdAt, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx) => sameMonth(tx.createdAt, new Date())

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  contactUsername: string
}

export const ContactTransactionsDataInjected = ({
  navigation,
  contactUsername,
}: Props) => {
  const currency = "sat" // FIXME
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

  const sections: {
    data: TransactionFragment[]
    title: LocalizedString
  }[] = []
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
      currency={currency}
      prefCurrency={prefCurrency}
      nextPrefCurrency={nextPrefCurrency}
      sections={sections}
      fetchNextTransactionsPage={fetchNextTransactionsPage}
    />
  )
}

type ContactTransactionsProps = {
  refreshing: boolean
  navigation: StackNavigationProp<ContactStackParamList, "contactDetail">
  onRefresh: () => void
  error: ApolloError
  prefCurrency: string
  nextPrefCurrency: () => void
  sections: []
  fetchNextTransactionsPage: () => void
}

export const ContactTransactions: ScreenType = ({
  navigation,
  error,
  prefCurrency,
  nextPrefCurrency,
  sections,
  fetchNextTransactionsPage,
}: ContactTransactionsProps) => {
  const { LL } = useI18nContext()

  return (
    <View style={styles.screen}>
      <SectionList
        style={styles.contactTransactionListContainer}
        renderItem={({ item }) => (
          <TransactionItem key={`txn-${item.id}`} navigation={navigation} tx={item} />
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
        keyExtractor={(item, index) => item + index}
        onEndReached={fetchNextTransactionsPage}
        onEndReachedThreshold={0.5}
      />
    </View>
  )
}
