import { gql } from "@apollo/client"
import { useI18nContext } from "@app/i18n/i18n-react"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import { TransactionItem } from "../../components/transaction-item"
import { palette } from "../../theme/palette"
import { toastShow } from "../../utils/toast"

import { useTransactionListForContactQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { groupTransactionsByDate } from "@app/graphql/transactions"
import { makeStyles } from "@rneui/themed"

const useStyles = makeStyles((theme) => ({
  noTransactionText: {
    fontSize: 24,
  },

  noTransactionView: {
    alignItems: "center",
    flex: 1,
    marginVertical: 48,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.lighterGreyOrBlack,
    borderRadius: 10,
    borderColor: theme.colors.grey10,
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
}))

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
  contactUsername: string
}

export const ContactTransactions = ({ contactUsername }: Props) => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const { error, data, fetchMore } = useTransactionListForContactQuery({
    variables: { username: contactUsername },
    skip: !isAuthed,
  })

  const transactions = data?.me?.contactByUsername?.transactions

  const sections = React.useMemo(
    () =>
      groupTransactionsByDate({
        txs: transactions?.edges?.map((edge) => edge.node) ?? [],
        PriceHistoryScreen: LL.PriceHistoryScreen,
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
    <View style={styles.screen}>
      <SectionList
        style={styles.contactTransactionListContainer}
        renderItem={({ item }) => (
          <TransactionItem key={`txn-${item.id}`} txid={item.id} />
        )}
        initialNumToRender={20}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
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
