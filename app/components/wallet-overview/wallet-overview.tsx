import React, { useCallback, useEffect, useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Pressable, View } from "react-native"

import { useWalletOverviewScreenQuery, WalletCurrency } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
import { makeStyles, Text, useTheme } from "@rneui/themed"

import { GaloyCurrencyBubble } from "../atomic/galoy-currency-bubble"
import { GaloyIcon } from "../atomic/galoy-icon"
import HideableArea from "../hideable-area/hideable-area"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "@app/utils/testProps"
import { getUsdWallet } from "@app/graphql/wallets-utils"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useAppSelector } from "@app/store/redux"
import { loadJson, save } from "@app/utils/storage"
import moment from "moment"
import { useAppConfig } from "@app/hooks"
import { getLightningAddress } from "@app/utils/pay-links"

const Loader = () => {
  const styles = useStyles()
  return (
    <View style={styles.loaderContainer}>
      <ContentLoader
        height={45}
        width={"60%"}
        speed={1.2}
        backgroundColor={styles.loaderBackground.color}
        foregroundColor={styles.loaderForefound.color}
      >
        <Rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
      </ContentLoader>
    </View>
  )
}

type Props = {
  refreshTriggered: boolean
  loading: boolean
  isContentVisible: boolean
  setIsContentVisible: React.Dispatch<React.SetStateAction<boolean>>
  breezBalance: number | null
  pendingBalance: number | null
  setIsUnverifiedSeedModalVisible: (value: boolean) => void
}

