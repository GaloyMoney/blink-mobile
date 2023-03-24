import * as React from "react"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { LocalizedString } from "typesafe-i18n"

import { gql } from "@apollo/client"
import PriceIcon from "@app/assets/icons/price.svg"
import SettingsIcon from "@app/assets/icons/settings.svg"
import { AppUpdate } from "@app/components/app-update/app-update"
import { GaloyIcon, icons } from "@app/components/atomic/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { StableSatsModal } from "@app/components/stablesats-modal"
import WalletOverview from "@app/components/wallet-overview/wallet-overview-redesigned"
import {
  useHomeAuthedQuery,
  useHomeUnauthedQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import { FlatList, RefreshControl, View } from "react-native"
import { BalanceHeader } from "../../components/balance-header"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { testProps } from "../../utils/testProps"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { NewNameBlinkModal } from "@app/components/new-name-blink-modal/new-name-blink-modal"

// const styles = EStyleSheet.create({
//   buttonContainerStyle: {
//     marginTop: "16rem",
//     width: "80%",
//   },

//   buttonStyle: {
//     borderColor: color.primary,
//     borderRadius: 32,
//     borderWidth: 2,
//   },

//   topButton: {
//     backgroundColor: palette.white,
//     borderRadius: "38rem",
//     width: "50rem",
//     height: "50rem",
//   },

//   cover: { height: "100%", width: "100%" },

//   divider: { flex: 1 },

//   error: { alignSelf: "center", color: palette.red, paddingBottom: 18 },

//   flex: {
//     flex: 1,
//   },

//   header: {
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: "15rem",
//     marginHorizontal: "20rem",
//     height: "120rem",
//   },

//   balanceHeaderContainer: { flex: 1, flexDirection: "column" },
//   walletOverview: {
//     marginBottom: "15rem",
//   },

//   icon: { height: 34, top: -22 },

//   listContentContainer: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: palette.red,
//     marginHorizontal: "1rem",
//     marginRight: 0,
//   },

//   listContainer: {
//     // flex: 1,
//     // marginTop: "1rem",
//     // marginLeft: 10,
//     // marginVertical: 50,
//     // border: 4,
//     // borderTopWidth: 10,
//     // borderColor: palette.red,
//     backgroundColor: palette.green,
//     // marginHorizontal: "20rem",
//   },

//   modal: { marginBottom: 0, marginHorizontal: 0 },

//   screenStyle: {
//     backgroundColor: palette.lighterGrey,
//   },

//   text: {
//     color: palette.darkGrey,
//     fontSize: "20rem",
//   },

//   titleStyle: {
//     color: color.primary,
//     fontSize: "18rem",
//     fontWeight: "bold",
//   },

//   transactionsView: {
//     flex: 1,
//     marginHorizontal: "30rem",
//     borderTopLeftRadius: "12rem",
//   },

//   transactionViewButton: {
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//     borderColor: theme.colors.whiteOrDarkGrey,
//     backgroundColor: theme.colors.whiteOrDarkGrey,
//     borderBottomWidth: 2,
//   },

//   viewModal: {
//     alignItems: "center",
//     backgroundColor: palette.white,
//     height: "25%",
//     justifyContent: "flex-end",
//     paddingHorizontal: 20,
//   },

//   background: {
//     color: theme.colors.lighterGreyOrBlack,
//   },
// }))

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
  const { theme } = useTheme()
  const styles = useStyles(theme)
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
    fetchPolicy: "network-only",
    errorPolicy: "all",

    // this enables offline mode use-case
    nextFetchPolicy: "cache-and-network",
  })

  const { loading: loadingPrice, refetch: refetchRealtimePrice } = useRealtimePriceQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",

    // this enables offline mode use-case
    nextFetchPolicy: "cache-and-network",
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

  const [modalVisible, setModalVisible] = React.useState(false)
  const [isStablesatModalVisible, setIsStablesatModalVisible] = React.useState(false)

  const onMenuClick = (target: Target) => {
    if (isAuthed) {
      // we are using any because Typescript complain on the fact we are not passing any params
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
        details: React.ReactNode
      }
    | undefined = undefined

  const TRANSACTIONS_TO_SHOW = 2

  if (isAuthed && transactionsEdges?.length) {
    recentTransactionsData = {
      title: LL.TransactionScreen.title(),
      details: (
        <View>
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
      title: LL.ScanningQRCodeScreen.title(),
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
      swipeThreshold={50}
    >
      <View style={styles.flex}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.cover} />
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.viewModal}>
        <Icon name="ios-remove" size={64} color={palette.lightGrey} style={styles.icon} />
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
  )

  return (
    <Screen backgroundColor={styles.background.color}>
      {AccountCreationNeededModal}
      {<NewNameBlinkModal />}
      <StableSatsModal
        isVisible={isStablesatModalVisible}
        setIsVisible={setIsStablesatModalVisible}
      />
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
          onPress={() => navigation.navigate("settings")}
          icon={<SettingsIcon />}
        />
      </View>

      <View style={styles.walletOverview}>
        <WalletOverview
          loading={loading}
          setIsStablesatModalVisible={setIsStablesatModalVisible}
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
        horizontal
        data={buttons}
        contentContainerStyle={styles.listContentContainer}
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        renderItem={({ item }) =>
          item ? (
            <View style={styles.largeButton}>
              <GaloyIconButton
                name={item.icon}
                size="large"
                text={item.title}
                onPress={() => onMenuClick(item.target)}
              />
            </View>
          ) : null
        }
      />
      {loading ? null : (
        <View style={styles.transactionContainer}>
          <TouchableWithoutFeedback
            style={styles.recentTransaction}
            onPress={() => onMenuClick("transactionHistory")}
          >
            <Text type="p1" bold style={{}}>
              {recentTransactionsData?.title}
            </Text>
            <GaloyIcon name="caret-up" size={20} />
          </TouchableWithoutFeedback>
          {recentTransactionsData?.details}
        </View>
      )}
      <AppUpdate />
    </Screen>
  )
}

const useStyles = makeStyles((theme) => ({
  buttonContainerStyle: {
    marginTop: 16,
    width: "80%",
  },
  text: {
    color: theme.colors.grey10,
    fontSize: 20,
  },
  titleStyle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    height: 34,
    top: -22,
  },
  buttonStyle: {
    borderColor: theme.colors.primary,
    borderRadius: 32,
    borderWidth: 2,
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
    backgroundColor: theme.colors.white,
    height: "25%",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
  recentTransaction: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 10,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderColor: theme.colors.greyOutline,
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  transactionContainer: {
    marginHorizontal: 30,
  },
  largeButton: {
    display: "flex",
    justifyContent: "space-between",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 30,
    height: 120,
  },
  topButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 38,
    width: 45,
    height: 45,
  },
  balanceHeaderContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  listContainer: {
    maxHeight: 120,
    padding: 0,
  },
  listContentContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    columnGap: 20,
    marginHorizontal: 30,
    paddingRight: 30,
    borderRadius: 12,
    marginLeft: 30,
    width: "100%",
    height: 100,
    overflow: "hidden",
  },
  walletOverview: {
    marginBottom: 15,
  },
  error: {
    alignSelf: "center",
    color: theme.colors.error,
    paddingBottom: 18,
  },
}))
