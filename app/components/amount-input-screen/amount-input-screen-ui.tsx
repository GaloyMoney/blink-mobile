import * as React from "react"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, Text } from "@rneui/themed"
import { View } from "react-native"
import { GaloyIconButton } from "../atomic/galoy-icon-button"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloyErrorBox } from "../atomic/galoy-error-box"
import { CurrencyKeyboard } from "../currency-keyboard"
import { Key } from "./number-pad-reducer"

export type AmountInputScreenUIProps = {
  primaryCurrencySymbol?: string
  primaryCurrencyFormattedAmount?: string
  primaryCurrencyCode: string
  secondaryCurrencySymbol?: string
  secondaryCurrencyFormattedAmount?: string
  secondaryCurrencyCode?: string
  errorMessage?: string
  setAmountDisabled?: boolean
  onKeyPress: (key: Key) => void
  onToggleCurrency?: () => void
  onClearAmount: () => void
  onSetAmountPress?: () => void
  goBack: () => void
}

export const AmountInputScreenUI: React.FC<AmountInputScreenUIProps> = ({
  primaryCurrencySymbol,
  primaryCurrencyFormattedAmount,
  primaryCurrencyCode,
  secondaryCurrencySymbol,
  secondaryCurrencyFormattedAmount,
  secondaryCurrencyCode,
  errorMessage,
  onKeyPress,
  onToggleCurrency,
  onSetAmountPress,
  setAmountDisabled,
  goBack,
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  return (
    <View style={styles.amountInputScreenContainer}>
      <View style={styles.headerContainer}>
        <Text type={"h1"}>{LL.AmountInputScreen.enterAmount()}</Text>
        <GaloyIconButton iconOnly={true} size={"medium"} name="close" onPress={goBack} />
      </View>
      <View style={styles.bodyContainer}>
        <View style={styles.amountContainer}>
          <View style={styles.primaryAmountContainer}>
            {primaryCurrencySymbol && (
              <Text style={styles.primaryCurrencySymbol}>{primaryCurrencySymbol}</Text>
            )}
            {primaryCurrencyFormattedAmount ? (
              <Text style={styles.primaryNumberText}>
                {primaryCurrencyFormattedAmount}
              </Text>
            ) : (
              <Text style={styles.faintPrimaryNumberText}>0</Text>
            )}
            <Text style={styles.primaryCurrencyCodeText}>{primaryCurrencyCode}</Text>
          </View>
          {Boolean(secondaryCurrencyFormattedAmount) && (
            <>
              <View style={styles.swapContainer}>
                <View style={styles.horizontalLine} />
                <GaloyIconButton
                  size={"large"}
                  name="transfer"
                  onPress={onToggleCurrency}
                />
                <View style={styles.horizontalLine} />
              </View>
              <View style={styles.secondaryAmountContainer}>
                <Text style={styles.secondaryAmountText}>
                  {secondaryCurrencySymbol}
                  {secondaryCurrencyFormattedAmount}
                </Text>
                <Text style={styles.secondaryAmountCurrencyCodeText}>
                  {secondaryCurrencyCode}
                </Text>
              </View>
            </>
          )}
        </View>
        <View style={styles.infoContainer}>
          {errorMessage && <GaloyErrorBox errorMessage={errorMessage} />}
        </View>
        <View style={styles.keyboardContainer}>
          <CurrencyKeyboard onPress={onKeyPress} />
        </View>
        <GaloyPrimaryButton
          disabled={!onSetAmountPress || setAmountDisabled}
          onPress={onSetAmountPress}
          title={LL.AmountInputScreen.setAmount()}
        />
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  amountInputScreenContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomColor: colors.primary4,
    borderBottomWidth: 1,
  },
  amountContainer: {
    marginBottom: 16,
  },
  primaryAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryCurrencySymbol: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "bold",
  },
  primaryNumberText: {
    fontSize: 28,
    lineHeight: 32,
    flex: 1,
    fontWeight: "bold",
  },
  faintPrimaryNumberText: {
    fontSize: 28,
    lineHeight: 32,
    flex: 1,
    fontWeight: "bold",
    color: colors.grey3,
  },
  primaryCurrencyCodeText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "bold",
    textAlign: "right",
  },
  secondaryAmountContainer: {
    flexDirection: "row",
  },
  secondaryAmountText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "bold",
    flex: 1,
  },
  secondaryAmountCurrencyCodeText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "bold",
  },
  swapContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 8,
  },
  horizontalLine: {
    borderBottomColor: colors.primary4,
    borderBottomWidth: 1,
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  bodyContainer: {
    flex: 1,
    padding: 24,
  },
  buttonContainer: {},
  keyboardContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
}))
