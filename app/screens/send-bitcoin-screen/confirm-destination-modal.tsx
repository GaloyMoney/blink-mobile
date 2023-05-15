import { palette } from "@app/theme"
import React, { Dispatch, useCallback, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Button, CheckBox } from "@rneui/base"
import Modal from "react-native-modal"
import {
  SendBitcoinDestinationAction,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAppConfig } from "@app/hooks"
import { testProps } from "../../utils/testProps"

export type ConfirmDestinationModalProps = {
  destinationState: SendBitcoinDestinationState
  dispatchDestinationStateAction: Dispatch<SendBitcoinDestinationAction>
}

const styles = StyleSheet.create({
  modalCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 18,
  },
  titleContainer: {
    marginBottom: 12,
  },
  bodyContainer: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    color: palette.darkGrey,
    fontWeight: "bold",
  },
  bodyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  bodyTextBold: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 16,
    color: palette.red,
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  confirmButton: {
    backgroundColor: palette.blue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  disabledConfirmButton: {
    backgroundColor: palette.violetteBlue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: palette.white,
  },
  cancelButtonTitle: {
    color: palette.blue,
  },
  checkBoxText: {
    flex: 1,
  },
})

export const ConfirmDestinationModal: React.FC<ConfirmDestinationModalProps> = ({
  destinationState,
  dispatchDestinationStateAction,
}) => {
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
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            {LL.SendBitcoinDestinationScreen.confirmModal.title({ lnAddress })}
          </Text>
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>
            {LL.SendBitcoinDestinationScreen.confirmModal.body1({ bankName })}
            <Text style={styles.bodyTextBold}>
              {" "}
              {LL.SendBitcoinDestinationScreen.confirmModal.bold2bold()}
            </Text>{" "}
            {LL.SendBitcoinDestinationScreen.confirmModal.body3({ bankName, lnAddress })}
          </Text>
          <Text style={styles.warningText}>
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
            <Text style={styles.checkBoxText}>
              {LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress })}
            </Text>
          </View>
        </View>
        <Button
          {...testProps(LL.SendBitcoinDestinationScreen.confirmModal.confirmButton())}
          title={LL.SendBitcoinDestinationScreen.confirmModal.confirmButton()}
          buttonStyle={styles.confirmButton}
          onPress={confirmDestination}
          disabled={!confirmationEnabled}
          disabledStyle={styles.disabledConfirmButton}
        />
        <Button
          title={LL.common.back()}
          buttonStyle={styles.cancelButton}
          titleStyle={styles.cancelButtonTitle}
          onPress={() =>
            dispatchDestinationStateAction({
              type: "set-unparsed-destination",
              payload: { unparsedDestination: destinationState.unparsedDestination },
            })
          }
        />
      </View>
    </Modal>
  )
}
