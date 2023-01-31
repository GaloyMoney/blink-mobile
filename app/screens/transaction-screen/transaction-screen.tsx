import { gql, useReactiveVar } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { ActivityIndicator, SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar } from "../../graphql/client-only-query"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  TransactionFragment,
  useTransactionListForDefaultAccountQuery,
} from "@app/graphql/generated"
import { SectionTransactions } from "./index.d"

const styles = EStyleSheet.create({
  icon: { color: palette.darkGrey, top: -4 },

  loadingContainer: { justifyContent: "center", alignItems: "center", flex: 1 },
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
    paddingHorizontal: "18rem",
    backgroundColor: palette.lighterGrey,
  },
  sectionHeaderContainer: {
    color: palette.darkGrey,
    backgroundColor: palette.lighterGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
  },

  sectionHeaderText: {
    color: palette.darkGrey,
    fontSize: 18,
  },
})

const isToday = (tx: TransactionFragment) => sameDay(tx.createdAt, new Date())

const isYesterday = (tx: TransactionFragment) =>
  sameDay(tx.createdAt, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx: TransactionFragment) => sameMonth(tx.createdAt, new Date())

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
}

gql`
  query transactionListForDefaultAccount(
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      defaultAccount {
        id
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }
`

export const TransactionHistoryScreenDataInjected: React.FC<Props> = ({ navigation }) => {
  const { LL } = useI18nContext()
  const { data, error, fetchMore, refetch, loading } =
    useTransactionListForDefaultAccountQuery()
  const prefCurrency = useReactiveVar(prefCurrencyVar)

  if (error) {
    console.error(error)
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return <></>
  }

  const transactions = data?.me?.defaultAccount?.transactions

  if (!transactions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={palette.coolGrey} size={"large"} />
      </View>
    )
  }

  const txs = transactions?.edges?.map((edge) => edge.node) ?? []
  const pageInfo = transactions?.pageInfo

  const fetchNextTransactionsPage = () => {
    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
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
    <TransactionScreen
      navigation={navigation}
      prefCurrency={prefCurrency}
      nextPrefCurrency={nextPrefCurrency}
      sections={sections}
      fetchNextTransactionsPage={fetchNextTransactionsPage}
      loading={loading}
      refetch={refetch}
    />
  )
}

type TransactionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  prefCurrency: string
  nextPrefCurrency: () => void
  sections: SectionTransactions[]
  fetchNextTransactionsPage: () => void
  loading: boolean
  refetch: () => void
}

export const TransactionScreen: React.FC<TransactionScreenProps> = ({
  navigation,
  prefCurrency,
  nextPrefCurrency,
  sections,
  fetchNextTransactionsPage,
  loading,
  refetch,
}) => {
  const { LL } = useI18nContext()
  return (
    <View style={styles.screen}>
      <SectionList
        showsVerticalScrollIndicator={false}
        style={styles.transactionGroup}
        renderItem={({ item, index, section }) => (
          <TransactionItem
            key={`txn-${item.id}`}
            isFirst={index === 0}
            isLast={index === section.data.length - 1}
            navigation={navigation}
            tx={item}
            subtitle
          />
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
        onRefresh={refetch}
        refreshing={loading}
      />
    </View>
  )
}
