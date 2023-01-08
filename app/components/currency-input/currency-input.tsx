import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { palette } from "@app/theme"
import React, { useEffect, useReducer } from "react"
import { Pressable, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { currencyInputReducer } from "./currency-input-state"
import {
  DisplayAmount,
  DisplayCurrency,
  PaymentAmount,
  WalletCurrency,
} from "@app/types/amounts"
import { CurrencyKeyboard } from "@app/components/currency-keyboard"
import { usePriceConversion } from "@app/hooks"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { addDigit, deleteDigit, togglePrimaryCurrency, updateConversionFunction } from "./actions"

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: palette.white,
  },
  switchButtonContainer: {
    width: "100%",
  },
  horizontalLine: {
    position: "absolute",
    bottom: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: palette.transferIconGrey,
    width: "100%",
  },
  switchButton: {
    alignSelf: "center",
  },
  primaryCurrencyDisplay: {
    color: palette.greyFive,
    fontFamily: "Source Sans Pro",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: 28,
    lineHeight: 32,
  },
  secondaryCurrencyDisplay: {
    color: palette.greyFive,
    fontFamily: "Source Sans Pro",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 24,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  amountContainer: { flex: 1, justifyContent: "space-evenly", width: "100%" },
  keyboardContainer: { width: "100%", flex: 4 },
  buttonContainer: { width: "100%", flex: 1, justifyContent: "center" },
  headerContainer: {
    marginBottom: 20,
    width: "100%",
    height: 50,
    justifyContent: "center",
  },
  headerTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  closeSymbol: {
    fontFamily: "Source Sans Pro",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: 28,
    lineHeight: 30,
  },
  horizontalLineHeader: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: palette.transferIconGrey,
    width: "100%",
  },
})

type CurrencyInputScreenProps = {
  amountCallback: (callbackAmounts: {
    primaryAmount: PaymentAmount<WalletCurrency>
    secondaryAmount: DisplayAmount<DisplayCurrency>
  }) => void
  primaryCurrency: DisplayCurrency
  secondaryCurrency: DisplayCurrency
  initialAmount?: PaymentAmount<WalletCurrency>
  close: () => void
}

export const CurrencyInput = ({
  amountCallback,
  primaryCurrency: initialPrimaryCurrency,
  secondaryCurrency: initialSecondaryCurrency,
  initialAmount,
  close,
}: CurrencyInputScreenProps) => {
  const { LL } = useI18nContext()
  const { formatToCurrency } = useDisplayCurrency()
  const { convertDisplayAmount, convertCurrencyAmount } = usePriceConversion()
  const [state, dispatch] = useReducer(currencyInputReducer, {
    primaryAmount: {
      currency: initialPrimaryCurrency,
      amount: initialAmount ? initialAmount.amount : 0,
    },
    secondaryAmount: {
      currency: initialSecondaryCurrency,
      amount: initialAmount
        ? convertCurrencyAmount({
            from: initialPrimaryCurrency,
            to: initialSecondaryCurrency,
            amount: initialAmount.amount,
          })
        : 0,
    },
    conversionFunction: convertDisplayAmount
  })

  useEffect(() => {
    dispatch(updateConversionFunction(convertDisplayAmount))
  },
    // I've deliberately left the `convertDisplayAmount` function out of the dependency array so that the
    // secondary value does not update while the user is entering a value
    // eslint-disable-next-line react-hooks/exhaustive-deps
   [dispatch])

  useEffect(
    () => {
      if (state.secondaryAmount.currency === "BTC") {
        // dispatch({
        //   type: ACTIONS.UPDATE_PRIMARY_DISPLAY_VALUE,
        //   payload: formatToCurrency(
        //     state.primaryAmount.amount,
        //     state.primaryAmount.currency,
        //   ),
        // })
        // dispatch({
        //   type: ACTIONS.UPDATE_SECONDARY_AMOUNT,
        //   payload: {
        //     ...convertDisplayAmount(state.primaryAmount, state.secondaryAmount.currency),
        //     display: formatToCurrency(
        //       convertCurrencyAmount({
        //         from: state.primaryAmount.currency,
        //         to: state.secondaryAmount.currency,
        //         amount: state.primaryAmount.amount,
        //       }) / 100,
        //       state.secondaryAmount.currency,
        //     ),
        //   },
        // })
      } else {
        // dispatch({
        //   type: ACTIONS.UPDATE_PRIMARY_DISPLAY_VALUE,
        //   payload: formatToCurrency(
        //     state.primaryAmount.amount,
        //     state.primaryAmount.currency,
        //   ),
        // })
        // dispatch({
        //   type: ACTIONS.UPDATE_SECONDARY_AMOUNT,
        //   payload: {
        //     ...convertDisplayAmount(state.primaryAmount, state.secondaryAmount.currency),
        //     display: formatToCurrency(
        //       convertCurrencyAmount({
        //         from: state.primaryAmount.currency,
        //         to: state.secondaryAmount.currency,
        //         amount: state.primaryAmount.amount,
        //       }),
        //       state.secondaryAmount.currency,
        //     ),
        //   },
        // })
      }
    },

    [
      formatToCurrency,
      state.primaryAmount.amount,
      state.primaryAmount.currency,
      state.secondaryAmount.currency,
    ],
  )
  const currenciesMatch = initialPrimaryCurrency === initialSecondaryCurrency
  const { primaryAmount, secondaryAmount } = state

  const onKeyboardPress = (pressed) => {
    if (pressed === "\b") {
      dispatch(deleteDigit())
      return
    }
    dispatch(addDigit(pressed))
  }
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTextRow}>
        <Text type={"h1"} bold>
          {LL.CurrencyInputScreen.title()}
          </Text>
          <Pressable onPress={() => close()}>
            <Text style={styles.closeSymbol}>X</Text>
          </Pressable>
        </View>
        <View style={styles.horizontalLineHeader} />
      </View>
      <View style={styles.amountContainer}>
        <View style={styles.amountRow}>
          <Text style={styles.primaryCurrencyDisplay}>{primaryAmount.display}</Text>
          <Text style={styles.primaryCurrencyDisplay}>{primaryAmount.currency}</Text>
        </View>
        {!currenciesMatch && (
          <>
            <View style={styles.switchButtonContainer}>
              <View style={styles.horizontalLine} />
              <Pressable
                onPress={() =>
                  dispatch(togglePrimaryCurrency())
                }
              >
                <GaloyIcon name="switch-currency" size={50} style={styles.switchButton} />
              </Pressable>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.secondaryCurrencyDisplay}>
                {secondaryAmount.display}
              </Text>
              <Text style={styles.primaryCurrencyDisplay}>
                {secondaryAmount.currency}
              </Text>
            </View>
          </>
        )}
      </View>
      <View style={styles.keyboardContainer}>
        <CurrencyKeyboard onPress={onKeyboardPress} />
      </View>
      <View style={styles.buttonContainer}>
        <GaloyPrimaryButton 
        title={"Set Amount"}
        onPress={() => {
          // TODO forcing all fiat amounts to be returned as USD until we have Display Currency exchange rates available
          amountCallback({
            primaryAmount: {
              amount: primaryAmount.amount,
              currency:
                primaryAmount.currency === "BTC"
                  ? ("BTC" as WalletCurrency)
                  : ("USD" as WalletCurrency),
            },
            secondaryAmount,
          })
          close()
        }}
        disabled={primaryAmount.amount === 0}
        />
      </View>
    </View>
  )
}
