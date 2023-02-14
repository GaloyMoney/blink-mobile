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
import { toastShow } from "../../utils/toast"

import { useTransactionListForContactQuery } from "@app/graphql/generated"
import { groupTransactionsByDate } from "@app/graphql/transactions"
import { SectionTransactions } from "../transaction-screen/index.d"
import { useIsAuthed } from "@app/graphql/is-authed-context"

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

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  contactUsername: string
}

export const ContactTransactionsDataInjected = ({
  navigation,
  contactUsername,
}: Props) => {
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const { error, data, fetchMore } = useTransactionListForContactQuery({
    variables: { username: contactUsername },
    skip: !isAuthed,
  })
  const prefCurrency = useReactiveVar(prefCurrencyVar)

  const transactions = data?.me?.contactByUsername?.transactions

  const sections = React.useMemo(
    () =>
      groupTransactionsByDate({
        txs: transactions?.edges?.map((edge) => edge.node) ?? [],
        priceScreen: LL.PriceScreen,
      }),
    [transactions, LL],
  )

  if (error) {
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return <></>
  }

  if (!transactions) {
    return <></>
  }

  const fetchNextTransactionsPage = () => {
    const pageInfo = transactions?.pageInfo

    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          username: contactUsername,
          after: pageInfo.endCursor,
        },
      })
    }
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
