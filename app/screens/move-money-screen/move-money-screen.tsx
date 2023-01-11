import { GaloyGQL } from "@app/graphql/generated/types"

import messaging from "@react-native-firebase/messaging"
import * as React from "react"
import { useEffect, useState } from "react"
import {
  AppState,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native"
import { Button } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { getBuildNumber } from "react-native-device-info"
import { BalanceHeader } from "../../components/balance-header"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { AccountType } from "../../utils/enum"
import { isIos } from "../../utils/helper"
import { ScreenType } from "../../types/jsx"
import useToken from "../../hooks/use-token"
import { StackNavigationProp } from "@react-navigation/stack"
import {
  PrimaryStackParamList,
  RootStackParamList,
} from "../../navigation/stack-param-lists"
import useMainQuery from "@app/hooks/use-main-query"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import QrCodeIcon from "@app/assets/icons/qr-code.svg"
import SendIcon from "@app/assets/icons/send.svg"
import ReceiveIcon from "@app/assets/icons/receive.svg"
import PriceIcon from "@app/assets/icons/price.svg"
import SettingsIcon from "@app/assets/icons/settings.svg"
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { CompositeNavigationProp, useIsFocused } from "@react-navigation/native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StableSatsModal } from "@app/components/stablesats-modal"
import { testProps } from "../../../utils/testProps"

const styles = EStyleSheet.create({
  bottom: {
    alignItems: "center",
    marginVertical: "16rem",
  },

  buttonContainerStyle: {
    marginTop: "16rem",
    width: "80%",
  },

  buttonStyle: {
    borderColor: color.primary,
    borderRadius: 32,
    borderWidth: 2,
  },

  topButton: {
    backgroundColor: palette.white,
    borderRadius: "38rem",
    width: "50rem",
    height: "50rem",
  },

  cover: { height: "100%", width: "100%" },

  divider: { flex: 1 },

  error: { alignSelf: "center", color: palette.red, paddingBottom: 18 },

  flex: {
    flex: 1,
  },

  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "15rem",
    marginHorizontal: "20rem",
    height: "120rem",
  },

  balanceHeaderContainer: { flex: 1, flexDirection: "column" },
  walletOverview: {
    marginBottom: "15rem",
  },

  icon: { height: 34, top: -22 },

  lightningText: {
    fontSize: "16rem",
    marginBottom: 12,
    textAlign: "center",
  },

  listContainer: {
    marginTop: "1rem",
  },

  modal: { marginBottom: 0, marginHorizontal: 0 },

  screenStyle: {
    backgroundColor: palette.lighterGrey,
  },

  text: {
    color: palette.darkGrey,
    fontSize: "20rem",
  },

  titleStyle: {
    color: color.primary,
    fontSize: "18rem",
    fontWeight: "bold",
  },

  transactionsView: {
    flex: 1,
    marginHorizontal: "30rem",
    borderTopLeftRadius: "12rem",
  },

  transactionViewButton: {
    borderTopLeftRadius: "12rem",
    borderTopRightRadius: "12rem",
    borderColor: palette.lighterGrey,
    borderBottomWidth: "2rem",
  },

  viewModal: {
    alignItems: "center",
    backgroundColor: palette.white,
    height: "25%",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
})

type MoveMoneyScreenDataInjectedProps = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<PrimaryStackParamList, "MoveMoney">,
    StackNavigationProp<RootStackParamList>
  >
}

