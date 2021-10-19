import { ApolloError, useApolloClient, useQuery } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"
import * as React from "react"
import { useEffect, useState } from "react"
import {
  AppState,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { getBuildNumber } from "react-native-device-info"
import { BalanceHeader } from "../../components/balance-header"
import { IconTransaction } from "../../components/icon-transactions"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { MAIN_QUERY, TRANSACTIONS_LIST, walletIsActive } from "../../graphql/query"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { AccountType } from "../../utils/enum"
import { isIos } from "../../utils/helper"
import { ScreenType } from "../../types/jsx"
import useToken from "../../utils/use-token"
import { StackNavigationProp } from "@react-navigation/stack"
import { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { toastShow } from "../../utils/toast"

const styles = EStyleSheet.create({
  balanceHeader: {
    marginBottom: "32rem",
  },

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

  buttonStyleTime: {
    backgroundColor: palette.white,
    borderRadius: "38rem",
    width: "50rem",
  },

  cover: { height: "100%", width: "100%" },

  divider: { flex: 1 },

  error: { alignSelf: "center", color: palette.red, paddingBottom: 18 },

  flex: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  icon: { height: 34, top: -22 },

  lightningText: {
    fontSize: "16rem",
    marginBottom: 12,
    textAlign: "center",
  },

  listContainer: {
    marginTop: "24rem",
  },

  modal: { marginBottom: 0, marginHorizontal: 0 },

  screenStyle: {
    backgroundColor: palette.lighterGrey,
  },

  separator: { marginTop: 32 },

  text: {
    color: palette.darkGrey,
    fontSize: "20rem",
    // fontWeight: "bold",
  },

  titleStyle: {
    color: color.primary,
    fontSize: "18rem",
    fontWeight: "bold",
  },

  transactionsLoading: {
    marginTop: "20rem",
    textAlign: "center",
  },

  transactionsView: {
    flex: 1,
    marginHorizontal: "30rem",
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
  navigation: StackNavigationProp<MoveMoneyStackParamList, "moveMoney">
}

export const MoveMoneyScreenDataInjected: ScreenType = ({
  navigation,
}: MoveMoneyScreenDataInjectedProps) => {
  const client = useApolloClient()
  const { hasToken } = useToken()

  const {
    loading: loadingMain,
    error,
    data,
    refetch,
  } = useQuery(MAIN_QUERY, {
    variables: {
      logged: hasToken,
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: "all",
  })

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

    AppState.addEventListener("change", _handleAppStateChange)

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // TODO: fine grain query
      // only refresh as necessary
      refetch()
    })

    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function isUpdateAvailableOrRequired({ buildParameters }) {
    try {
      const {
        minBuildNumberAndroid,
        minBuildNumberIos,
        lastBuildNumberAndroid,
        lastBuildNumberIos,
      } = buildParameters
      const minBuildNumber = isIos ? minBuildNumberIos : minBuildNumberAndroid
      const lastBuildNumber = isIos ? lastBuildNumberIos : lastBuildNumberAndroid
      const buildNumber = Number(getBuildNumber())
      return {
        required: buildNumber < minBuildNumber,
        available: buildNumber < lastBuildNumber,
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
      walletIsActive={walletIsActive(client)}
      loading={loadingMain}
      error={error}
      refetch={refetch}
      isUpdateAvailable={
        isUpdateAvailableOrRequired({ buildParameters: data?.buildParameters }).available
      }
      hasToken={hasToken}
    />
  )
}

const RecentTransactions = ({ navigation }) => {
  const { error, loading, data } = useQuery(TRANSACTIONS_LIST, {
    variables: { first: 3 },
    onError: console.error,
  })

  if (error) {
    console.error(error)
    toastShow("Error loading recent transactions.")
    return null
  }

  if (loading) {
    return <Text style={styles.transactionsLoading}>Loading...</Text>
  }

  if (!data?.me?.defaultAccount) {
    return null
  }

  const transactionsEdges = data.me.defaultAccount.wallets[0].transactions.edges

  return (
    <View style={styles.transactionsView}>
      {transactionsEdges.map(({ node }) => (
        <TransactionItem
          key={`transaction-${node.id}`}
          navigation={navigation}
          tx={node}
          subtitle
        />
      ))}
    </View>
  )
}

type MoveMoneyScreenProps = {
  walletIsActive: boolean
  navigation: StackNavigationProp<MoveMoneyStackParamList, "moveMoney">
  loading: boolean
  error: ApolloError
  transactions: []
  refetch: () => void
  isUpdateAvailable: boolean
  hasToken: boolean
}

export const MoveMoneyScreen: ScreenType = ({
  walletIsActive,
  navigation,
  loading,
  error,
  refetch,
  isUpdateAvailable,
  hasToken,
}: MoveMoneyScreenProps) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [secretMenuCounter, setSecretMenuCounter] = useState(0)

  React.useEffect(() => {
    if (secretMenuCounter > 2) {
      navigation.navigate("Profile")
      setSecretMenuCounter(0)
    }
  }, [navigation, secretMenuCounter])

  const onMenuClick = (target) => {
    walletIsActive ? navigation.navigate(target) : setModalVisible(true)
  }

  const activateWallet = () => {
    setModalVisible(false)
    navigation.navigate("phoneValidation")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testflight = "https://testflight.apple.com/join/9aC8MMk2"
  const appstore = "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"

  // from https://github.com/FiberJW/react-native-app-link/blob/master/index.js
  const openInStore = async ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appName,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appStoreId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appStoreLocale = "us",
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
      appName: "Bitcoin Beach Wallet",
      appStoreId: "",
      playStoreId: "com.galoyapp",
    })
      .then(() => {
        console.log("clicked on link")
      })
      .catch((err) => {
        console.log({ err }, "error app link on link")
        // handle error
      })

  return (
    <Screen style={styles.screenStyle}>
      <StatusBar backgroundColor={palette.lighterGrey} barStyle="dark-content" />
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
          <Text style={styles.text}>{translate("common.needWallet")}</Text>
          <Button
            title={translate("common.openWallet")}
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
          buttonStyle={styles.buttonStyleTime}
          containerStyle={styles.separator}
          onPress={() =>
            navigation.navigate("priceDetail", {
              account: AccountType.Bitcoin,
            })
          }
          icon={<Icon name="ios-trending-up-outline" size={32} />}
        />
        <BalanceHeader loading={loading} style={styles.balanceHeader} />
        <Button
          buttonStyle={styles.buttonStyleTime}
          containerStyle={styles.separator}
          onPress={() => navigation.navigate("settings")}
          icon={<Icon name="ios-settings-outline" size={32} />}
        />
      </View>

      <FlatList
        ListHeaderComponent={() => (
          <>
            {error?.graphQLErrors?.map(({ message }, item) => (
              <Text key={`error-${item}`} style={styles.error} selectable>
                {message}
              </Text>
            ))}
          </>
        )}
        data={[
          {
            title: translate("ScanningQRCodeScreen.title"),
            target: "scanningQRCode",
            icon: <Icon name="qr-code" size={32} color={palette.orange} />,
          },
          {
            title: translate("MoveMoneyScreen.send"),
            target: "sendBitcoin",
            icon: <IconTransaction isReceive={false} size={32} />,
          },
          {
            title: translate("MoveMoneyScreen.receive"),
            target: "receiveBitcoin",
            icon: <IconTransaction isReceive size={32} />,
          },
          ...(hasToken
            ? [
                {
                  title: translate("TransactionScreen.title"),
                  target: "transactionHistory",
                  icon: <Icon name="ios-list-outline" size={32} color={palette.black} />,
                  style: "transactionViewContainer",
                  details: <RecentTransactions navigation={navigation} />,
                },
              ]
            : []),
        ]}
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <>
            <LargeButton
              title={item.title}
              icon={item.icon}
              onPress={() => onMenuClick(item.target)}
              style={item.style}
            />
            {item.details}
          </>
        )}
      />
      <View style={styles.bottom}>
        {isUpdateAvailable && (
          <Pressable onPress={linkUpgrade}>
            <Text style={styles.lightningText}>
              {translate("MoveMoneyScreen.updateAvailable")}
            </Text>
          </Pressable>
        )}
      </View>
    </Screen>
  )
}
