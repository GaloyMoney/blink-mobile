import * as React from "react"
import { useState } from "react"
import {
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
import { isIos } from "../../utils/helper"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import QrCodeIcon from "@app/assets/icons/qr-code.svg"
import SendIcon from "@app/assets/icons/send.svg"
import ReceiveIcon from "@app/assets/icons/receive.svg"
import PriceIcon from "@app/assets/icons/price.svg"
import SettingsIcon from "@app/assets/icons/settings.svg"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StableSatsModal } from "@app/components/stablesats-modal"
import { testProps } from "../../utils/testProps"
import {
  useMainAuthedQuery,
  useMainUnauthedQuery,
  MainUnauthedQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { gql } from "@apollo/client"
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

gql`
  query mainAuthed {
    me {
      id
      language
      username
      phone

      defaultAccount {
        id
        defaultWalletId

        transactions(first: 20) {
          ...TransactionList
        }
        wallets {
          id
          balance
          walletCurrency
        }
        btcWallet @client {
          id
          balance
          displayBalance
        }
        usdWallet @client {
          id
          displayBalance
        }
      }
    }
  }

  query mainUnauthed {
    globals {
      network
    }

    mobileVersions {
      platform
      currentSupported
      minSupported
    }

    currencyList {
      id
      flag
      name
      symbol
      fractionDigits
    }
  }
`

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isAuthed = useIsAuthed()

  const { LL } = useI18nContext()

  const {
    data: dataAuthed,
    loading: loadingAuthed,
    error,
    refetch: refetchAuthed,
  } = useMainAuthedQuery({
    skip: !isAuthed,
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
  })

  const { loading: loadingPrice, refetch: refetchRealtimePrice } = useRealtimePriceQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
  })

  const {
    data: dataUnauthed,
    refetch: refetchUnauthed,
    loading: loadingUnauthed,
  } = useMainUnauthedQuery()

  const loading = loadingAuthed || loadingPrice || loadingUnauthed

  const refetch = React.useCallback(() => {
    if (isAuthed) {
      refetchRealtimePrice()
      refetchAuthed()
      refetchUnauthed()
    }
  }, [isAuthed, refetchAuthed, refetchRealtimePrice, refetchUnauthed])

  type MobileVersion = MainUnauthedQuery["mobileVersions"]
  const mobileVersions: MobileVersion = dataUnauthed?.mobileVersions

  const transactionsEdges =
    dataAuthed?.me?.defaultAccount?.transactions?.edges ?? undefined

  const btcWalletValueInDisplayCurrency = isAuthed
    ? dataAuthed?.me?.defaultAccount?.btcWallet?.displayBalance ?? NaN
    : 0

  const usdWalletBalanceInDisplayCurrency = isAuthed
    ? dataAuthed?.me?.defaultAccount?.usdWallet?.displayBalance ?? NaN
    : 0

  const btcWalletBalance = isAuthed
    ? dataAuthed?.me?.defaultAccount?.btcWallet?.balance ?? NaN
    : 0

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

  const [modalVisible, setModalVisible] = useState(false)
  const isFocused = useIsFocused()

  const onMenuClick = (target: Target) => {
    if (isAuthed) {
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
    navigation.navigate("phoneFlow")
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

  if (isAuthed && transactionsEdges?.length) {
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
                    txid={node.id}
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
      title: LL.HomeScreen.send(),
      target: "sendBitcoinDestination" as Target,
      icon: <SendIcon />,
    },
    {
      title: LL.HomeScreen.receive(),
      target: "receiveBitcoin" as Target,
      icon: <ReceiveIcon />,
    },
    recentTransactionsData,
  ]

  return (
    <Screen style={styles.screenStyle}>
      <StatusBar backgroundColor={palette.lighterGrey} barStyle="dark-content" />
      {isFocused ? <StableSatsModal /> : null}
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
          {...testProps("price button")}
          buttonStyle={styles.topButton}
          onPress={() => navigation.navigate("priceHistory")}
          icon={<PriceIcon />}
        />

        <View style={styles.balanceHeaderContainer}>
          <BalanceHeader loading={loading} />
        </View>

        <Button
          {...testProps("Settings Button")}
          buttonStyle={styles.topButton}
          containerStyle={styles.separator}
          onPress={() => navigation.navigate("settings")}
          icon={<SettingsIcon />}
        />
      </View>

      <View style={styles.walletOverview}>
        <WalletOverview
          loading={loading}
          btcWalletBalance={btcWalletBalance}
          usdWalletBalanceInDisplayCurrency={usdWalletBalanceInDisplayCurrency}
          btcWalletValueInDisplayCurrency={btcWalletValueInDisplayCurrency}
        />
      </View>

      <FlatList
        ListHeaderComponent={() => (
          <>
            {error && (
              <Text style={styles.error} selectable>
                {error.graphQLErrors.map(({ message }) => message).join("\n")}
              </Text>
            )}
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
            <Text style={styles.lightningText}>{LL.HomeScreen.updateAvailable()}</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  )
}
