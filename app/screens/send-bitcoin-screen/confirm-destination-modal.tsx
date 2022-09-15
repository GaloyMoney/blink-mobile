import { palette } from "@app/theme"
import React, { Dispatch, useCallback, useState } from "react"
import { Text, View } from "react-native"
import { Button, CheckBox } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Modal from "react-native-modal"
import { bankName, lnDomain } from "./send-bitcoin-destination-screen"
import {
  SendBitcoinDestinationAction,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"
import Markdown from "react-native-markdown-display"
import { useI18nContext } from "@app/i18n/i18n-react"

const TypedMarkdown = Markdown as MarkdownStatic

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
})

export const ConfirmDestinationModal: React.FC<ConfirmDestinationModalProps> = ({
  destinationState,
  dispatchDestinationStateAction,
}) => {
  const [confirmationEnabled, setConfirmationEnabled] = useState(false)
  const { LL } = useI18nContext()
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
          <TypedMarkdown style={{ body: styles.bodyText }}>
            {LL.SendBitcoinDestinationScreen.confirmModal.body({ bankName, lnAddress })}
          </TypedMarkdown>
          <Text style={styles.warningText}>
            {LL.SendBitcoinDestinationScreen.confirmModal.warning({ bankName })}
          </Text>
          <View style={styles.checkBoxContainer}>
            <CheckBox
              checked={confirmationEnabled}
              onPress={() => setConfirmationEnabled(!confirmationEnabled)}
            />
            <Text style={styles.checkboxText}>
              {LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress })}
            </Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <Button
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