const WalletOverview: React.FC<Props> = ({
  refreshTriggered,
  loading,
  isContentVisible,
  setIsContentVisible,
  breezBalance,
  pendingBalance,
  setIsUnverifiedSeedModalVisible,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { userData } = useAppSelector((state) => state.user)
  const { isAdvanceMode } = useAppSelector((state) => state.settings)

  const { LL } = useI18nContext()
  const { appConfig } = useAppConfig()
  const { theme } = useTheme()
  const isAuthed = useIsAuthed()
  const styles = useStyles()
  const colors = theme.colors

  const { persistentState, updateState } = usePersistentStateContext()
  const { formatMoneyAmount, displayCurrency, moneyAmountToDisplayCurrencyString } =
    useDisplayCurrency()

  const { data, error } = useWalletOverviewScreenQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const [btcBalance, setBtcBalance] = useState<string | undefined>(
    persistentState?.btcBalance || "0",
  )
  const [usdBalance, setUsdBalance] = useState<string | undefined>(
    persistentState?.usdBalance || "0",
  )
  const [convertedBtcBalance, setConvertedBtcBalance] = useState<string | undefined>(
    persistentState?.convertedBtcBalance || undefined,
  )
  const [convertedUsdBalance, setConvertedUsdBalance] = useState<string | undefined>(
    persistentState?.convertedUsdBalance || undefined,
  )
  const [lastUpdated, setLastUpdated] = useState<Date>()
  const [backupIsCompleted, setBackupIsCompleted] = React.useState(false)

  useEffect(() => {
    if (
      persistentState.btcBalance !== btcBalance ||
      persistentState.usdBalance !== usdBalance ||
      persistentState.convertedBtcBalance !== convertedBtcBalance ||
      persistentState.convertedUsdBalance !== convertedUsdBalance
    ) {
      updateState((state) => {
        if (state)
          return {
            ...state,
            btcBalance,
            usdBalance,
            convertedBtcBalance,
            convertedUsdBalance,
          }
        return undefined
      })
    }
  }, [btcBalance, usdBalance, convertedBtcBalance, convertedUsdBalance])

  useEffect(() => {
    if (isAuthed) formatBalance()
  }, [
    isAuthed,
    data?.me?.defaultAccount?.wallets,
    pendingBalance,
    breezBalance,
    displayCurrency,
  ])

  useEffect(() => {
    if (!error && data?.me?.defaultAccount.wallets) {
      setLastUpdated(new Date())
      save("lastUpdated", new Date())
    } else {
      getLastUpdated()
    }
  }, [
    isAuthed,
    data?.me?.defaultAccount?.wallets,
    pendingBalance,
    breezBalance,
    error,
    refreshTriggered,
  ])

  const getLastUpdated = async () => {
    const res = await loadJson("lastUpdated")
    setLastUpdated(res)
  }

  useFocusEffect(
    useCallback(() => {
      checkBackupCompleted()
    }, []),
  )

  const checkBackupCompleted = async () => {
    const res = await loadJson("backupCompleted")
    setBackupIsCompleted(res)
  }

  const formatBalance = () => {
    const extBtcWalletBalance = toBtcMoneyAmount(
      pendingBalance ? pendingBalance : breezBalance ?? NaN,
    )

    setBtcBalance(
      moneyAmountToDisplayCurrencyString({
        moneyAmount: extBtcWalletBalance,
        isApproximate: true,
      }),
    )
    setConvertedBtcBalance(
      formatMoneyAmount({
        moneyAmount: extBtcWalletBalance,
      }),
    )

    if (data) {
      const extUsdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)
      const extUsdWalletBalance = toUsdMoneyAmount(extUsdWallet?.balance ?? NaN)

      setUsdBalance(
        moneyAmountToDisplayCurrencyString({
          moneyAmount: extUsdWalletBalance,
          isApproximate: displayCurrency !== WalletCurrency.Usd,
        }),
      )
      setConvertedUsdBalance(
        formatMoneyAmount({
          moneyAmount: extUsdWalletBalance,
        }),
      )
    }
  }

  const toggleIsContentVisible = () => {
    setIsContentVisible((prevState) => !prevState)
  }

  const navigateHandler = (activeTab: string) => {
    if (isAdvanceMode) {
      navigation.navigate("TransactionHistoryTabs", {
        initialRouteName: activeTab,
      })
    } else {
      navigation.navigate(activeTab as any)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.myAccounts}>
        <Text type="p1" bold {...testProps(LL.HomeScreen.myAccounts())}>
          {LL.HomeScreen.myAccounts()}
        </Text>
        <Pressable onPress={toggleIsContentVisible}>
          <GaloyIcon name={isContentVisible ? "eye" : "eye-slash"} size={24} />
        </Pressable>
      </View>
      {/* Start of IBEX Wallet overview */}
      <View style={styles.separator}></View>
      <Pressable onPress={() => navigateHandler("USDTransactionHistory")}>
        <View style={styles.displayTextView}>
          <View style={styles.currency}>
            <GaloyCurrencyBubble currency="USD" />
            <View>
              <Text type="p1">Cash (USD)</Text>
              {isAdvanceMode && Boolean(userData?.username) && (
                <Text type="p4" color={colors.grey1}>
                  {getLightningAddress(
                    appConfig.galoyInstance.lnAddressHostname,
                    userData.username,
                  )}
                </Text>
              )}
            </View>
          </View>
          {loading ? (
            <Loader />
          ) : (
            <View style={styles.hideableArea}>
              <HideableArea isContentVisible={isContentVisible}>
                <Text type="p1" bold>
                  {convertedUsdBalance}
                </Text>
                {displayCurrency !== WalletCurrency.Usd && (
                  <Text type={"p3"}>{usdBalance}</Text>
                )}
              </HideableArea>
            </View>
          )}
        </View>
      </Pressable>
      {/* End of IBEX Wallet overview */}
      {/* Start of Breez SDK Wallet overview */}
      {isAdvanceMode && (
        <>
          <View style={styles.separator}></View>
          <Pressable onPress={() => navigateHandler("BTCTransactionHistory")}>
            <View style={styles.displayTextView}>
              <View style={styles.currency}>
                <GaloyCurrencyBubble currency="BTC" />
                <Text type="p1">Bitcoin</Text>
                {!backupIsCompleted && (
                  <Pressable onPress={() => setIsUnverifiedSeedModalVisible(true)}>
                    <GaloyIcon color={colors.warning} name="warning" size={28} />
                  </Pressable>
                )}
              </View>
              {loading ? (
                <Loader />
              ) : (
                <View style={styles.hideableArea}>
                  <HideableArea isContentVisible={isContentVisible}>
                    {convertedBtcBalance ? (
                      <Text type="p1" bold color={pendingBalance ? "orange" : undefined}>
                        {convertedBtcBalance}
                      </Text>
                    ) : null}
                    <Text
                      type={convertedBtcBalance ? "p3" : "p1"}
                      bold={!convertedBtcBalance}
                      color={pendingBalance ? "orange" : undefined}
                    >
                      {btcBalance}
                    </Text>
                  </HideableArea>
                </View>
              )}
            </View>
          </Pressable>
        </>
      )}

      {/* End of Breez SDK Wallet overview */}
      <Text style={styles.lastUpdated}>
        Last refreshed: {moment(lastUpdated).format("lll")}
      </Text>
    </View>
  )
}

export default WalletOverview

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
  },
  loaderBackground: {
    color: colors.loaderBackground,
  },
  loaderForefound: {
    color: colors.loaderForeground,
  },
  myAccounts: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  displayTextView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 45,
    marginVertical: 4,
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.grey4,
    marginVertical: 2,
  },
  titleSeparator: {
    marginTop: 12,
  },
  currency: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  hideableArea: {
    alignItems: "flex-end",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    height: 45,
    marginTop: 5,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.grey1,
  },
}))
