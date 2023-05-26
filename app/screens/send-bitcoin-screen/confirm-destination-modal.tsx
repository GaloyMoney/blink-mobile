import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { CheckBox, Text, makeStyles, useTheme } from "@rneui/themed"
import React, { Dispatch, useCallback, useState } from "react"
import { ScrollView, View } from "react-native"
import Modal from "react-native-modal"
import { testProps } from "../../utils/testProps"
import {
  SendBitcoinDestinationAction,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"

export type ConfirmDestinationModalProps = {
  destinationState: SendBitcoinDestinationState
  dispatchDestinationStateAction: Dispatch<SendBitcoinDestinationAction>
}

export const ConfirmDestinationModal: React.FC<ConfirmDestinationModalProps> = ({
  destinationState,
  dispatchDestinationStateAction,
}) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()
  const { appConfig } = useAppConfig()
  const { lnAddressHostname: lnDomain, name: bankName } = appConfig.galoyInstance
  const [confirmationEnabled, setConfirmationEnabled] = useState(false)
  const confirmDestination = useCallback(() => {
    dispatchDestinationStateAction({
      type: "set-confirmed",
      payload: { unparsedDestination: destinationState.unparsedDestination },
    })
  }, [destinationState, dispatchDestinationStateAction])

  if (destinationState.destinationState !== "requires-confirmation") return null

  const lnAddress = destinationState.confirmationType.username + "@" + lnDomain

  return (
    <Modal isVisible={destinationState.destinationState === "requires-confirmation"}>
      <View style={styles.modalCard}>
        <ScrollView>
          <View style={styles.titleContainer}>
            <Text type={"h1"}>
              {LL.SendBitcoinDestinationScreen.confirmModal.title({ lnAddress })}
            </Text>
          </View>
          <Text type={"p2"}>
            {LL.SendBitcoinDestinationScreen.confirmModal.body1({ bankName })}
            <Text type={"p2"} bold={true}>
              {" "}
              {LL.SendBitcoinDestinationScreen.confirmModal.bold2bold()}
            </Text>{" "}
            {LL.SendBitcoinDestinationScreen.confirmModal.body3({ bankName, lnAddress })}
          </Text>
          <Text type={"p2"} color={colors.error}>
            {LL.SendBitcoinDestinationScreen.confirmModal.warning({ bankName })}
          </Text>
          <View style={styles.checkBoxContainer}>
            <CheckBox
              {...testProps(
                LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress }),
              )}
              checked={confirmationEnabled}
              iconType="ionicon"
              checkedIcon={"checkbox"}
              uncheckedIcon={"square-outline"}
              onPress={() => setConfirmationEnabled(!confirmationEnabled)}
            />
            <Text type={"p2"} style={styles.checkBoxText}>
              {LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress })}
            </Text>
          </View>
          <GaloyPrimaryButton
            {...testProps(LL.SendBitcoinDestinationScreen.confirmModal.confirmButton())}
            title={LL.SendBitcoinDestinationScreen.confirmModal.confirmButton()}
            onPress={confirmDestination}
            disabled={!confirmationEnabled}
          />
          <GaloySecondaryButton
            title={LL.common.back()}
            onPress={() =>
              dispatchDestinationStateAction({
                type: "set-unparsed-destination",
                payload: { unparsedDestination: destinationState.unparsedDestination },
              })
            }
          />
        </ScrollView>
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
  },
  titleContainer: {
    marginBottom: 12,
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkBoxText: {
    flex: 1,
  },
}))
