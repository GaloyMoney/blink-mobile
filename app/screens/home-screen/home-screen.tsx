import * as React from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { LocalizedString } from "typesafe-i18n"

import { gql } from "@apollo/client"
import PriceIcon from "@app/assets/icons/price.svg"
import SettingsIcon from "@app/assets/icons/settings.svg"
import { AppUpdate } from "@app/components/app-update/app-update"
import { icons } from "@app/components/atomic/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { NewNameBlinkModal } from "@app/components/new-name-blink-modal/new-name-blink-modal"
import { StableSatsModal } from "@app/components/stablesats-modal"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import {
  useHideBalanceQuery,
  useHomeAuthedQuery,
  useHomeUnauthedQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getErrorMessages } from "@app/graphql/utils"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import { makeStyles, Text, useTheme } from "@rneui/themed"

import { BalanceHeader } from "../../components/balance-header"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { testProps } from "../../utils/testProps"

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
  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const isBalanceVisible = hideBalance ?? false

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
  const [isContentVisible, setIsContentVisible] = React.useState(false)

  React.useEffect(() => {
    setIsContentVisible(isBalanceVisible)
  }, [isBalanceVisible])

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
        <>
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
        </>
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
        <View style={styles.flex} />
      </View>
    </Modal>
  )

  return (
    <Screen backgroundColor={styles.background.color} style={styles.flex}>
      {AccountCreationNeededModal}
      <NewNameBlinkModal />
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
          <BalanceHeader
            isContentVisible={isContentVisible}
            setIsContentVisible={setIsContentVisible}
            loading={loading}
          />
        </View>

        <Button
          {...testProps("Settings Button")}
          buttonStyle={styles.topButton}
          onPress={() => navigation.navigate("settings")}
          icon={<SettingsIcon />}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[theme.colors.primary]} // Android refresh indicator colors
            tintColor={theme.colors.primary} // iOS refresh indicator color
          />
        }
      >
        <WalletOverview
          isContentVisible={isContentVisible}
          setIsContentVisible={setIsContentVisible}
          loading={loading}
          setIsStablesatModalVisible={setIsStablesatModalVisible}
        />
        {error && (
          <Text style={styles.error} selectable>
            {getErrorMessages(error)}
          </Text>
        )}
        <View style={styles.listItemsContainer}>
          <View style={styles.listItems}>
            {buttons.map((item) => (
              <View key={item.title} style={styles.largeButton}>
                <GaloyIconButton
                  {...testProps(item.title)}
                  name={item.icon}
                  size="large"
                  text={item.title}
                  onPress={() => onMenuClick(item.target)}
                />
              </View>
            ))}
          </View>
        </View>

        {recentTransactionsData ? (
          <View style={styles.transactionContainer}>
            <TouchableWithoutFeedback
              style={styles.recentTransaction}
              onPress={() => onMenuClick("transactionHistory")}
            >
              <Text type="p1" bold {...testProps(recentTransactionsData.title)}>
                {recentTransactionsData?.title}
              </Text>
            </TouchableWithoutFeedback>
            {recentTransactionsData?.details}
          </View>
        ) : (
          <View style={styles.noTransaction}>
            <Text type="p1" bold>
              {LL.TransactionScreen.noTransaction()}
            </Text>
          </View>
        )}
        <AppUpdate />
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollView: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  listItemsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    marginHorizontal: 30,
    borderRadius: 12,
    backgroundColor: colors.whiteOrDarkGrey,
  },
  listItems: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  background: {
    color: colors.lighterGreyOrBlack,
  },
  buttonContainerStyle: {
    marginTop: 16,
    width: "80%",
  },
  noTransaction: {
    alignItems: "center",
  },
  text: {
    color: colors.grey5,
    fontSize: 20,
  },
  titleStyle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    height: 34,
    top: -22,
  },
  buttonStyle: {
    borderColor: colors.primary,
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.whiteOrDarkGrey,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderColor: colors.lighterGreyOrBlack,
    borderBottomWidth: 2,
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
    backgroundColor: colors.whiteOrDarkGrey,
    borderRadius: 38,
    width: 45,
    height: 45,
  },
  balanceHeaderContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  error: {
    alignSelf: "center",
    color: colors.error,
  },
}))
