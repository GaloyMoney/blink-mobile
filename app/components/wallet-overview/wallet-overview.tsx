import React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Pressable, View, Alert } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack" // import this at the top

import { gql } from "@apollo/client"
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
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { getBtcWallet, getUsdWallet } from "@app/graphql/wallets-utils"

// import Breez SDK Wallet
import useBreezBalance from "@app/hooks/useBreezBalance"

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

gql`
  query walletOverviewScreen {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

type Props = {
  loading: boolean
  isContentVisible: boolean
  setIsContentVisible: React.Dispatch<React.SetStateAction<boolean>>
  setIsStablesatModalVisible: (value: boolean) => void
  navigation?: StackNavigationProp<RootStackParamList, "conversionDetails">
}

const WalletOverview: React.FC<Props> = ({
  loading,
  isContentVisible,
  setIsContentVisible,
  setIsStablesatModalVisible,
  navigation,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isGaloyWalletVisible, setIsGaloyWalletVisible] = React.useState(false)
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { data } = useWalletOverviewScreenQuery({ skip: !isAuthed })

  const { formatMoneyAmount, displayCurrency, moneyAmountToDisplayCurrencyString } =
    useDisplayCurrency()

  const breezBalance = 0 // useBreezBalance()
  let btcInDisplayCurrencyFormatted: string | undefined = "$-0.01"
  let usdInDisplayCurrencyFormatted: string | undefined = "$-0.01"
  let extBtcInDisplayCurrencyFormatted: string | undefined = "$-0.01"
  let extUsdInDisplayCurrencyFormatted: string | undefined = "$-0.01"
  let btcInUnderlyingCurrency: string | undefined = "-1 sat"
  let usdInUnderlyingCurrency: string | undefined = undefined
  let extBtcInUnderlyingCurrency: string | undefined = "-1 sat"
  let extUsdInUnderlyingCurrency: string | undefined = undefined

  if (isAuthed) {
    const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
    const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)
    // const extBtcWallet = getBtcWallet(data?.me?.defaultAccount?.externalWallets)
    const extUsdWallet = getUsdWallet(data?.me?.defaultAccount?.externalWallets)

    const btcWalletBalance = toBtcMoneyAmount(btcWallet?.balance ?? NaN)

    const usdWalletBalance = toUsdMoneyAmount(usdWallet?.balance ?? NaN)

    const extBtcWalletBalance = toBtcMoneyAmount(breezBalance ?? NaN)

    const extUsdWalletBalance = toUsdMoneyAmount(extUsdWallet?.balance ?? NaN)

    btcInDisplayCurrencyFormatted = moneyAmountToDisplayCurrencyString({
      moneyAmount: btcWalletBalance,
      isApproximate: true,
    })

    usdInDisplayCurrencyFormatted = moneyAmountToDisplayCurrencyString({
      moneyAmount: usdWalletBalance,
      isApproximate: displayCurrency !== WalletCurrency.Usd,
    })

    extBtcInDisplayCurrencyFormatted = moneyAmountToDisplayCurrencyString({
      moneyAmount: extBtcWalletBalance,
      isApproximate: true,
    })

    extUsdInDisplayCurrencyFormatted = moneyAmountToDisplayCurrencyString({
      moneyAmount: extUsdWalletBalance,
      isApproximate: displayCurrency !== WalletCurrency.Usd,
    })

    btcInUnderlyingCurrency = formatMoneyAmount({ moneyAmount: btcWalletBalance })

    if (displayCurrency !== WalletCurrency.Usd) {
      usdInUnderlyingCurrency = formatMoneyAmount({ moneyAmount: usdWalletBalance })
    }

    extBtcInUnderlyingCurrency = formatMoneyAmount({ moneyAmount: extBtcWalletBalance })

    if (displayCurrency !== WalletCurrency.Usd) {
      extUsdInUnderlyingCurrency = formatMoneyAmount({ moneyAmount: extUsdWalletBalance })
    }
  }

  React.useEffect(() => {
    console.log("extBtcWalletBalance", extBtcInDisplayCurrencyFormatted)
    console.log("extUsdWalletBalance", extUsdInDisplayCurrencyFormatted)
  }, [extBtcInDisplayCurrencyFormatted, extUsdInDisplayCurrencyFormatted])

  const toggleIsContentVisible = () => {
    setIsContentVisible((prevState) => !prevState)
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
      <View style={styles.displayTextView}>
        <View style={styles.currency}>
          <GaloyCurrencyBubble currency="USD" />
          <Text type="p1">eCash</Text>
          <Pressable
            onPress={() => {
              if (navigation) {
                navigation.navigate("conversionDetails")
              } else {
                Alert.alert(
                  "Business Account Required",
                  "Please sign up for a Business Account to access the to Cash Out Screen.",
                )
              }
            }}
          >
            <GaloyIcon color={colors.green} name="bank" size={18} />
          </Pressable>
        </View>
        {loading ? (
          <Loader />
        ) : (
          <View style={styles.hideableArea}>
            <HideableArea isContentVisible={isContentVisible}>
              {extUsdInUnderlyingCurrency ? (
                <Text type="p1" bold>
                  {extUsdInUnderlyingCurrency}
                </Text>
              ) : null}
              <Text
                type={extUsdInUnderlyingCurrency ? "p3" : "p1"}
                bold={!extUsdInUnderlyingCurrency}
              >
                {extUsdInDisplayCurrencyFormatted}
              </Text>
            </HideableArea>
          </View>
        )}
      </View>
      {/* End of IBEX Wallet overview */}
      {/* Start of Breez SDK Wallet overview */}
      <View style={styles.separator}></View>
      <View style={styles.displayTextView}>
        <View style={styles.currency}>
          <GaloyCurrencyBubble currency="BTC" />
          <Text type="p1">Bitcoin</Text>
        </View>
        {loading ? (
          <Loader />
        ) : (
          <View style={styles.hideableArea}>
            <HideableArea isContentVisible={isContentVisible}>
              {extBtcInUnderlyingCurrency ? (
                <Text type="p1" bold>
                  {extBtcInUnderlyingCurrency}
                </Text>
              ) : null}
              <Text
                type={extBtcInUnderlyingCurrency ? "p3" : "p1"}
                bold={!extBtcInUnderlyingCurrency}
              >
                {extBtcInDisplayCurrencyFormatted}
              </Text>
            </HideableArea>
          </View>
        )}
      </View>
      {/* End of Breez SDK Wallet overview */}
      {isGaloyWalletVisible ? (
        <View>
          <View style={styles.separator}></View>
          <View style={styles.displayTextView}>
            <View style={styles.currency}>
              <GaloyCurrencyBubble currency="BTC" />
              <Text type="p1">Bitcoin</Text>
            </View>
            {loading ? (
              <Loader />
            ) : (
              <View style={styles.hideableArea}>
                <HideableArea isContentVisible={isContentVisible}>
                  {btcInUnderlyingCurrency ? (
                    <Text type="p1" bold>
                      {btcInUnderlyingCurrency}
                    </Text>
                  ) : null}
                  <Text
                    type={btcInUnderlyingCurrency ? "p3" : "p1"}
                    bold={!btcInUnderlyingCurrency}
                  >
                    {btcInDisplayCurrencyFormatted}
                  </Text>
                </HideableArea>
              </View>
            )}
          </View>
          <View style={styles.separator}></View>
          <View style={styles.displayTextView}>
            <View style={styles.currency}>
              <GaloyCurrencyBubble currency="USD" />
              <Text type="p1">StableSats</Text>
              <Pressable onPress={() => setIsStablesatModalVisible(true)}>
                <GaloyIcon color={colors.grey1} name="question" size={18} />
              </Pressable>
            </View>
            {loading ? (
              <Loader />
            ) : (
              <View style={styles.hideableArea}>
                <HideableArea isContentVisible={isContentVisible}>
                  {usdInUnderlyingCurrency ? (
                    <Text type="p1" bold>
                      {usdInUnderlyingCurrency}
                    </Text>
                  ) : null}
                  <Text
                    type={usdInUnderlyingCurrency ? "p3" : "p1"}
                    bold={!usdInUnderlyingCurrency}
                  >
                    {usdInDisplayCurrencyFormatted}
                  </Text>
                </HideableArea>
              </View>
            )}
          </View>
        </View>
      ) : null}
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
}))
