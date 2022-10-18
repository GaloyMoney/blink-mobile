import { CustomIcon } from "@app/components/custom-icon"
import { Dropdown } from "@app/components/dropdown"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { getPosUrl, getPrintableQrCodeUrl } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-community/clipboard"
import React from "react"
import { Linking, Share, View } from "react-native"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { PayCodeExplainerModal } from "./paycode-explainer-modal"
import { PosExplainerModal } from "./pos-explainer-modal"

const styles = EStyleSheet.create({
  title: {
    color: palette.lapisLazuli,
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: "500",
  },
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  fieldText: {
    color: palette.lapisLazuli,
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "500",
    flex: 4,
  },
  copyIcon: {
    marginRight: 20,
  },
  iconContainer: {
    flex: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  usernameField: {
    backgroundColor: palette.white,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 8,
  },
  // For some reason the first TouchableWithoutFeedback requires a height otherwise the Text component doesn't show
  visualBugFix: {
    height: 21,
  },
})

export const MerchantsDropdown = ({ username }: { username: string }) => {
  const { LL } = useI18nContext()
  const {
    appConfig: { galoyInstance },
  } = useAppConfig()
  const posUrl = getPosUrl(galoyInstance, username)
  const payCodeUrl = getPrintableQrCodeUrl(galoyInstance, username)
  const [isPosExplainerModalOpen, setIsPosExplainerModalOpen] = React.useState(false)
  const [isPaycodeExplainerModalOpen, setIsPaycodeExplainerModalOpen] =
    React.useState(false)

  const togglePosExplainerModal = () => {
    setIsPosExplainerModalOpen(!isPosExplainerModalOpen)
  }

  const togglePaycodeExplainerModal = () => {
    setIsPaycodeExplainerModalOpen(!isPaycodeExplainerModalOpen)
  }

  const dropdownTitle = (
    <Text style={styles.title}>
      <CustomIcon name="custom-merchant-icon" color={palette.lapisLazuli} />{" "}
      {LL.GaloyAddressScreen.merchantTitle()}
    </Text>
  )

  const dropdownContent = (
    <View>
      <View style={styles.fieldContainer}>
        <TouchableWithoutFeedback
          style={styles.visualBugFix}
          onPress={() => togglePosExplainerModal()}
        >
          <Text style={styles.fieldText}>
            <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />{" "}
            {LL.GaloyAddressScreen.yourCashRegister()}
          </Text>
        </TouchableWithoutFeedback>

        <View style={styles.iconContainer}>
          <TouchableWithoutFeedback onPress={() => Linking.openURL(posUrl)}>
            <Text style={styles.copyIcon}>
              <CustomIcon name="custom-web-link-icon" color={palette.midGrey} />
            </Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              Clipboard.setString(posUrl)
              toastShow({
                message: LL.GaloyAddressScreen.copiedCashRegisterToClipboard(),
                type: "success",
              })
            }}
          >
            <Text style={styles.copyIcon}>
              <CustomIcon name="custom-copy-icon" color={palette.midGrey} />
            </Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              Share.share({
                url: posUrl,
                message: posUrl,
              })
            }}
          >
            <Text>
              <CustomIcon name="custom-share-icon" color={palette.midGrey} />
            </Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <View style={styles.usernameField}>
        <Text style={styles.title}>{posUrl}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <TouchableWithoutFeedback
          style={styles.visualBugFix}
          onPress={() => togglePaycodeExplainerModal()}
        >
          <Text style={styles.fieldText}>
            <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />{" "}
            {LL.GaloyAddressScreen.yourPaycode()}
          </Text>
        </TouchableWithoutFeedback>
        <View style={styles.iconContainer}>
          <TouchableWithoutFeedback onPress={() => Linking.openURL(payCodeUrl)}>
            <Text style={styles.copyIcon}>
              <CustomIcon name="custom-web-link-icon" color={palette.midGrey} />
            </Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              Clipboard.setString(payCodeUrl)
              toastShow({
                message: LL.GaloyAddressScreen.copiedPaycodeToClipboard(),
                type: "success",
              })
            }}
          >
            <Text style={styles.copyIcon}>
              <CustomIcon name="custom-copy-icon" color={palette.midGrey} />
            </Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              Share.share({
                url: payCodeUrl,
                message: payCodeUrl,
              })
            }}
          >
            <Text>
              <CustomIcon name="custom-share-icon" color={palette.midGrey} />
            </Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <View style={styles.usernameField}>
        <Text style={styles.title}>{payCodeUrl}</Text>
      </View>
      <PosExplainerModal
        modalVisible={isPosExplainerModalOpen}
        toggleModal={togglePosExplainerModal}
      />
      <PayCodeExplainerModal
        modalVisible={isPaycodeExplainerModalOpen}
        toggleModal={togglePaycodeExplainerModal}
      />
    </View>
  )

  return (
    <Dropdown
      dropdownTitle={dropdownTitle}
      content={dropdownContent}
      titleStyle={styles.title}
    />
  )
}