export const MoveMoneyScreenDataInjected: ScreenType = ({
  navigation,
}: MoveMoneyScreenDataInjectedProps) => {
  const { hasToken } = useToken()
  const {
    mobileVersions,
    mergedTransactions,
    btcWalletBalance,
    btcWalletValueInUsd,
    usdWalletBalance,
    errors,
    loading: loadingMain,
    refetch,
    usdWalletId,
  } = useMainQuery()

  // temporary fix until we have a better management of notifications:
  // when coming back to active state. look if the invoice has been paid
  useEffect(() => {
    const _handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        // TODO: fine grain query
        // only refresh as necessary
        refetch()
      }
    }
    const subscription = AppState.addEventListener("change", _handleAppStateChange)
    return () => subscription.remove()
  }, [refetch])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (_remoteMessage) => {
      // TODO: fine grain query
      // only refresh as necessary
      refetch()
    })

    return unsubscribe
  }, [refetch])

  function isUpdateAvailableOrRequired(mobileVersions) {
    try {
      const minSupportedVersion = mobileVersions?.find(
        (mobileVersion) => mobileVersion?.platform === Platform.OS,
      ).minSupported
      const currentSupportedVersion = mobileVersions?.find(
        (mobileVersion) => mobileVersion?.platform === Platform.OS,
      ).currentSupported
      const buildNumber = Number(getBuildNumber())
      return {
        required: buildNumber < minSupportedVersion,
        available: buildNumber < currentSupportedVersion,
      }
    } catch (err) {
      return {
        // TODO: handle required upgrade
        required: false,
        available: false,
      }
    }
  }

  return (
    <MoveMoneyScreen
      navigation={navigation}
      loading={loadingMain}
      errors={errors}
      refetch={refetch}
      transactionsEdges={mergedTransactions}
      isUpdateAvailable={isUpdateAvailableOrRequired(mobileVersions).available}
      hasToken={hasToken}
      hasUsdWallet={usdWalletId !== undefined}
      usdWalletBalance={usdWalletBalance}
      btcWalletBalance={btcWalletBalance}
      btcWalletValueInUsd={btcWalletValueInUsd}
    />
  )
}

type MoveMoneyScreenProps = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<PrimaryStackParamList, "MoveMoney">,
    StackNavigationProp<RootStackParamList>
  >
  loading: boolean
  errors: []
  transactionsEdges: { cursor: string; node: GaloyGQL.Transaction | null }[]
  refetch: () => void
  isUpdateAvailable: boolean
  hasToken: boolean
  hasUsdWallet: boolean
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
}

