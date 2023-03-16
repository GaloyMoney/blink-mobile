import { gql } from "@apollo/client"
import { useTransactionListForDefaultAccountQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { groupTransactionsByDate } from "@app/graphql/transactions"
import { useI18nContext } from "@app/i18n/i18n-react"
import * as React from "react"
import { ActivityIndicator, SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TransactionItem } from "../../components/transaction-item"
import { palette } from "../../theme/palette"
import { toastShow } from "../../utils/toast"
import crashlytics from "@react-native-firebase/crashlytics"
import { useDarkMode } from "@app/hooks/use-darkmode"

const styles = EStyleSheet.create({
  loadingContainer: { justifyContent: "center", alignItems: "center", flex: 1 },
  noTransactionText: {
    fontSize: "24rem",
  },

  noTransactionView: {
    alignItems: "center",
    flex: 1,
    marginVertical: "48rem",
  },
  screenLight: {
    paddingHorizontal: "18rem",
  },
  screenDark: {
    paddingHorizontal: "18rem",
    backgroundColor: palette.black,
  },
  sectionHeaderContainerLight: {
    backgroundColor: palette.lighterGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
  },
  sectionHeaderContainerDark: {
    backgroundColor: palette.black,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
  },

  sectionHeaderTextLight: {
    color: palette.darkGrey,
    fontSize: 18,
  },
  sectionHeaderTextDark: {
    color: palette.white,
    fontSize: 18,
  },
})

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

export const TransactionHistoryScreen: React.FC = () => {
  const darkMode = useDarkMode()

  const { LL } = useI18nContext()
  const { data, error, fetchMore, refetch, loading } =
    useTransactionListForDefaultAccountQuery({ skip: !useIsAuthed() })

  const transactions = data?.me?.defaultAccount?.transactions

  const sections = React.useMemo(
    () =>
      groupTransactionsByDate({
        txs: transactions?.edges?.map((edge) => edge.node) ?? [],
        PriceHistoryScreen: LL.PriceHistoryScreen,
      }),
    [transactions, LL],
  )

  if (error) {
    console.error(error)
    crashlytics().recordError(error)
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return <></>
  }

  if (!transactions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={palette.coolGrey} size={"large"} />
      </View>
    )
  }

  const fetchNextTransactionsPage = () => {
    const pageInfo = transactions?.pageInfo

    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
      })
    }
  }

  return (
    <View style={darkMode ? styles.screenDark : styles.screenLight}>
      <SectionList
        showsVerticalScrollIndicator={false}
        style={styles.transactionGroup}
        renderItem={({ item, index, section }) => (
          <TransactionItem
            key={`txn-${item.id}`}
            isFirst={index === 0}
            isLast={index === section.data.length - 1}
            txid={item.id}
            subtitle
          />
        )}
        initialNumToRender={20}
        renderSectionHeader={({ section: { title } }) => (
          <View
            style={
              darkMode
                ? styles.sectionHeaderContainerDark
                : styles.sectionHeaderContainerLight
            }
          >
            <Text
              style={
                darkMode ? styles.sectionHeaderTextDark : styles.sectionHeaderTextLight
              }
            >
              {title}
            </Text>
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
