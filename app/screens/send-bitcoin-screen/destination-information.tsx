import { FloorTooltip } from "@app/components/floor-tooltip/floor-tooltip"
import { useI18nContext } from "@app/i18n/i18n-react"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { palette } from "@app/theme"
import React from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { SendBitcoinDestinationState } from "./send-bitcoin-reducer"
import { lnDomain, bankName } from "./send-bitcoin-destination-screen"
import { IntraledgerPaymentDestination } from "@galoymoney/client/dist/parsing-v2"

const toLnAddress = (handle: string) => {
  return `${handle}@${lnDomain}`
}

const destinationStateToInformation = (
  destinationState: SendBitcoinDestinationState,
  translate: TranslationFunctions,
) => {
  if (destinationState.destinationState === "entering") {
    return {
      information: translate.SendBitcoinDestinationScreen.usernameNowAddress({
        bankName,
      }),
      infoTooltip: {
        title: translate.SendBitcoinDestinationScreen.usernameNowAddress({ bankName }),
        text: translate.SendBitcoinDestinationScreen.usernameNowAddressInfo({
          bankName,
          lnDomain,
        }),
      },
    }
  }

  if (destinationState.destinationState === "invalid") {
    switch (destinationState.invalidReason) {
      case "unknown-destination":
        return {
          error: translate.SendBitcoinDestinationScreen.enterValidDestination(),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.destinationOptions({ bankName }),
          },
        }
      case "expired-invoice":
        return {
          error: translate.SendBitcoinDestinationScreen.expiredInvoice(),
        }
      case "wrong-network":
        return {
          error: translate.SendBitcoinDestinationScreen.wrongNetwork(),
        }
      case "invalid-amount":
        return {
          error: translate.SendBitcoinDestinationScreen.invalidAmount(),
        }
      case "username-does-not-exist":
        return {
          error: translate.SendBitcoinDestinationScreen.usernameDoesNotExist({
            lnAddress: toLnAddress(
              (destinationState.parsedPaymentDestination as IntraledgerPaymentDestination)
                .handle,
            ),
            bankName,
          }),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.usernameDoesNotExistAdvice(),
          },
        }
      case "self-payment":
        return {
          error: translate.SendBitcoinDestinationScreen.selfPaymentError({
            lnAddress: toLnAddress(
              (destinationState.parsedPaymentDestination as IntraledgerPaymentDestination)
                .handle,
            ),
            bankName,
          }),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.selfPaymentAdvice(),
          },
        }
      case "lnurl-error":
        return {
          error: translate.SendBitcoinDestinationScreen.lnAddressError(),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.lnAddressAdvice(),
          },
        }
      case "unknown-lightning":
        return {
          error: translate.SendBitcoinDestinationScreen.unknownLightning(),
        }
      case "unknown-onchain":
        return {
          error: translate.SendBitcoinDestinationScreen.unknownOnchain(),
        }
    }
  }

  if (
    destinationState.destinationState === "valid" &&
    destinationState.confirmationType
  ) {
    return {
      warning: translate.SendBitcoinDestinationScreen.newBankAddressUsername({
        lnAddress: toLnAddress(destinationState.confirmationType.username),
        bankName,
      }),
    }
  }

  return {}
}

const styles = EStyleSheet.create({
  informationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  informationText: {},
  errorText: {
    color: palette.red,
  },
  warningText: {
    color: palette.orange,
  },
  textContainer: {
    flex: 1,
  },
})

export const DestinationInformation = ({
  destinationState,
}: {
  destinationState: SendBitcoinDestinationState
}) => {
  const { LL } = useI18nContext()
  const information = destinationStateToInformation(destinationState, LL)

  return (
    <View style={styles.informationContainer}>
      {information.infoTooltip ? (
        <FloorTooltip
          type="info"
          size={12}
          title={information.infoTooltip.title}
          text={information.infoTooltip.text}
        />
      ) : null}
      {information.adviceTooltip ? (
        <FloorTooltip type="advice" size={12} text={information.adviceTooltip.text} />
      ) : null}
      <View style={styles.textContainer}>
        {information.information ? (
          <Text style={styles.informationText}>{information.information}</Text>
        ) : null}
        {information.error ? (
          <Text style={styles.errorText}>{information.error}</Text>
        ) : null}
        {information.warning ? (
          <Text style={styles.warningText}>{information.warning}</Text>
        ) : null}
      </View>
    </View>
  )
}
