import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { StackNavigationProp } from "@react-navigation/stack"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { useApolloClient } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"

// components
import { AppUpdate } from "@app/components/app-update/app-update"
import { icons } from "@app/components/atomic/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { SetDefaultAccountModal } from "@app/components/set-default-account-modal"
import { UnVerifiedSeedModal } from "@app/components/unverified-seed-modal"
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
import { getDefaultWallet } from "@app/graphql/wallets-utils"

// utils
import { testProps } from "../../utils/testProps"
import { addDeviceToken, requestNotificationPermission } from "@app/utils/notifications"

// breez
import { Payment } from "@breeztech/react-native-breez-sdk"
import { formatPaymentsBreezSDK } from "@app/hooks/useBreezPayments"
import {
  breezSDKInitialized,
  listPaymentsBreezSDK,
  paymentEvents,
} from "@app/utils/breez-sdk"
import { toBtcMoneyAmount } from "@app/types/amounts"

// hooks
import { useAppConfig, useBreez, usePriceConversion, useRedeem } from "@app/hooks"
import useNostrProfile from "@app/hooks/use-nostr-profile"

// store
import { useAppDispatch } from "@app/store/redux"
import { setUserData } from "@app/store/redux/slices/userSlice"
import { usePersistentStateContext } from "@app/store/persistent-state"

