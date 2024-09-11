import React, { useEffect, useState } from "react"
import { ActivityIndicator } from "react-native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// components
import { TransactionItem } from "../../components/transaction-item"
import { BreezTransactionItem } from "../../components/transaction-item/breez-transaction-item"

// hooks
import { usePersistentStateContext } from "@app/store/persistent-state"
import { formatPaymentsBreezSDK } from "@app/hooks/useBreezPayments"
import { useBreez, usePriceConversion } from "@app/hooks"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "@app/i18n/i18n-react"

// gql
import {
  TransactionEdge,
  TransactionFragment,
  WalletCurrency,
} from "@app/graphql/generated"

// utils
import { testProps } from "@app/utils/testProps"
import { toBtcMoneyAmount } from "@app/types/amounts"

// breez
import { breezSDKInitialized, listPaymentsBreezSDK } from "@app/utils/breez-sdk-liquid"
import {
  addEventListener,
  Payment,
  removeEventListener,
  SdkEvent,
  SdkEventVariant,
} from "@breeztech/react-native-breez-sdk-liquid"

type Props = {
  loadingAuthed: boolean
  transactionsEdges: TransactionEdge[]
  refreshTriggered: boolean
}

const Transactions: React.FC<Props> = ({
  loadingAuthed,
  transactionsEdges,
  refreshTriggered,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { colors } = useTheme().theme
  const { persistentState, updateState } = usePersistentStateContext()
  const { convertMoneyAmount } = usePriceConversion()
  const { refreshBreez } = useBreez()

  const [breezListenerId, setBreezListenerId] = useState<string>()
  const [breezTxsLoading, setBreezTxsLoading] = useState(false)
  const [breezTransactions, setBreezTransactions] = useState<Payment[]>([])
  const [mergedTransactions, setMergedTransactions] = useState<TransactionFragment[]>(
    persistentState?.mergedTransactions || [],
  )

  useEffect(() => {
    if (refreshTriggered || (persistentState.isAdvanceMode && breezSDKInitialized)) {
      fetchPaymentsBreez()
    }
  }, [
    refreshTriggered,
    breezSDKInitialized,
    persistentState.isAdvanceMode,
    persistentState.btcWalletImported,
  ])

  useEffect(() => {
    if (!loadingAuthed && !breezTxsLoading) {
      mergeTransactions(breezTransactions)
    }
  }, [transactionsEdges, breezTransactions, loadingAuthed, breezTxsLoading])

  useEffect(() => {
    if (persistentState.isAdvanceMode && breezSDKInitialized && !breezListenerId) {
      addBreezEventListener()
    } else if (!persistentState.isAdvanceMode) {
      setBreezTransactions([])
      setBreezListenerId(undefined)
    }
    return removeBreezEventListener
  }, [persistentState.isAdvanceMode, breezSDKInitialized, breezListenerId])

  const addBreezEventListener = async () => {
    const listenerId = await addEventListener((e: SdkEvent) => {
      if (e.type !== SdkEventVariant.SYNCED) {
        fetchPaymentsBreez()
      }
    })
    setBreezListenerId(listenerId)
  }

  const removeBreezEventListener = () => {
    if (breezListenerId) {
      removeEventListener(breezListenerId)
      setBreezListenerId(undefined)
    }
  }

  const fetchPaymentsBreez = async () => {
    setBreezTxsLoading(true)
    refreshBreez()
    const payments = await listPaymentsBreezSDK(0, 3)
    setBreezTransactions(payments)
    setBreezTxsLoading(false)
  }

  const mergeTransactions = async (breezTxs: Payment[]) => {
    const mergedTransactions: TransactionFragment[] = []
    const formattedBreezTxs = await formatBreezTransactions(breezTxs)

    let i = 0
    let j = 0
    while (transactionsEdges.length != i && formattedBreezTxs.length != j) {
      if (transactionsEdges[i].node?.createdAt > formattedBreezTxs[j]?.createdAt) {
        mergedTransactions.push(transactionsEdges[i].node)
        i++
      } else {
        mergedTransactions.push(formattedBreezTxs[j])
        j++
      }
    }

    while (transactionsEdges.length !== i) {
      mergedTransactions.push(transactionsEdges[i].node)
      i++
    }

    while (formattedBreezTxs.length !== j) {
      mergedTransactions.push(formattedBreezTxs[j])
      j++
    }

    updateMergedTransactions(mergedTransactions)
  }

  const formatBreezTransactions = async (txs: Payment[]) => {
    if (!convertMoneyAmount || !txs) {
      return []
    }
    const formattedTxs = txs?.map((edge) =>
      formatPaymentsBreezSDK(
        edge.txId,
        txs,
        convertMoneyAmount(toBtcMoneyAmount(edge.amountSat), WalletCurrency.Usd).amount,
      ),
    )

    return formattedTxs?.filter(Boolean) ?? []
  }

  const updateMergedTransactions = (txs: TransactionFragment[]) => {
    setMergedTransactions(txs.slice(0, 3))
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          mergedTransactions: txs.slice(0, 3),
        }
      return undefined
    })
  }

  const navigateToTransactionHistory = () => {
    navigation.navigate(
      persistentState.isAdvanceMode ? "TransactionHistoryTabs" : "USDTransactionHistory",
    )
  }

  if (mergedTransactions.length > 0) {
    return (
      <>
        <TouchableWithoutFeedback
          style={styles.recentTransaction}
          onPress={navigateToTransactionHistory}
        >
          <Text type="p1" bold {...testProps(LL.TransactionScreen.title())}>
            {LL.TransactionScreen.title()}
          </Text>
        </TouchableWithoutFeedback>
        {mergedTransactions.map((item, index) => {
          if (item.settlementCurrency === "BTC") {
            return (
              <BreezTransactionItem
                tx={item}
                key={`transaction-${item.id}`}
                subtitle
                isOnHomeScreen={true}
                isFirst={index === 0}
                isLast={index === mergedTransactions.length - 1}
              />
            )
            // eslint-disable-next-line no-else-return
          } else {
            return (
              <TransactionItem
                tx={item}
                key={`txn-${item.id}`}
                subtitle
                isOnHomeScreen={true}
                isFirst={index === 0}
                isLast={index === mergedTransactions.length - 1}
              />
            )
          }
        })}
      </>
    )
  } else {
    return (
      <ActivityIndicator
        animating={breezTxsLoading || loadingAuthed}
        size="large"
        color={colors.primary}
      />
    )
  }
}

export default Transactions

const useStyles = makeStyles(({ colors }) => ({
  recentTransaction: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 10,
    backgroundColor: colors.grey5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderColor: colors.grey5,
    borderBottomWidth: 2,
    paddingVertical: 14,
  },
}))
