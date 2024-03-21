import React, { useCallback, useEffect, useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { StackNavigationProp } from "@react-navigation/stack"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { RootStackParamList } from "../../navigation/stack-param-lists"

// components
import { AppUpdate } from "@app/components/app-update/app-update"
import { icons } from "@app/components/atomic/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { SetDefaultAccountModal } from "@app/components/set-default-account-modal"
import { BalanceHeader } from "../../components/balance-header"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { BreezTransactionItem } from "../../components/transaction-item/breez-transaction-item"

// queries
import {
  TransactionFragment,
  WalletCurrency,
  useHasPromptedSetDefaultAccountQuery,
  useHideBalanceQuery,
  useHomeAuthedQuery,
  useHomeUnauthedQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getErrorMessages } from "@app/graphql/utils"

// utils
import { testProps } from "../../utils/testProps"
import { isIos } from "@app/utils/helper"

// breez
import { Payment } from "@breeztech/react-native-breez-sdk"
import { formatPaymentsBreezSDK } from "@app/hooks/useBreezPayments"
import { breezSDKInitialized, listPaymentsBreezSDK } from "@app/utils/breez-sdk"
import { toBtcMoneyAmount } from "@app/types/amounts"
import useBreezBalance from "@app/hooks/useBreezBalance"

// hooks
import { useAppConfig, usePriceConversion, useRedeem } from "@app/hooks"
import useNostrProfile from "@app/hooks/use-nostr-profile"

// store
import { useAppDispatch } from "@app/store/redux"
import { setUserData } from "@app/store/redux/slices/userSlice"

const TransactionCountToTriggerSetDefaultAccountModal = 1

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const dispatch = useAppDispatch()
  const {
    appConfig: {
      galoyInstance: { id: galoyInstanceId },
    },
  } = useAppConfig()
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const isAuthed = useIsAuthed()
  const { LL } = useI18nContext()
  const { convertMoneyAmount } = usePriceConversion()
  const [breezBalance, refreshBreezBalance] = useBreezBalance()
  const { nostrSecretKey } = useNostrProfile()
  const { pendingSwap, checkInProgressSwap } = useRedeem()

  // queries
  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const { data: { hasPromptedSetDefaultAccount } = {} } =
    useHasPromptedSetDefaultAccountQuery()
  const {
    data: dataAuthed,
    loading: loadingAuthed,
    error,
    refetch: refetchAuthed,
  } = useHomeAuthedQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    errorPolicy: "all",
    nextFetchPolicy: "cache-and-network", // this enables offline mode use-case
  })
  const { loading: loadingPrice, refetch: refetchRealtimePrice } = useRealtimePriceQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-and-network", // this enables offline mode use-case
  })
  const {
    refetch: refetchUnauthed,
    loading: loadingUnauthed,
    data: dataUnauthed,
  } = useHomeUnauthedQuery()

  const [defaultAccountModalVisible, setDefaultAccountModalVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [breezTransactions, setBreezTransactions] = useState<Payment[]>([])
  const [mergedTransactions, setMergedTransactions] = useState<TransactionFragment[]>([])

  const isBalanceVisible = hideBalance ?? false
  const loading = (loadingAuthed || loadingPrice || loadingUnauthed) && isAuthed
  const transactionsEdges = dataAuthed?.me?.defaultAccount?.transactions?.edges ?? []
  const numberOfTxs = dataAuthed?.me?.defaultAccount?.transactions?.edges?.length ?? 0

  useEffect(() => {
    if (dataAuthed?.me) {
      dispatch(setUserData(dataAuthed.me))
    }
  }, [dataAuthed?.me])

  useEffect(() => {
    setIsContentVisible(isBalanceVisible)
  }, [isBalanceVisible])

  useFocusEffect(
    React.useCallback(() => {
      if (breezSDKInitialized) {
        fetchPaymentsBreez()
        refreshBreezBalance()
      }
    }, [breezSDKInitialized, loadingAuthed]),
  )

  const fetchPaymentsBreez = async () => {
    const payments = await listPaymentsBreezSDK()
    mergeTransactions(payments)

    setBreezTransactions(payments)
  }

  const mergeTransactions = async (breezTxs: Payment[]) => {
    const mergedTransactions = []

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

    setMergedTransactions(mergedTransactions.slice(0, 5))
  }

  const formatBreezTransactions = async (txs: Payment[]) => {
    if (!convertMoneyAmount || !txs) {
      return []
    }
    const formattedTxs = txs?.map((edge) =>
      formatPaymentsBreezSDK(
        edge.id,
        txs,
        convertMoneyAmount(toBtcMoneyAmount(edge.amountMsat / 1000), WalletCurrency.Usd)
          .amount,
      ),
    )

    return formattedTxs?.filter(Boolean) ?? []
  }

  const refetch = useCallback(() => {
    if (isAuthed) {
      refetchRealtimePrice()
      refetchAuthed()
      refetchUnauthed()
      fetchPaymentsBreez()
      checkInProgressSwap()
      refreshBreezBalance()
    }
  }, [isAuthed, refetchAuthed, refetchRealtimePrice, refetchUnauthed])

  const onMenuClick = (target: Target) => {
    if (!isAuthed) {
      setModalVisible(true)
    } else {
      if (
        target === "receiveBitcoin" &&
        !hasPromptedSetDefaultAccount &&
        numberOfTxs >= TransactionCountToTriggerSetDefaultAccountModal &&
        galoyInstanceId === "Main"
      ) {
        setDefaultAccountModalVisible(!defaultAccountModalVisible)
        return
      }

      // we are using any because Typescript complain on the fact we are not passing any params
      // but there is no need for a params and the types should not necessitate it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate(target as any, { transactionLength: breezTransactions.length })
    }
  }

  const activateWallet = () => {
    setModalVisible(false)
    // fixes a screen flash from closing the modal to opening the next screen
    navigation.reset({
      index: 0,
      routes: [{ name: "getStarted" }],
    })
  }

  type Target =
    | "scanningQRCode"
    | "sendBitcoinDestination"
    | "receiveBitcoin"
    | "TransactionHistoryTabs"
  type IconNamesType = keyof typeof icons

  const buttons = [
    {
      title: LL.ConversionDetailsScreen.title(),
      target: "conversionDetails" as Target,
      icon: "transfer" as IconNamesType,
    },
    {
      title: LL.HomeScreen.receive(),
      target: "receiveBitcoin" as Target,
      icon: "receive" as IconNamesType,
    },
    {
      title: LL.HomeScreen.send(),
      target: "sendBitcoinDestination" as Target,
      icon: "send" as IconNamesType,
    },
    {
      title: LL.HomeScreen.scan(),
      target: "scanningQRCode" as Target,
      icon: "qr-code" as IconNamesType,
    },
  ]

  const AccountCreationNeededModal = (
    <Modal
      style={styles.modal}
      isVisible={modalVisible}
      swipeDirection={modalVisible ? ["down"] : ["up"]}
      onSwipeComplete={() => setModalVisible(false)}
      animationOutTiming={1}
      swipeThreshold={50}
    >
      <View style={styles.flex}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.cover} />
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.viewModal}>
        <Icon name="remove" size={64} color={colors.grey3} style={styles.icon} />
        <Text type="h1">{LL.common.needWallet()}</Text>
        <View style={styles.openWalletContainer}>
          <GaloyPrimaryButton
            title={LL.GetStartedScreen.quickStart()}
            onPress={activateWallet}
          />
        </View>
        <View style={styles.flex} />
      </View>
    </Modal>
  )

  return (
    <Screen>
      {AccountCreationNeededModal}
      <View style={[styles.header, styles.container]}>
        <GaloyIconButton
          onPress={() => navigation.navigate("priceHistory")}
          size={"medium"}
          name="graph"
          iconOnly={true}
        />
        <BalanceHeader
          isContentVisible={isContentVisible}
          setIsContentVisible={setIsContentVisible}
          loading={loading}
          breezBalance={breezBalance}
        />
        <GaloyIconButton
          onPress={() => navigation.navigate("settings")}
          size={"medium"}
          name="menu"
          iconOnly={true}
        />
      </View>
      <ScrollView
        contentContainerStyle={[styles.scrollView, styles.container]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[colors.primary]} // Android refresh indicator colors
            tintColor={colors.primary} // iOS refresh indicator color
          />
        }
      >
        <WalletOverview
          isContentVisible={isContentVisible}
          setIsContentVisible={setIsContentVisible}
          loading={loading}
          breezBalance={breezBalance}
          pendingBalance={
            pendingSwap && pendingSwap?.channelOpeningFees
              ? pendingSwap?.unconfirmedSats -
                pendingSwap?.channelOpeningFees?.minMsat / 1000
              : null
          }
        />
        {error && (
          <View style={styles.marginButtonContainer}>
            <GaloyErrorBox errorMessage={getErrorMessages(error)} />
          </View>
        )}
        <View style={styles.listItemsContainer}>
          {buttons.map((item) => (
            <View key={item.icon} style={styles.button}>
              <GaloyIconButton
                name={item.icon}
                size="large"
                text={item.title}
                onPress={() => onMenuClick(item.target)}
              />
            </View>
          ))}
        </View>

        {mergedTransactions.length > 0 && !loadingAuthed ? (
          <>
            <TouchableWithoutFeedback
              style={styles.recentTransaction}
              onPress={() => onMenuClick("TransactionHistoryTabs")}
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
                    isLast={index === 4}
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
                    isLast={index === 4}
                  />
                )
              }
            })}
          </>
        ) : null}
        <AppUpdate />
        <SetDefaultAccountModal
          isVisible={defaultAccountModalVisible}
          toggleModal={() => setDefaultAccountModalVisible(!defaultAccountModalVisible)}
        />
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollView: {
    paddingBottom: 12,
  },
  listItemsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  noTransaction: {
    alignItems: "center",
  },
  icon: {
    height: 34,
    top: -22,
  },
  marginButtonContainer: {
    marginBottom: 20,
  },
  modal: {
    marginBottom: 0,
    marginHorizontal: 0,
  },
  flex: {
    flex: 1,
  },
  cover: {
    height: "100%",
    width: "100%",
  },
  viewModal: {
    alignItems: "center",
    backgroundColor: colors.white,
    height: "30%",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
  openWalletContainer: {
    alignSelf: "stretch",
    marginTop: 20,
  },
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
  button: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 74,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  error: {
    alignSelf: "center",
    color: colors.error,
  },
  container: {
    marginHorizontal: 20,
  },
}))
