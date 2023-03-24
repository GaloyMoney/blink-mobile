import React, { useEffect, useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Pressable, StyleProp, TouchableHighlight, View, ViewStyle } from "react-native"

import { gql } from "@apollo/client"
import {
  useHideBalanceQuery,
  useWalletOverviewScreenQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
// import { testProps } from "@app/utils/testProps"
import { makeStyles, Text, useTheme } from "@rneui/themed"

import { GaloyCurrencyBubble } from "../atomic/galoy-currency-bubble"
import { GaloyIconButton } from "../atomic/galoy-icon-button"
import { GaloyIcon } from "../atomic/galoy-icon"

type HidableAreaProps = {
  hidden: boolean
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

const Loader = ({ styles }: { styles: StyleProp<ViewStyle> }) => (
  <View style={styles}>
    <ContentLoader
      height={"20%"}
      width={"80%"}
      speed={1.2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <Rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
    </ContentLoader>
  </View>
)

const HidableArea = ({ hidden, style, children }: HidableAreaProps) => {
  return (
    <TouchableHighlight style={style} underlayColor="#ffffff00">
      <>{hidden ? <Text>****</Text> : children}</>
    </TouchableHighlight>
  )
}

gql`
  query walletOverviewScreen {
    me {
      defaultAccount {
        id
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
`

type Props = {
  loading: boolean
  setIsStablesatModalVisible: (value: boolean) => void
}

const WalletOverviewRedesigned: React.FC<Props> = ({
  loading,
  setIsStablesatModalVisible,
}) => {
  const isAuthed = useIsAuthed()
  const { theme } = useTheme()
  const styles = useStyles(theme)
  const { data: dataHideBalance } = useHideBalanceQuery()
  const hideBalance = dataHideBalance?.hideBalance || false
  const [visible, setVisible] = useState(hideBalance)

  const { data } = useWalletOverviewScreenQuery({ skip: !isAuthed })
  const { formatMoneyAmount, displayCurrency, moneyAmountToDisplayCurrencyString } =
    useDisplayCurrency()

  let btcInDisplayCurrencyFormatted = "$0.00"
  let usdInDisplayCurrencyFormatted = "$0.00"
  let btcInUnderlyingCurrency = "0 sat"
  let usdInUnderlyingCurrency: string | undefined = undefined

  useEffect(() => {
    setVisible(hideBalance)
  }, [hideBalance])

  if (isAuthed) {
    const btcWalletBalance = toBtcMoneyAmount(
      data?.me?.defaultAccount?.btcWallet?.balance ?? NaN,
    )

    const usdWalletBalance = toUsdMoneyAmount(
      data?.me?.defaultAccount?.usdWallet?.balance ?? NaN,
    )

    btcInDisplayCurrencyFormatted =
      moneyAmountToDisplayCurrencyString(btcWalletBalance) ?? "..."

    usdInDisplayCurrencyFormatted =
      moneyAmountToDisplayCurrencyString(usdWalletBalance) ?? "..."

    btcInUnderlyingCurrency = formatMoneyAmount(btcWalletBalance)

    if (displayCurrency !== WalletCurrency.Usd) {
      usdInUnderlyingCurrency = formatMoneyAmount(usdWalletBalance)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.displayTextView}>
        <Text type="h2" bold>
          My Accounts
        </Text>
        <GaloyIconButton
          name={visible ? "eye" : "eye-slash"}
          size="medium"
          onPress={() => setVisible(!visible)}
        />
      </View>
      <View style={styles.separator}></View>
      <View style={styles.displayTextView}>
        <View style={styles.currency}>
          <GaloyCurrencyBubble currency="BTC" size={"medium"} />
          <Text type="p1">Bitcoin</Text>
        </View>
        {loading ? (
          <Loader styles={styles.loaderContainer} />
        ) : (
          <HidableArea hidden={visible} style={styles.hiddableArea}>
            <Text type="p1" bold>
              {btcInUnderlyingCurrency}
            </Text>
            <Text type="p3">{`~ ${btcInDisplayCurrencyFormatted}`}</Text>
          </HidableArea>
        )}
      </View>
      <View style={styles.separator}></View>
      <View style={styles.displayTextView}>
        <View style={styles.currency}>
          <GaloyCurrencyBubble currency="USD" size={"medium"} />
          <Text type="p1">Stablesats</Text>
          <Pressable onPress={() => setIsStablesatModalVisible(true)}>
            <GaloyIcon
              color={theme.colors.primary3}
              backgroundColor={theme.colors.primary9}
              name="question"
              size={15}
            />
          </Pressable>
        </View>
        {loading ? (
          <Loader styles={styles.loaderContainer} />
        ) : (
          <HidableArea hidden={visible} style={styles.hiddableArea}>
            <Text type="p1" bold>
              {usdInUnderlyingCurrency}
            </Text>
            <Text type="p3">{usdInDisplayCurrencyFormatted}</Text>
          </HidableArea>
        )}
      </View>
    </View>
  )
}

export default WalletOverviewRedesigned

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.white,
    display: "flex",
    flexDirection: "column",
    marginHorizontal: 30,
    borderRadius: 12,
    padding: 15,
  },
  displayTextView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.primary9,
    marginVertical: 10,
  },
  currency: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  hiddableArea: {
    alignItems: "flex-end",
    marginTop: 8,
    height: 35,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}))
