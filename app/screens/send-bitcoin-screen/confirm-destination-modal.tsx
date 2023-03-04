import { palette } from "@app/theme"
import React, { Dispatch, useCallback, useState } from "react"
import { Text, View } from "react-native"
import { Button, CheckBox } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import Modal from "react-native-modal"
import {
  SendBitcoinDestinationAction,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"
import Markdown from "react-native-markdown-display"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAppConfig } from "@app/hooks"
import { testProps } from "../../utils/testProps"

export type ConfirmDestinationModalProps = {
  destinationState: SendBitcoinDestinationState
  dispatchDestinationStateAction: Dispatch<SendBitcoinDestinationAction>
}

const styles = EStyleSheet.create({
  modalCard: {
    backgroundColor: palette.white,
    borderRadius: "16rem",
    padding: "18rem",
  },
  titleContainer: {
    marginBottom: "12rem",
  },
  bodyContainer: {
    marginBottom: "16rem",
  },
  titleText: {
    fontSize: "20rem",
    color: palette.darkGrey,
    fontWeight: "bold",
  },
  bodyText: {
    fontSize: "16rem",
    marginBottom: "16rem",
  },
  warningText: {
    fontSize: "16rem",
    color: palette.red,
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: "8rem",
  },
  confirmButton: {
    backgroundColor: palette.blue,
    borderRadius: "12rem",
    padding: "16rem",
    marginBottom: "12rem",
  },
  disabledConfirmButton: {
    backgroundColor: palette.violetteBlue,
    borderRadius: "12rem",
    padding: "16rem",
    marginBottom: "12rem",
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
          <Markdown style={{ body: styles.bodyText }}>
            {LL.SendBitcoinDestinationScreen.confirmModal.body({ bankName, lnAddress })}
          </Markdown>
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
        <View style={styles.buttonsContainer}>
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
      </View>
    </Modal>
  )
}
