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
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { FlatList, Pressable, RefreshControl, StatusBar, Text, View } from "react-native"
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
        transactions(first: 20) {
          ...TransactionList
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

  query realtimePrice {
    me {
      id
      defaultAccount {
        id
        realtimePrice {
          btcSatPrice {
            base
            offset
          }
          denominatorCurrency
          id
          timestamp
          usdCentPrice {
            base
            offset
          }
        }
      }
    }
  }
`

type Target =
  | "scanningQRCode"
  | "sendBitcoinDestination"
  | "receiveBitcoin"
  | "transactionHistory"

const TRANSACTIONS_TO_SHOW = 3

export const HomeScreen: React.FC = () => {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isAuthed = useIsAuthed()

  const { LL } = useI18nContext()

  const {
    data: dataAuthed,
    loading: loadingAuthed,
    error,
    refetch: refetchAuthed,
  } = useHomeAuthedQuery({
    skip: !isAuthed,
    // TODO: manage offline use case
    // should it be cache-and-network?
    // main downside from cache-and-network is that this would
    // show a stale balance/price before refreshing
    // I think if we're online it's better to have a loading indicator for some 100 of milliseconds
    // versus seens a balance, and then another balance just a few milliseconds later
    fetchPolicy: "network-only",
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

  const [modalVisible, setModalVisible] = useState(false)
  const isFocused = useIsFocused()

  const toPriceHistory = useCallback(() => navigate("priceHistory"), [navigate])
  const toSettings = useCallback(() => navigate("settings"), [navigate])
  const toTxHistory = useCallback(() => navigate("transactionHistory"), [navigate])

  const onMenuClick = useCallback(
    (target: Target) => {
      if (isAuthed) {
        // we are using any because Typescript complain on the fact we are not passing any params
        // but there is no need for a params and the types should not necessitate it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigate(target as any)
      } else {
        setModalVisible(true)
      }
    },
    [setModalVisible, navigate, isAuthed],
  )

  const recentTransactionsData = React.useMemo(() => {
    const transactionsEdges =
      dataAuthed?.me?.defaultAccount?.transactions?.edges ?? undefined

    if (isAuthed && transactionsEdges?.length) {
      return {
        title: LL.TransactionScreen.title(),
        onPress: toTxHistory,
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
    return undefined
  }, [LL, isAuthed, toTxHistory, dataAuthed])

  const buttons = React.useMemo(() => {
    const data = [
      {
        title: LL.ScanningQRCodeScreen.title(),
        icon: <QrCodeIcon />,
        onPress: () => onMenuClick("scanningQRCode"),
      },
      {
        title: LL.HomeScreen.send(),
        icon: <SendIcon />,
        onPress: () => onMenuClick("sendBitcoinDestination"),
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

  const removeModal = useCallback(() => setModalVisible(false), [])
  const activateWallet = useCallback(() => {
    setModalVisible(false)
    navigate("phoneFlow")
  }, [navigate, setModalVisible])

  const HeaderComponent = useMemo(
    () => (
      <>
        {error && (
          <Text style={styles.error} selectable>
            {error.graphQLErrors.map(({ message }) => message).join("\n")}
          </Text>
        )}
      </>
    ),
    [error],
  )

  const PriceButton = useMemo(() => <PriceIcon />, [])
  const SettingButton = useMemo(() => <SettingsIcon />, [])

  return (
    <Screen style={styles.screenStyle}>
      <StatusBar backgroundColor={palette.lighterGrey} barStyle="dark-content" />
      {isFocused ? <StableSatsModal /> : null}
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
          {...testProps("price button")}
          buttonStyle={styles.topButton}
          onPress={toPriceHistory}
          icon={PriceButton}
        />

        <View style={styles.balanceHeaderContainer}>
          <BalanceHeader loading={loading} />
        </View>

        <Button
          {...testProps("Settings Button")}
          buttonStyle={styles.topButton}
          containerStyle={styles.separator}
          onPress={toSettings}
          icon={SettingButton}
        />
      </View>

      <View style={styles.walletOverview}>
        <WalletOverview loading={loading} setModalVisible={setModalVisible} />
      </View>

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
      <AppUpdate />
    </Screen>
  )
}
