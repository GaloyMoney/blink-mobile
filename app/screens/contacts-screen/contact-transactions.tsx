import { ApolloError, useReactiveVar } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar } from "../../graphql/client-only-query"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { ScreenType } from '@app/types/jsx'
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"

import {  ExchangeCurrencyUnit, TxDirection, TxStatus, useTransactionListForContactQuery, WalletCurrency } from "@app/graphql/generated"
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

const isToday = (tx) => sameDay(tx.createdAt, new Date())

const isYesterday = (tx) =>
  sameDay(tx.createdAt, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx) => sameMonth(tx.createdAt, new Date())

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  contactUsername: string
}

const TRANSACTIONS_PER_PAGE = 20


type QueryTransactionEdge = {
  readonly __typename: "TransactionEdge"
  readonly cursor: string
  readonly node: {
    readonly __typename: "Transaction"
    readonly id: string
    readonly status: TxStatus
    readonly direction: TxDirection
    readonly memo?: string | null
    readonly createdAt: number
    readonly settlementAmount: number
    readonly settlementFee: number
    readonly settlementCurrency: WalletCurrency
    readonly settlementPrice: {
      readonly __typename: "Price"
      readonly base: number
      readonly offset: number
      readonly currencyUnit: ExchangeCurrencyUnit
      readonly formattedAmount: string
    }
    readonly initiationVia:
      | {
          readonly __typename: "InitiationViaIntraLedger"
          readonly counterPartyWalletId?: string | null
          readonly counterPartyUsername?: string | null
        }
      | { readonly __typename: "InitiationViaLn"; readonly paymentHash: string }
      | { readonly __typename: "InitiationViaOnChain"; readonly address: string }
    readonly settlementVia:
      | {
          readonly __typename: "SettlementViaIntraLedger"
          readonly counterPartyWalletId?: string | null
          readonly counterPartyUsername?: string | null
        }
      | {
          readonly __typename: "SettlementViaLn"
          readonly paymentSecret?: string | null
        }
      | {
          readonly __typename: "SettlementViaOnChain"
          readonly transactionHash: string
        }
  }
}

export const ContactTransactionsDataInjected = ({
  navigation,
  contactUsername,
}: Props) => {
  const { LL } = useI18nContext()
  const currency = "sat" // FIXME

  const { error, data, refetch } = useTransactionListForContactQuery({
    variables: { username: contactUsername, first: TRANSACTIONS_PER_PAGE, after: null },
  })

  const prefCurrency = useReactiveVar(prefCurrencyVar)

  // The source of truth for listing the transactions
  // The data gets "cached" here and more pages are appended when they're fetched (through useQuery)
  const transactionsRef = React.useRef<QueryTransactionEdge[]>([])

  if (error) {
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return null
  }

  if (!data?.me?.contactByUsername?.transactions?.edges) {
    return null
  }

  const transactionEdges = data.me.contactByUsername.transactions.edges
  const lastDataCursor =
    transactionEdges.length > 0
      ? transactionEdges[transactionEdges.length - 1].cursor
      : null
  let lastSeenCursor =
    transactionsRef.current.length > 0
      ? transactionsRef.current[transactionsRef.current.length - 1].cursor
      : null

  // Add page of data to the source of truth if the data is new
  if (lastSeenCursor !== lastDataCursor) {
    transactionsRef.current = transactionsRef.current.concat(transactionEdges)
    lastSeenCursor = lastDataCursor
  }

  const fetchNextTransactionsPage = () => {
    refetch({ first: TRANSACTIONS_PER_PAGE, after: lastSeenCursor })
  }

  const sections: {
    data: QueryTransactionEdge["node"][]
    title: LocalizedString
  }[] = []
  const today: QueryTransactionEdge["node"][] = []
  const yesterday: QueryTransactionEdge["node"][] = []
  const thisMonth: QueryTransactionEdge["node"][] = []
  const before: QueryTransactionEdge["node"][] = []

  for (const txEdge of transactionsRef.current) {
    const tx = txEdge.node
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
  navigation: StackNavigationProp<RootStackParamList, "contactDetail">
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
