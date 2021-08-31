import * as React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { StyleProp, Text, TouchableHighlight, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { CurrencyType } from "../../utils/enum"
import { TextCurrency } from "../text-currency/text-currency"
import { useState } from "react"
import { useIsFocused } from "@react-navigation/native"
import {
  saveWalkThroughToolTipSettings,
  WALKTHROUGH_TOOL_TIP,
} from "../../graphql/client-only-query"
import Tooltip from "react-native-walkthrough-tooltip"
import Icon from "react-native-vector-icons/Entypo"
import { useQuery } from "@apollo/client"

const styles = EStyleSheet.create({
  amount: {
    alignItems: "center",
    flexDirection: "column",
    height: 42, // FIXME should be dynamic?
    position: "absolute",
    top: "25rem",
    width: "250rem",
  },

  balanceText: {
    color: palette.midGrey,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  container: {
    alignItems: "flex-end",
    flexDirection: "row",
  },

  header: {
    alignItems: "center",
    marginBottom: "32rem",
    marginTop: "32rem",
    minHeight: "75rem",
  },

  hiddenBalanceIcon: {
    fontSize: "25rem",
    marginTop: "13rem",
  },

  subCurrencyText: {
    color: palette.darkGrey,
    fontSize: "16rem",
  },

  text: {
    color: palette.darkGrey,
    fontSize: 32,
  },
  touchableHighlightColor: "#ffffff00",
})

export interface BalanceHeaderProps {
  currency: CurrencyType
  amount: number
  amountOtherCurrency?: number
  loading?: boolean
  style?: StyleProp<ViewStyle>
  securitySettings?: boolean
}

const Loader = () => (
  <ContentLoader
    height={40}
    width={120}
    speed={1.2}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <Rect x="0" y="12" rx="4" ry="4" width="120" height="28" />
    {/* <Rect x="30" y="35" rx="4" ry="4" width="60" height="10" /> */}
  </ContentLoader>
)

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  currency,
  amount,
  amountOtherCurrency = null,
  loading = false,
  style,
  securitySettings,
}: BalanceHeaderProps) => {
  const { data: toolTipSettings } = useQuery(WALKTHROUGH_TOOL_TIP)
  const [hideBalance, setHideBalance] = useState<boolean | string>(
    securitySettings,
  )
  const [showToolTip, setShowToolTip] = useState<boolean | null>(null)
  const isFocused = useIsFocused()

  React.useEffect(() => {
      setTimeout(function () {
        setShowToolTip( toolTipSettings?.walkThroughToolTipSettings )
      }, 1000)
    // note: using the toolTipSettings dependency will cause this to fire too early. Need to wait for component to be in focus
    // eslint-disable-next-line
  },[isFocused])

  React.useEffect(() => {
      setHideBalance(securitySettings)
  }, [isFocused, securitySettings])

  const handleToolTipClose = async () => {
    setShowToolTip(await saveWalkThroughToolTipSettings(false))
  }

  const otherCurrency = currency === CurrencyType.BTC ? CurrencyType.USD : "sats"
  const hiddenBalanceSet = () => {
    return (
      <>
        <Tooltip
          isVisible={showToolTip}
          content={<Text>{translate("BalanceHeader.toolTipHiddenBalance")}</Text>}
          placement="top"
          onClose={handleToolTipClose}
        >
          <TouchableHighlight
            underlayColor={styles.touchableHighlightColor}
            onPress={() => {
              setHideBalance(null)
            }}
          >
            <Icon style={styles.hiddenBalanceIcon} name="eye" />
          </TouchableHighlight>
        </Tooltip>
      </>
    )
  }

  const defaultBalanceHeader = () => {
    const subHeader =
      amountOtherCurrency !== null ? (
        <TextCurrency
          amount={amountOtherCurrency}
          currency={otherCurrency}
          style={styles.subCurrencyText}
        />
      ) : null
    return (
      <View style={styles.amount}>
        <View style={styles.container}>
          {loading && <Loader />}
          {!loading && (
            <TouchableHighlight
              underlayColor={styles.touchableHighlightColor}
              onPress={() => {
                setHideBalance(true)
              }}
            >
              <TextCurrency
                amount={amount}
                currency={currency === CurrencyType.BTC ? "sats" : CurrencyType.USD}
                style={styles.text}
              />
            </TouchableHighlight>
          )}
        </View>
        {!loading && subHeader}
      </View>
    )
  }
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.balanceText}>{translate("BalanceHeader.currentBalance")}</Text>
      {hideBalance && hiddenBalanceSet()}
      {!hideBalance && defaultBalanceHeader()}
    </View>
  )
}
