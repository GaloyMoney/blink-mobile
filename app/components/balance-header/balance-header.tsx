import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { StyleProp, Text, TouchableHighlight, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import Tooltip from "react-native-walkthrough-tooltip"
import { palette } from "../../theme/palette"
import { TextCurrencyForAmount } from "../text-currency/text-currency"
import { useIsFocused } from "@react-navigation/native"
import { useHiddenBalanceToolTip, useHideBalance } from "../../hooks"
import { saveHiddenBalanceToolTip } from "../../graphql/client-only-query"
import { useApolloClient } from "@apollo/client"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  balanceHeaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  balanceAmountContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  balanceText: {
    color: palette.midGrey,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },

  hiddenBalanceContainer: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
  },

  hiddenBalanceIcon: {
    fontSize: "25rem",
  },

  subCurrencyText: {
    color: palette.darkGrey,
    fontSize: "16rem",
    textAlign: "center",
  },

  text: {
    color: palette.darkGrey,
    fontSize: 32,
  },
})

export interface BalanceHeaderProps {
  showSecondaryCurrency?: boolean
  loading?: boolean
  style?: StyleProp<ViewStyle>
  btcWalletBalance?: number
  btcWalletValueInUsd?: number
  usdWalletBalance?: number
}

const Loader = () => (
  <ContentLoader
    height={100}
    width={100}
    speed={1.2}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <Rect x="0" y="0" rx="4" ry="4" width="100" height="40" />
    <Rect x="0" y="45" rx="4" ry="4" width="100" height="20" />
  </ContentLoader>
)

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  showSecondaryCurrency = false,
  loading = false,
  style,
  btcWalletBalance,
  btcWalletValueInUsd,
  usdWalletBalance,
}: BalanceHeaderProps) => {
  const { LL } = useI18nContext()
  return (
    <View style={[styles.balanceHeaderContainer, style]}>
      <Text testID="currentBalance" style={styles.balanceText}>
        {LL.BalanceHeader.currentBalance()}
      </Text>
      <View style={styles.balanceAmountContainer}>
        {loading ? (
          <Loader />
        ) : (
          <BalanceHeaderDisplay
            showSecondaryCurrency={showSecondaryCurrency}
            btcWalletBalance={btcWalletBalance}
            btcWalletValueInUsd={btcWalletValueInUsd}
            usdWalletBalance={usdWalletBalance}
          />
        )}
      </View>
    </View>
  )
}

export const BalanceHeaderDisplay: React.FC<BalanceHeaderProps> = ({
  showSecondaryCurrency = false,
  btcWalletBalance,
  btcWalletValueInUsd,
  usdWalletBalance,
}: BalanceHeaderProps) => {
  const client = useApolloClient()
  const hideBalance = useHideBalance()
  const hiddenBalanceToolTip = useHiddenBalanceToolTip()
  const isFocused = useIsFocused()
  const [showToolTip, setShowToolTip] = useState<boolean>(false)
  const [mHideBalance, setHideBalance] = useState<boolean>(hideBalance)
  const { LL } = useI18nContext()
  const closeToolTip = useCallback(async () => {
    setShowToolTip(await saveHiddenBalanceToolTip(client, false))
  }, [client])

  useEffect((): void | (() => void) => {
    // Need to wait for the component to be in focus
    if (isFocused) {
      const timerId = setTimeout(function focusedToolTip() {
        if (isFocused) {
          setShowToolTip(hiddenBalanceToolTip)
        }
      }, 1000)
      return () => clearTimeout(timerId)
    }
  }, [hiddenBalanceToolTip, isFocused, showToolTip])

  useEffect(() => {
    if (showToolTip && !isFocused) {
      closeToolTip()
    }
  }, [closeToolTip, isFocused, showToolTip])

  useEffect(() => {
    setHideBalance(hideBalance)
  }, [hideBalance, isFocused])

  const currency = "USD"
  const otherCurrency = "BTC"

  const hiddenBalanceSet = () => {
    return (
      <>
        <Tooltip
          isVisible={showToolTip}
          content={<Text>{LL.BalanceHeader.hiddenBalanceToolTip()}</Text>}
          placement="bottom"
          onClose={closeToolTip}
        >
          <TouchableHighlight
            underlayColor="#ffffff00"
            onPress={() => {
              if (showToolTip) {
                closeToolTip()
              }
              setHideBalance(false)
            }}
            style={styles.hiddenBalanceTouchableHighlight}
          >
            <Icon style={styles.hiddenBalanceIcon} name="eye" />
          </TouchableHighlight>
        </Tooltip>
      </>
    )
  }

  const defaultBalanceHeader = () => {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          underlayColor="#ffffff00"
          onPress={() => setHideBalance(true)}
        >
          <TextCurrencyForAmount
            currency={currency}
            amount={usdWalletBalance / 100 + btcWalletValueInUsd}
            style={styles.text}
          />
        </TouchableHighlight>

        {showSecondaryCurrency && (
          <TextCurrencyForAmount
            amount={btcWalletBalance}
            currency={otherCurrency}
            satsIconSize={12}
            style={styles.subCurrencyText}
          />
        )}
      </View>
    )
  }

  return (
    <>
      {!mHideBalance && defaultBalanceHeader()}
      <View style={styles.hiddenBalanceContainer}>
        {mHideBalance && hiddenBalanceSet()}
      </View>
    </>
  )
}
