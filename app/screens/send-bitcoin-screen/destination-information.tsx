import { FloorTooltip } from "@app/components/floor-tooltip/floor-tooltip"
import { useI18nContext } from "@app/i18n/i18n-react"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { palette } from "@app/theme"
import { useAppConfig } from "@app/hooks"
import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { DestinationState, SendBitcoinDestinationState } from "./send-bitcoin-reducer"
import { IntraledgerPaymentDestination } from "@galoymoney/client/dist/parsing-v2"
import { InvalidDestinationReason } from "./payment-destination/index.types"

const createToLnAddress = (lnDomain: string) => {
  return (handle: string) => {
    return `${handle}@${lnDomain}`
  }
}

const destinationStateToInformation = (
  sendBitcoinReducerState: SendBitcoinDestinationState,
  translate: TranslationFunctions,
  bankDetails: { bankName: string; lnDomain: string },
) => {
  const { bankName, lnDomain } = bankDetails

  const toLnAddress = createToLnAddress(lnDomain)

  if (sendBitcoinReducerState.destinationState === DestinationState.Entering) {
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
  if (sendBitcoinReducerState.destinationState === DestinationState.Invalid) {
    switch (sendBitcoinReducerState.invalidDestination.invalidReason) {
      case InvalidDestinationReason.InvoiceExpired:
        return {
          error: translate.SendBitcoinDestinationScreen.expiredInvoice(),
        }
      case InvalidDestinationReason.WrongNetwork:
        return {
          error: translate.SendBitcoinDestinationScreen.wrongNetwork(),
        }
      case InvalidDestinationReason.InvalidAmount:
        return {
          error: translate.SendBitcoinDestinationScreen.invalidAmount(),
        }
      case InvalidDestinationReason.UsernameDoesNotExist:
        return {
          error: translate.SendBitcoinDestinationScreen.usernameDoesNotExist({
            lnAddress: toLnAddress(
              (
                sendBitcoinReducerState.invalidDestination
                  .invalidPaymentDestination as IntraledgerPaymentDestination
              ).handle,
            ),
            bankName,
          }),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.usernameDoesNotExistAdvice(),
          },
        }
      case InvalidDestinationReason.SelfPayment:
        return {
          error: translate.SendBitcoinDestinationScreen.selfPaymentError({
            lnAddress: toLnAddress(
              (
                sendBitcoinReducerState.invalidDestination
                  .invalidPaymentDestination as IntraledgerPaymentDestination
              ).handle,
            ),
            bankName,
          }),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.selfPaymentAdvice(),
          },
        }
      case InvalidDestinationReason.LnurlError ||
        InvalidDestinationReason.LnurlUnsupported:
        return {
          error: translate.SendBitcoinDestinationScreen.lnAddressError(),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.lnAddressAdvice(),
          },
        }
      case InvalidDestinationReason.UnknownLightning:
        return {
          error: translate.SendBitcoinDestinationScreen.unknownLightning(),
        }
      case InvalidDestinationReason.UnknownOnchain:
        return {
          error: translate.SendBitcoinDestinationScreen.unknownOnchain(),
        }
      default:
        return {
          error: translate.SendBitcoinDestinationScreen.enterValidDestination(),
          adviceTooltip: {
            text: translate.SendBitcoinDestinationScreen.destinationOptions({ bankName }),
          },
        }
    }
  }

  if (
    sendBitcoinReducerState.destinationState === "valid" &&
    sendBitcoinReducerState.confirmationType
  ) {
    return {
      warning: translate.SendBitcoinDestinationScreen.newBankAddressUsername({
        lnAddress: toLnAddress(sendBitcoinReducerState.confirmationType.username),
        bankName,
      }),
    }
  }

  return {}
}

const styles = StyleSheet.create({
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
  const { appConfig } = useAppConfig()
  const { lnAddressHostname, name } = appConfig.galoyInstance
  const bankDetails = { lnDomain: lnAddressHostname, bankName: name.toUpperCase() }
  const information = destinationStateToInformation(destinationState, LL, bankDetails)

  return (
    <View style={styles.informationContainer}>
      {information.infoTooltip && (
        <FloorTooltip
          type="info"
          size={20}
          title={information.infoTooltip.title}
          text={information.infoTooltip.text}
        />
      )}
      {information.adviceTooltip && (
        <FloorTooltip type="advice" size={20} text={information.adviceTooltip.text} />
      )}
      <View style={styles.textContainer}>
        {information.information && (
          <Text style={styles.informationText}>{information.information}</Text>
        )}
        {information.error && <Text style={styles.errorText}>{information.error}</Text>}
        {information.warning && (
          <Text style={styles.warningText}>{information.warning}</Text>
        )}
      </View>
    </View>
  )
}
