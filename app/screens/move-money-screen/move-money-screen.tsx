import messaging from "@react-native-firebase/messaging"
import * as React from "react"
import { useEffect, useState } from "react"
import {
  AppState,
  AppStateStatus,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleProp,
  Text,
  View,
  ViewStyle,
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
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import QrCodeIcon from "@app/assets/icons/qr-code.svg"
import SendIcon from "@app/assets/icons/send.svg"
import ReceiveIcon from "@app/assets/icons/receive.svg"
import PriceIcon from "@app/assets/icons/price.svg"
import SettingsIcon from "@app/assets/icons/settings.svg"
import { useIsFocused } from "@react-navigation/native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StableSatsModal } from "@app/components/stablesats-modal"
import { testProps } from "../../../utils/testProps"
import { MainQuery, TransactionFragment, useMainQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import crashlytics from "@react-native-firebase/crashlytics"
import NetInfo from "@react-native-community/netinfo"
import { LocalizedString } from "typesafe-i18n"
import { useIsAuthed } from "@app/graphql/is-authed-context"

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

type Navigation = StackNavigationProp<RootStackParamList>

type MoveMoneyScreenDataInjectedProps = {
  navigation: Navigation
}

export const MoveMoneyScreenDataInjected: React.FC<MoveMoneyScreenDataInjectedProps> = ({
  navigation,
}) => {
  const isAuthed = useIsAuthed()

  gql`
    query main($isAuthed: Boolean!) {
      globals {
        network
      }

      btcPrice {
        base
        offset
        currencyUnit
        formattedAmount
      }
      me @include(if: $isAuthed) {
        id
        language
        username
        phone

        defaultAccount {
          id
          defaultWalletId
          displayCurrency

          transactions(first: 3) {
            ...TransactionList
          }
          wallets {
            id
            balance
            walletCurrency
          }
          btcWallet @client {
            balance
            usdBalance
          }
          usdWallet @client {
            id
            balance
          }
        }
      }
      mobileVersions {
        platform
        currentSupported
        minSupported
      }
    }
  `

  const { LL } = useI18nContext()

  const {
    data,
    loading: loadingMain,
    previousData,
    refetch,
    error,
  } = useMainQuery({
    variables: { isAuthed },
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
  })

  type MobileVersion = MainQuery["mobileVersions"]
  const mobileVersions: MobileVersion = data?.mobileVersions
  const transactionsEdges = data?.me?.defaultAccount?.transactions?.edges ?? undefined
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id

  const btcWalletValueInUsd = isAuthed
    ? data?.me?.defaultAccount?.btcWallet?.usdBalance ?? NaN
    : 0
  const usdWalletBalance = isAuthed
    ? data?.me?.defaultAccount?.usdWallet?.balance ?? NaN
    : 0
  const btcWalletBalance = isAuthed
    ? data?.me?.defaultAccount?.btcWallet?.balance ?? NaN
    : 0

  let errors: Error[] = []
  if (error) {
    if (error.graphQLErrors?.length > 0 && previousData) {
      // We got an error back from the server but we have data in the cache
      errors = [...error.graphQLErrors]
    }

    if (error.graphQLErrors?.length > 0 && !previousData) {
      // This is the first execution of mainquery and we received errors back from the server
      error.graphQLErrors.forEach((e) => {
        crashlytics().recordError(e)
        console.debug(e)
      })
    }
    if (error.networkError && previousData) {
      // Call to mainquery has failed but we have data in the cache
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          errors = [
            ...errors,
            { name: "networkError", message: LL.errors.network.request() },
          ]
        } else {
          // We failed to fetch the data because the device is offline
          errors = [
            ...errors,
            { name: "networkError", message: LL.errors.network.connection() },
          ]
        }
      })
    }
    if (error.networkError && !previousData) {
      // This is the first execution of mainquery and it has failed
      crashlytics().recordError(error.networkError)
      // TODO: check if error is INVALID_AUTHENTICATION here
    }
  }

  // temporary fix until we have a better management of notifications:
  // when coming back to active state. look if the invoice has been paid
  useEffect(() => {
    const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
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

  // FIXME: mobile version won't work with multiple binaries
  // as non unisersal binary (ie: arm) has a different build number structure
  function isUpdateAvailableOrRequired(mobileVersions: MobileVersion) {
    if (!mobileVersions) {
      return {
        required: false,
        available: false,
      }
    }

    try {
      const minSupportedVersion =
        mobileVersions.find((mobileVersion) => mobileVersion?.platform === Platform.OS)
          ?.minSupported ?? NaN

      const currentSupportedVersion =
        mobileVersions.find((mobileVersion) => mobileVersion?.platform === Platform.OS)
          ?.currentSupported ?? NaN

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
      transactionsEdges={transactionsEdges}
      isUpdateAvailable={isUpdateAvailableOrRequired(mobileVersions).available}
      hasToken={isAuthed}
      hasUsdWallet={usdWalletId !== undefined}
      usdWalletBalance={usdWalletBalance}
      btcWalletBalance={btcWalletBalance}
      btcWalletValueInUsd={btcWalletValueInUsd}
    />
  )
}

type MoveMoneyScreenProps = {
  navigation: Navigation
  loading: boolean
  errors: Error[]
  transactionsEdges:
    | readonly { cursor: string; node: TransactionFragment | null }[]
    | undefined
  refetch: () => void
  isUpdateAvailable: boolean
  hasToken: boolean
  hasUsdWallet: boolean
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
}

export const MoveMoneyScreen: React.FC<MoveMoneyScreenProps> = ({
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
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const { LL } = useI18nContext()
  const isFocused = useIsFocused()
  const onMenuClick = (target: Target) => {
    if (hasToken) {
      // we are usingg any because Typescript complain on the fact we are not passing any params
      // but there is no need for a params and the types should not necessitate it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate(target as any)
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
  const openInStore = async (playStoreId: string) => {
    if (isIos) {
      Linking.openURL(appstore)
      // Linking.openURL(`https://itunes.apple.com/${appStoreLocale}/app/${appName}/id${appStoreId}`);
    } else {
      Linking.openURL(`https://play.google.com/store/apps/details?id=${playStoreId}`)
    }
  }

  const linkUpgrade = () =>
    openInStore("com.galoyapp").catch((err) => {
      console.debug({ err }, "error app link on link")
      // handle error
    })

  let recentTransactionsData:
    | {
        title: LocalizedString
        target: Target
        style: StyleProp<ViewStyle>
        details: React.ReactNode
      }
    | undefined = undefined

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

  type Target =
    | "scanningQRCode"
    | "sendBitcoinDestination"
    | "receiveBitcoin"
    | "transactionHistory"
  const buttons = [
    {
      title: LL.ScanningQRCodeScreen.title(),
      target: "scanningQRCode" as Target,
      icon: <QrCodeIcon />,
    },
    {
      title: LL.MoveMoneyScreen.send(),
      target: "sendBitcoinDestination" as Target,
      icon: <SendIcon />,
    },
    {
      title: LL.MoveMoneyScreen.receive(),
      target: "receiveBitcoin" as Target,
      icon: <ReceiveIcon />,
    },
    recentTransactionsData,
  ]

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
        data={buttons}
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        renderItem={({ item }) =>
          item ? (
            <>
              <LargeButton
                {...testProps(item.title)}
                title={item.title}
                icon={"icon" in item ? item.icon : undefined}
                onPress={() => onMenuClick(item.target)}
                style={"style" in item ? item.style : undefined}
              />
              {"details" in item ? item.details : null}
            </>
          ) : null
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
