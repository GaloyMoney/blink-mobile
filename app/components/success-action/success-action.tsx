import React from "react"
import { View, Text, TouchableOpacity, Linking } from "react-native"
import { utils } from "lnurl-pay"
import Clipboard from "@react-native-clipboard/clipboard"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { makeStyles, useTheme } from "@rneui/themed"
import { toastShow } from "@app/utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import { SuccessActionComponentProps } from "./success-action.props"

export const SuccessActionComponent: React.FC<SuccessActionComponentProps> = ({
  successAction,
  preimage,
}) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()

  if (!successAction) return null

  const { tag, message, description, url } = successAction
  let decryptedMessage = null

  if (tag === "aes" && preimage) {
    decryptedMessage = utils.decipherAES({ successAction, preimage })
  }

  const copyToClipboard = (text: string, message: string) => {
    Clipboard.setString(text)
    toastShow({ type: "success", message, LL })
  }

  switch (tag) {
    case "message":
      return message ? (
        <View style={styles.successActionContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <View style={styles.successActionFieldContainer}>
            <View style={styles.disabledFieldBackground}>
              <Text style={styles.truncatedText}>{message}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() =>
                copyToClipboard(message, LL.SendBitcoinScreen.copiedSuccessMessage())
              }
              accessibilityLabel={LL.SendBitcoinScreen.copySuccessMessage()}
              hitSlop={30}
            >
              <GaloyIcon name={"copy-paste"} size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null

    case "url":
      return (
        <View style={styles.successActionContainer}>
          {description && (
            <View>
              <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
              <View style={styles.successActionFieldContainer}>
                <View style={styles.disabledFieldBackground}>
                  <Text style={styles.truncatedText}>{description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.iconContainer}
                  onPress={() =>
                    copyToClipboard(
                      description,
                      LL.SendBitcoinScreen.copiedSuccessMessage(),
                    )
                  }
                  accessibilityLabel={LL.SendBitcoinScreen.copySuccessMessage()}
                  hitSlop={styles.hitSlopIcon}
                >
                  <GaloyIcon name="copy-paste" size={25} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.copyUrlButton}
            onPress={() => Linking.openURL(url!)}
            accessibilityLabel={LL.SendBitcoinScreen.openSuccessUrl()}
            hitSlop={styles.hitSlopIcon}
          >
            <Text style={styles.copyUrlButtonText}>
              {LL.ScanningQRCodeScreen.openLinkTitle()}
            </Text>
          </TouchableOpacity>
        </View>
      )

    case "aes":
      return decryptedMessage ? (
        <View style={styles.successActionContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          {description && (
            <View style={styles.successActionFieldContainer}>
              <View style={styles.disabledFieldBackground}>
                <Text style={styles.truncatedText}>{description}</Text>
              </View>
            </View>
          )}
          <View style={styles.successActionFieldContainer}>
            <View style={styles.disabledFieldBackground}>
              <Text style={styles.truncatedText}>{decryptedMessage}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() =>
                copyToClipboard(
                  decryptedMessage,
                  LL.SendBitcoinScreen.copiedSecretMessage(),
                )
              }
              accessibilityLabel={LL.SendBitcoinScreen.copySecretMessage()}
              hitSlop={30}
            >
              <GaloyIcon name={"copy-paste"} size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null

    default:
      return null
  }
}

const useStyles = makeStyles(({ colors }) => ({
  successActionContainer: {
    minWidth: "100%",
    paddingHorizontal: 40,
    marginTop: 30,
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  successActionFieldContainer: {
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    alignItems: "center",
    padding: 14,
    minHeight: 60,
    marginBottom: 12,
  },
  disabledFieldBackground: {
    flex: 1,
    opacity: 0.5,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  truncatedText: {
    fontSize: 14,
  },
  hitSlopIcon: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
  copyUrlButton: {
    backgroundColor: colors.grey5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  copyUrlButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
}))
