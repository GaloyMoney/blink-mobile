import React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Pressable, View } from "react-native"

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
import { getBtcWallet, getUsdWallet } from "@app/graphql/wallets-utils"

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
}

const WalletOverview: React.FC<Props> = ({
  loading,
  isContentVisible,
  setIsContentVisible,
  setIsStablesatModalVisible,
}) => {
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { data } = useWalletOverviewScreenQuery({ skip: !isAuthed })

  const { formatMoneyAmount, displayCurrency, moneyAmountToDisplayCurrencyString } =
    useDisplayCurrency()

  let btcInDisplayCurrencyFormatted: string | undefined = "$0.00"
  let usdInDisplayCurrencyFormatted: string | undefined = "$0.00"
  let btcInUnderlyingCurrency: string | undefined = "0 sat"
  let usdInUnderlyingCurrency: string | undefined = undefined

  if (isAuthed) {
    const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
    const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

    const btcWalletBalance = toBtcMoneyAmount(btcWallet?.balance ?? NaN)

    const usdWalletBalance = toUsdMoneyAmount(usdWallet?.balance ?? NaN)

    btcInDisplayCurrencyFormatted = moneyAmountToDisplayCurrencyString({
      moneyAmount: btcWalletBalance,
      isApproximate: true,
    })

    usdInDisplayCurrencyFormatted = moneyAmountToDisplayCurrencyString({
      moneyAmount: usdWalletBalance,
      isApproximate: displayCurrency !== WalletCurrency.Usd,
    })

    btcInUnderlyingCurrency = formatMoneyAmount({ moneyAmount: btcWalletBalance })

    if (displayCurrency !== WalletCurrency.Usd) {
      usdInUnderlyingCurrency = formatMoneyAmount({ moneyAmount: usdWalletBalance })
    }
  }

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
      <View style={[styles.separator, styles.titleSeparator]}></View>
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
              <Text type="p1" bold>
                {btcInUnderlyingCurrency}
              </Text>
              <Text type="p3">{btcInDisplayCurrencyFormatted}</Text>
            </HideableArea>
          </View>
        )}
      </View>
      <View style={styles.separator}></View>
      <View style={styles.displayTextView}>
        <View style={styles.currency}>
          <GaloyCurrencyBubble currency="USD" />
          <Text type="p1">Stablesats</Text>
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
