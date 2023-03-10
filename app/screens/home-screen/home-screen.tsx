import { gql } from "@apollo/client"
import PriceIcon from "@app/assets/icons/price.svg"
import QrCodeIcon from "@app/assets/icons/qr-code.svg"
import ReceiveIcon from "@app/assets/icons/receive.svg"
import SendIcon from "@app/assets/icons/send.svg"
import SettingsIcon from "@app/assets/icons/settings.svg"
import { AppUpdate } from "@app/components/app-update/app-update"
import { StableSatsModal } from "@app/components/stablesats-modal"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import {
  useHomeAuthedQuery,
  useHomeUnauthedQuery,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import * as React from "react"
import { useState } from "react"
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { LocalizedString } from "typesafe-i18n"
import { BalanceHeader } from "../../components/balance-header"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { testProps } from "../../utils/testProps"

const styles = EStyleSheet.create({
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
  query homeAuthed {
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
        }
        usdWallet @client {
          id
          balance
        }
      }
    }
  }

  query homeUnauthed {
    globals {
      network
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
  } = useHomeAuthedQuery({
    skip: !isAuthed,
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
  })

  const { loading: loadingPrice, refetch: refetchRealtimePrice } = useRealtimePriceQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
  })

  const { refetch: refetchUnauthed, loading: loadingUnauthed } = useHomeUnauthedQuery()

  const loading = loadingAuthed || loadingPrice || loadingUnauthed

  const refetch = React.useCallback(() => {
    if (isAuthed) {
      refetchRealtimePrice()
      refetchAuthed()
      refetchUnauthed()
    }
  }, [isAuthed, refetchAuthed, refetchRealtimePrice, refetchUnauthed])

  const transactionsEdges =
    dataAuthed?.me?.defaultAccount?.transactions?.edges ?? undefined

  const btcWalletBalance = isAuthed
    ? dataAuthed?.me?.defaultAccount?.btcWallet?.balance ?? NaN
    : 0

  const usdWalletBalance = isAuthed
    ? dataAuthed?.me?.defaultAccount?.usdWallet?.balance ?? NaN
    : 0

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
          btcWalletBalance={{ amount: btcWalletBalance, currency: WalletCurrency.Btc }}
          usdWalletBalance={{ amount: usdWalletBalance, currency: WalletCurrency.Usd }}
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
      <AppUpdate />
    </Screen>
  )
}