const TransactionCountToTriggerSetDefaultAccountModal = 1

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isFocused = useIsFocused()
  const client = useApolloClient()
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
  const { btcWallet, refreshBreez } = useBreez()
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

  const { persistentState, updateState } = usePersistentStateContext()
  const [defaultAccountModalVisible, setDefaultAccountModalVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [breezTransactions, setBreezTransactions] = useState<Payment[]>([])
  const [mergedTransactions, setMergedTransactions] = useState<TransactionFragment[]>(
    persistentState?.mergedTransactions || [],
  )
  const [breezTxsLoading, setBreezTxsLoading] = useState(false)
  const [refreshTriggered, setRefreshTriggered] = useState(false)
  const [isUnverifiedSeedModalVisible, setIsUnverifiedSeedModalVisible] = useState(false)

  const isBalanceVisible = hideBalance ?? false
  const transactionsEdges = dataAuthed?.me?.defaultAccount?.transactions?.edges ?? []
  const numberOfTxs = dataAuthed?.me?.defaultAccount?.transactions?.edges?.length ?? 0

  const pulseAnim = useRef(new Animated.Value(1)).current // Initial scale value

  const helpTriggered = persistentState?.helpTriggered ?? false

  // notification permission
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isAuthed && isFocused && client) {
      const WAIT_TIME_TO_PROMPT_USER = 5000
      timeout = setTimeout(
        async () => {
          const result = await requestNotificationPermission()
          if (
            result === messaging.AuthorizationStatus.PROVISIONAL ||
            result === messaging.AuthorizationStatus.AUTHORIZED
          ) {
            await addDeviceToken(client)
          }
        }, // no op if already requested
        WAIT_TIME_TO_PROMPT_USER,
      )
    }
    return () => timeout && clearTimeout(timeout)
  }, [isAuthed, isFocused, client])

  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1, // Scale up
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, // Scale down
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }

    pulse()
  }, [pulseAnim])

  const handleHelpPress = () => {
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          helpTriggered: true,
        }
      return undefined
    })
    navigation.navigate("welcomeFirst")
  }

  useEffect(() => {
    if (breezSDKInitialized && persistentState.isAdvanceMode) {
      fetchPaymentsBreez()
      paymentEvents.once("invoicePaid", fetchPaymentsBreez)
      paymentEvents.once("paymentSuccess", fetchPaymentsBreez)

      return () => {
        paymentEvents.off("invoicePaid", fetchPaymentsBreez)
        paymentEvents.off("paymentSuccess", fetchPaymentsBreez)
      }
    }
  }, [breezSDKInitialized, persistentState.btcWalletImported])

  useEffect(() => {
    if (!loadingAuthed && !breezTxsLoading) {
      mergeTransactions(breezTransactions)
    }
  }, [
    dataAuthed?.me?.defaultAccount?.transactions?.edges,
    breezTransactions,
    loadingAuthed,
    breezTxsLoading,
  ])

  useEffect(() => {
    if (dataAuthed?.me) {
      dispatch(setUserData(dataAuthed.me))
      saveDefaultWallet()
    }
  }, [dataAuthed?.me?.username])

  useEffect(() => {
    setIsContentVisible(isBalanceVisible)
  }, [isBalanceVisible])

  const saveDefaultWallet = () => {
    if (!persistentState.defaultWallet) {
      const defaultWallet = getDefaultWallet(
        dataAuthed?.me?.defaultAccount?.wallets,
        dataAuthed?.me?.defaultAccount?.defaultWalletId,
      )
      updateState((state: any) => {
        if (state)
          return {
            ...state,
            defaultWallet,
          }
        return undefined
      })
    }
  }

  const updateMergedTransactions = (txs: TransactionFragment[]) => {
    if (txs.length > 0) {
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

      if (persistentState.isAdvanceMode && breezSDKInitialized) {
        fetchPaymentsBreez()
        checkInProgressSwap()
      }

      setRefreshTriggered(true)
      setTimeout(() => setRefreshTriggered(false), 1000)
    }
  }, [isAuthed, refetchAuthed, refetchRealtimePrice, refetchUnauthed])

  const onMenuClick = (target: Target) => {
    if (!isAuthed) {
      setModalVisible(true)
    } else {
      if (
        target === "receiveBitcoin" &&
        !hasPromptedSetDefaultAccount &&
        persistentState.isAdvanceMode
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
    | "USDTransactionHistory"
  type IconNamesType = keyof typeof icons

  const buttons = [
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

  if (persistentState.isAdvanceMode) {
    buttons.unshift({
      title: LL.ConversionDetailsScreen.title(),
      target: "conversionDetails" as Target,
      icon: "transfer" as IconNamesType,
    })
  }

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
      <UnVerifiedSeedModal
        isVisible={isUnverifiedSeedModalVisible}
        setIsVisible={setIsUnverifiedSeedModalVisible}
      />
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
          loading={false}
          breezBalance={btcWallet?.balance || 0}
        />
        {/* Help Icon */}
        {!helpTriggered && (
          <View style={styles.helpIconContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity onPress={handleHelpPress}>
                <Icon name="help-circle-outline" size={30} color={colors.primary} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
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
            refreshing={refreshTriggered}
            onRefresh={refetch}
            colors={[colors.primary]} // Android refresh indicator colors
            tintColor={colors.primary} // iOS refresh indicator color
          />
        }
      >
        <WalletOverview
          refreshTriggered={refreshTriggered}
          isContentVisible={isContentVisible}
          setIsContentVisible={setIsContentVisible}
          loading={false}
          breezBalance={btcWallet?.balance || 0}
          pendingBalance={
            pendingSwap && pendingSwap?.channelOpeningFees
              ? pendingSwap?.unconfirmedSats -
                pendingSwap?.channelOpeningFees?.minMsat / 1000
              : null
          }
          setIsUnverifiedSeedModalVisible={setIsUnverifiedSeedModalVisible}
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

        {mergedTransactions.length > 0 ? (
          <>
            <TouchableWithoutFeedback
              style={styles.recentTransaction}
              onPress={() =>
                onMenuClick(
                  persistentState.isAdvanceMode
                    ? "TransactionHistoryTabs"
                    : "USDTransactionHistory",
                )
              }
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
        ) : (
          <ActivityIndicator
            animating={breezTxsLoading || loadingAuthed}
            size="large"
            color={colors.primary}
          />
        )}
        <AppUpdate />
        <SetDefaultAccountModal
          isVisible={defaultAccountModalVisible}
          toggleModal={() => setDefaultAccountModalVisible(!defaultAccountModalVisible)}
          transactionLength={breezTransactions.length}
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
  helpIconContainer: {
    position: "absolute",
    // bottom: 20, // Adjust as needed to place above the Tab navigation
    right: "15%", // Adjust as needed for positioning
    alignItems: "center",
    justifyContent: "center",
  },
}))
