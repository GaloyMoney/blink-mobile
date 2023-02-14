import { gql } from "@apollo/client"
import PriceIcon from "@app/assets/icons/price.svg"
import QrCodeIcon from "@app/assets/icons/qr-code.svg"
import ReceiveIcon from "@app/assets/icons/receive.svg"
import SendIcon from "@app/assets/icons/send.svg"
import SettingsIcon from "@app/assets/icons/settings.svg"
import { StableSatsModal } from "@app/components/stablesats-modal"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import {
  MainUnauthedQuery,
  useMainAuthedQuery,
  useMainUnauthedQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import NetInfo from "@react-native-community/netinfo"
import crashlytics from "@react-native-firebase/crashlytics"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import * as React from "react"
import { useState } from "react"
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native"
import { getBuildNumber } from "react-native-device-info"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { BalanceHeader } from "../../components/balance-header"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { AccountType } from "../../utils/enum"
import { isIos } from "../../utils/helper"
import { testProps } from "../../utils/testProps"

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

gql`
  query mainAuthed {
    btcPrice {
      base
      currencyUnit
      formattedAmount
      offset
    }
    me {
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
  }

  query mainUnauthed {
    globals {
      network
    }

    btcPrice {
      base
      offset
      currencyUnit
      formattedAmount
    }

    mobileVersions {
      platform
      currentSupported
      minSupported
    }
  }
`

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isAuthed = useIsAuthed()

  const { LL } = useI18nContext()

  const {
    data: dataAuthed,
    loading,
    previousData,
    refetch: refetchRaw,
    error,
  } = useMainAuthedQuery({
    skip: !isAuthed,
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
  })

  const refetch = React.useCallback(() => {
    isAuthed ? refetchRaw() : null
  }, [isAuthed, refetchRaw])

  const { data: dataUnauthed } = useMainUnauthedQuery()

  type MobileVersion = MainUnauthedQuery["mobileVersions"]
  const mobileVersions: MobileVersion = dataUnauthed?.mobileVersions

  const transactionsEdges =
    dataAuthed?.me?.defaultAccount?.transactions?.edges ?? undefined
  const usdWalletId = dataAuthed?.me?.defaultAccount?.usdWallet?.id
  const btcWalletValueInUsd = isAuthed
    ? dataAuthed?.me?.defaultAccount?.btcWallet?.usdBalance ?? NaN
    : 0
  const usdWalletBalance = isAuthed
    ? dataAuthed?.me?.defaultAccount?.usdWallet?.balance ?? NaN
    : 0
  const btcWalletBalance = isAuthed
    ? dataAuthed?.me?.defaultAccount?.btcWallet?.balance ?? NaN
    : 0

  const errors: Error[] = React.useMemo(() => {
    let errorsRaw: Error[] = []
    if (error) {
      if (error.graphQLErrors?.length > 0 && previousData) {
        // We got an error back from the server but we have data in the cache
        errorsRaw = [...error.graphQLErrors]
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
            errorsRaw = [
              ...errorsRaw,
              { name: "networkError", message: LL.errors.network.request() },
            ]
          } else {
            // We failed to fetch the data because the device is offline
            errorsRaw = [
              ...errorsRaw,
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
    return errorsRaw
  }, [error, previousData, LL])

  // FIXME: mobile version won't work with multiple binaries
  // as non unisersal binary (ie: arm) has a different build number structure
  const isUpdateAvailableOrRequired = (mobileVersions: MobileVersion) => {
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

  const isUpdateAvailable = isUpdateAvailableOrRequired(mobileVersions).available
  const hasUsdWallet = usdWalletId !== undefined

  const [modalVisible, setModalVisible] = useState(false)

  const removeModal = React.useCallback(() => setModalVisible(false), [])
  const navigateToPriceHistory = React.useCallback(
    () =>
      navigation.navigate("priceDetail", {
        account: AccountType.Bitcoin,
      }),
    [navigation],
  )

  const navigateToSettings = React.useCallback(
    () => navigation.navigate("settings"),
    [navigation],
  )
  const isFocused = useIsFocused()

  type Target =
    | "scanningQRCode"
    | "sendBitcoinDestination"
    | "receiveBitcoin"
    | "transactionHistory"

  const onMenuClick = React.useCallback(
    (target: Target) => {
      if (isAuthed) {
        // we are usingg any because Typescript complain on the fact we are not passing any params
        // but there is no need for a params and the types should not necessitate it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigation.navigate(target as any)
      } else {
        setModalVisible(true)
      }
    },
    [isAuthed, navigation],
  )

  const navigateToConversion = React.useCallback(
    () => navigation.navigate("conversionDetails"),
    [navigation],
  )

  const activateWallet = React.useCallback(() => {
    setModalVisible(false)
    navigation.navigate("phoneValidation")
  }, [navigation])

  // from https://github.com/FiberJW/react-native-app-link/blob/master/index.js
  const openInStore = React.useCallback(async (playStoreId: string) => {
    // const testflight = "https://testflight.apple.com/join/9aC8MMk2"
    const appstore = "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"

    if (isIos) {
      Linking.openURL(appstore)
      // Linking.openURL(`https://itunes.apple.com/${appStoreLocale}/app/${appName}/id${appStoreId}`);
    } else {
      Linking.openURL(`https://play.google.com/store/apps/details?id=${playStoreId}`)
    }
  }, [])

  const linkUpgrade = React.useCallback(
    () =>
      openInStore("com.galoyapp").catch((err) => {
        console.debug({ err }, "error app link on link")
        // handle error
      }),
    [openInStore],
  )

  const TRANSACTIONS_TO_SHOW = 3

  const recentTransactionsData = React.useMemo(() => {
    if (isAuthed && transactionsEdges?.length) {
      return {
        title: LL.TransactionScreen.title(),
        onPress: () => onMenuClick("transactionHistory"),
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
    return undefined
  }, [LL, isAuthed, navigation, onMenuClick, transactionsEdges])

  const buttons = React.useMemo(() => {
    const data = [
      {
        title: LL.ScanningQRCodeScreen.title(),
        icon: <QrCodeIcon />,
        onPress: () => onMenuClick("scanningQRCode"),
      },
      {
        title: LL.HomeScreen.send(),
        onPress: () => onMenuClick("sendBitcoinDestination"),
        icon: <SendIcon />,
      },
      {
        title: LL.HomeScreen.receive(),
        onPress: () => onMenuClick("receiveBitcoin"),
        icon: <ReceiveIcon />,
      },
    ]

    if (recentTransactionsData) {
      return [...data, recentTransactionsData]
    }
    return data
  }, [LL, recentTransactionsData, onMenuClick])

  const HeaderComponent = React.useMemo(
    () => (
      <>
        {errors.map(({ message }, item) => (
          <Text key={`error-${item}`} style={styles.error} selectable>
            {message}
          </Text>
        ))}
      </>
    ),
    [errors],
  )

  return (
    <Screen style={styles.screenStyle}>
      <StatusBar backgroundColor={palette.lighterGrey} barStyle="dark-content" />
      {hasUsdWallet && isFocused ? <StableSatsModal /> : null}
      <Modal
        style={styles.modal}
        isVisible={modalVisible}
        swipeDirection={modalVisible ? ["down"] : ["up"]}
        onSwipeComplete={removeModal}
        swipeThreshold={50}
      >
        <View style={styles.flex}>
          <TouchableWithoutFeedback onPress={removeModal}>
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
          onPress={navigateToPriceHistory}
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
          onPress={navigateToSettings}
          icon={<SettingsIcon />}
        />
      </View>

      {hasUsdWallet && (
        <View style={styles.walletOverview}>
          <WalletOverview
            navigateToTransferScreen={navigateToConversion}
            btcWalletBalance={btcWalletBalance}
            usdWalletBalance={usdWalletBalance}
            btcWalletValueInUsd={btcWalletValueInUsd}
          />
        </View>
      )}

      <FlatList
        ListHeaderComponent={HeaderComponent}
        data={buttons}
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <Pressable onPress={item.onPress}>
            <LargeButton
              {...testProps(item.title)}
              title={item.title}
              icon={"icon" in item ? item.icon : undefined}
              style={"style" in item ? item.style : undefined}
            />
            {"details" in item ? item.details : null}
          </Pressable>
        )}
      />
      <View style={styles.bottom}>
        {isUpdateAvailable && (
          <Pressable onPress={linkUpgrade}>
            <Text style={styles.lightningText}>{LL.HomeScreen.updateAvailable()}</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  )
}
