import { CustomIcon } from "@app/components/custom-icon"
import { Dropdown } from "@app/components/dropdown"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { getPosUrl, getPrintableQrCodeUrl } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import React from "react"
import { Linking, Share, View } from "react-native"
import { Text } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { PayCodeExplainerModal } from "./paycode-explainer-modal"
import { PosExplainerModal } from "./pos-explainer-modal"
import { SetDefaultWalletScreen } from "./set-default-wallet"

const styles = EStyleSheet.create({
  title: {
    color: palette.lapisLazuli,
    fontSize: 18,
    fontWeight: "500",
    flexShrink: 1,
    flexWrap: "nowrap",
  },
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  fieldNameContainer: {
    flex: 1,
    flexDirection: "row",
  },
  fieldNameComponent: {
    justifyContent: "center",
  },
  fieldText: {
    color: palette.lapisLazuli,
    fontSize: 14,
    fontWeight: "500",
    verticalTextAlign: "center",
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
    flexShrink: 1,
    flexWrap: "nowrap",
  },
  // For some reason the first TouchableWithoutFeedback requires a height otherwise the Text component doesn't show
  visualBugFix: {
    height: 30,
  },
  modalToggleContainer: {
    flex: 4,
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

  const dropdownContent = (
    <View>
      <View style={styles.fieldContainer}>
        <View style={styles.modalToggleContainer}>
          <TouchableWithoutFeedback
            style={styles.visualBugFix}
            onPress={() => togglePosExplainerModal()}
          >
            <View style={styles.fieldNameContainer}>
              <View style={styles.fieldNameComponent}>
                <View style={styles.fieldText}>
                  <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />
                </View>
              </View>
              <View style={styles.fieldNameComponent}>
                <Text style={styles.fieldText} numberOfLines={2}>
                  {" " + LL.GaloyAddressScreen.yourCashRegister()}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
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
                message: (translations) =>
                  translations.GaloyAddressScreen.copiedCashRegisterToClipboard(),
                type: "success",
                currentTranslation: LL,
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
        <Text style={styles.title} numberOfLines={1}>
          {posUrl}
        </Text>
      </View>
      <View style={styles.fieldContainer}>
        <View style={styles.modalToggleContainer}>
          <TouchableWithoutFeedback
            style={styles.visualBugFix}
            onPress={() => togglePaycodeExplainerModal()}
          >
            <View style={styles.fieldNameContainer}>
              <View style={styles.fieldNameComponent}>
                <View style={styles.fieldText}>
                  <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />
                </View>
              </View>
              <View style={styles.fieldNameComponent}>
                <Text style={styles.fieldText}>
                  {" " + LL.GaloyAddressScreen.yourPaycode()}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
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
                message: (translations) =>
                  translations.GaloyAddressScreen.copiedPaycodeToClipboard(),
                type: "success",
                currentTranslation: LL,
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
        <Text style={styles.title} numberOfLines={1}>
          {payCodeUrl}
        </Text>
      </View>
      <SetDefaultWalletScreen />
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
      icon={"custom-merchant-icon"}
      dropdownTitle={LL.GaloyAddressScreen.merchantTitle()}
      content={dropdownContent}
      titleStyle={styles.title}
    />
  )
}