export const MoveMoneyScreen: ScreenType = ({
  navigation,
  loading,
  errors,
  refetch,
  transactionsEdges,
  isUpdateAvailable,
  hasToken,
  hasUsdWallet,
  btcWalletBalance,
  btcWalletValueInUsd,
  usdWalletBalance,
}: MoveMoneyScreenProps) => {
  const [modalVisible, setModalVisible] = useState(false)
  const { LL } = useI18nContext()
  const isFocused = useIsFocused()
  const onMenuClick = (target) => {
    if (hasToken) {
      navigation.navigate(target)
    } else {
      setModalVisible(true)
    }
  }

  const activateWallet = () => {
    setModalVisible(false)
    navigation.navigate("phoneValidation")
  }

  // const testflight = "https://testflight.apple.com/join/9aC8MMk2"
  const appstore = "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"

  // from https://github.com/FiberJW/react-native-app-link/blob/master/index.js
  const openInStore = async ({
    // appName,
    // appStoreId,
    // appStoreLocale = "us",
    playStoreId,
  }) => {
    if (isIos) {
      Linking.openURL(appstore)
      // Linking.openURL(`https://itunes.apple.com/${appStoreLocale}/app/${appName}/id${appStoreId}`);
    } else {
      Linking.openURL(`https://play.google.com/store/apps/details?id=${playStoreId}`)
    }
  }

  const linkUpgrade = () =>
    openInStore({
      // appName: "Bitcoin Beach Wallet",
      // appStoreId: "",
      playStoreId: "com.galoyapp",
    }).catch((err) => {
      console.debug({ err }, "error app link on link")
      // handle error
    })

  let recentTransactionsData = undefined

  const TRANSACTIONS_TO_SHOW = 3

  if (hasToken && transactionsEdges?.length) {
    recentTransactionsData = {
      title: LL.TransactionScreen.title(),
      target: "transactionHistory",
      style: styles.transactionViewButton,
      details: (
        <View style={styles.transactionsView}>
          {transactionsEdges
            .slice(0, TRANSACTIONS_TO_SHOW)
            .map(
              ({ node }, index, array) =>
                node && (
                  <TransactionItem
                    key={`transaction-${node.id}`}
                    navigation={navigation}
                    tx={node}
                    subtitle
                    isLast={index === array.length - 1}
                  />
                ),
            )}
        </View>
      ),
    }
  }

  return (
    <Screen style={styles.screenStyle}>
      <StatusBar backgroundColor={palette.lighterGrey} barStyle="dark-content" />
      {hasUsdWallet && isFocused ? <StableSatsModal /> : null}
      <Modal
        style={styles.modal}
        isVisible={modalVisible}
        swipeDirection={modalVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setModalVisible(false)}
        swipeThreshold={50}
      >
        <View style={styles.flex}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.cover} />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.viewModal}>
          <Icon
            name="ios-remove"
            size={64}
            color={palette.lightGrey}
            style={styles.icon}
          />
          <Text style={styles.text}>{LL.common.needWallet()}</Text>
          <Button
            title={LL.common.openWallet()}
            onPress={activateWallet}
            type="outline"
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.titleStyle}
            containerStyle={styles.buttonContainerStyle}
          />
          <View style={styles.divider} />
        </View>
      </Modal>
      <View style={styles.header}>
        <Button
          buttonStyle={styles.topButton}
          onPress={() =>
            navigation.navigate("priceDetail", {
              account: AccountType.Bitcoin,
            })
          }
          icon={<PriceIcon />}
        />

        <View style={styles.balanceHeaderContainer}>
          <BalanceHeader
            loading={loading}
            hasUsdWallet={hasUsdWallet}
            btcWalletBalance={btcWalletBalance}
            btcWalletValueInUsd={btcWalletValueInUsd}
            usdWalletBalance={usdWalletBalance}
          />
        </View>

        <Button
          {...testProps("Settings Button")}
          buttonStyle={styles.topButton}
          containerStyle={styles.separator}
          onPress={() => navigation.navigate("settings")}
          icon={<SettingsIcon />}
        />
      </View>

      {hasUsdWallet && (
        <View style={styles.walletOverview}>
          <WalletOverview
            navigateToTransferScreen={() => navigation.navigate("conversionDetails")}
            btcWalletBalance={btcWalletBalance}
            usdWalletBalance={usdWalletBalance}
            btcWalletValueInUsd={btcWalletValueInUsd}
          />
        </View>
      )}

      <FlatList
        ListHeaderComponent={() => (
          <>
            {errors?.map(({ message }, item) => (
              <Text key={`error-${item}`} style={styles.error} selectable>
                {message}
              </Text>
            ))}
          </>
        )}
        data={[
          {
            title: LL.ScanningQRCodeScreen.title(),
            target: "scanningQRCode",
            icon: <QrCodeIcon />,
          },
          {
            title: LL.MoveMoneyScreen.send(),
            target: "sendBitcoinDestination",
            icon: <SendIcon />,
          },
          {
            title: LL.MoveMoneyScreen.receive(),
            target: "receiveBitcoin",
            icon: <ReceiveIcon />,
          },
          recentTransactionsData,
        ]}
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        renderItem={({ item }) =>
          item && (
            <>
              <LargeButton
                {...testProps(item.title)}
                title={item.title}
                icon={item.icon}
                onPress={() => onMenuClick(item.target)}
                style={item.style}
              />
              {item.details}
            </>
          )
        }
      />
      <View style={styles.bottom}>
        {isUpdateAvailable && (
          <Pressable onPress={linkUpgrade}>
            <Text style={styles.lightningText}>
              {LL.MoveMoneyScreen.updateAvailable()}
            </Text>
          </Pressable>
        )}
      </View>
    </Screen>
  )
}
