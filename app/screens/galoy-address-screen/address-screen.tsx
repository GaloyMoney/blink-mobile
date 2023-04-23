import { gql } from "@apollo/client"
import { CustomIcon } from "@app/components/custom-icon"
import { Screen } from "@app/components/screen"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  getLightningAddress,
  getPosUrl,
  getPrintableQrCodeUrl,
} from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import { Button, Text } from "@rneui/base"
import { makeStyles, useTheme } from "@rneui/themed"
import React from "react"
import { Linking, Share, TouchableWithoutFeedback, View } from "react-native"
import { useAddressScreenQuery } from "../../graphql/generated"
import { AddressExplainerModal } from "./address-explainer-modal"
import { PayCodeExplainerModal } from "./paycode-explainer-modal"
import { PosExplainerModal } from "./pos-explainer-modal"
import { SetAddressModal } from "./set-address-modal"

const useStyles = makeStyles(({ colors }) => ({
  container: {
    padding: 20,
  },
  addressInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  addressInfoText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: "600",
  },
  addressCopyIcon: {
    marginRight: 20,
  },
  iconContainer: {
    flex: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  buttonContainerStyle: {
    marginTop: 20,
  },
  buttonStyle: {
    backgroundColor: colors.grey5,
    borderRadius: 8,
    height: 48,
  },
  merchantsSectionContainer: {
    marginTop: 20,
  },
  usernameField: {
    backgroundColor: colors.white,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 8,
  },
  usernameText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: "600",
  },
  fieldNameContainer: {
    flexDirection: "row",
  },
  fieldNameComponent: {
    justifyContent: "center",
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontWeight: "600",
    flexWrap: "wrap",
  },
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  modalToggleContainer: {
    flex: 4,
  },
  // For some reason the first TouchableWithoutFeedback requires a height otherwise the Text component doesn't show
  visualBugFix: {
    height: 30,
  },
  fieldText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: "600",
  },
  copyIcon: {
    marginRight: 20,
  },
}))

gql`
  query addressScreen {
    me {
      id
      username
    }
  }
`

export const GaloyAddressScreen = () => {
  const styles = useStyles()
  const { theme } = useTheme()

  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const { data } = useAddressScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const [chooseAddressModalVisible, setChooseAddressModalVisible] = React.useState(false)
  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

  const [explainerModalVisible, setExplainerModalVisible] = React.useState(false)

  const username = data?.me?.username || ""

  const lightningAddress = getLightningAddress(
    appConfig.galoyInstance.lnAddressHostname,
    username,
  )
  const toggleChooseAddressModal = () => {
    setChooseAddressModalVisible(!chooseAddressModalVisible)
  }
  const toggleExplainerModal = () => {
    setExplainerModalVisible(!explainerModalVisible)
  }

  const posUrl = getPosUrl(appConfig.galoyInstance.posUrl, username)
  const payCodeUrl = getPrintableQrCodeUrl(appConfig.galoyInstance.posUrl, username)
  const [isPosExplainerModalOpen, setIsPosExplainerModalOpen] = React.useState(false)
  const [isPaycodeExplainerModalOpen, setIsPaycodeExplainerModalOpen] =
    React.useState(false)

  const togglePosExplainerModal = () => {
    setIsPosExplainerModalOpen(!isPosExplainerModalOpen)
  }

  const togglePaycodeExplainerModal = () => {
    setIsPaycodeExplainerModalOpen(!isPaycodeExplainerModalOpen)
  }

  return (
    <Screen preset="scroll">
      <View style={styles.container}>
        <Text style={styles.title}>{LL.SettingsScreen.addressScreen()}</Text>
        <View style={styles.addressInfoContainer}>
          <TouchableWithoutFeedback onPress={() => toggleExplainerModal()}>
            <View style={styles.fieldNameContainer}>
              <View style={styles.fieldNameComponent}>
                <CustomIcon name="custom-info-icon" color={theme.colors.primary} />
              </View>
              <View style={styles.fieldNameComponent}>
                <Text style={styles.addressInfoText}>
                  {" " + LL.GaloyAddressScreen.yourAddress({ bankName })}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
          {username && (
            <View style={styles.iconContainer}>
              <TouchableWithoutFeedback
                onPress={() => {
                  Clipboard.setString(lightningAddress)
                  toastShow({
                    message: (translations) =>
                      translations.GaloyAddressScreen.copiedAddressToClipboard({
                        bankName,
                      }),
                    type: "success",
                    currentTranslation: LL,
                  })
                }}
              >
                <Text style={styles.addressCopyIcon}>
                  <CustomIcon name="custom-copy-icon" color={theme.colors.primary} />
                </Text>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                onPress={() => {
                  Share.share({
                    url: lightningAddress,
                    message: lightningAddress,
                  })
                }}
              >
                <Text>
                  <CustomIcon name="custom-share-icon" color={theme.colors.primary} />
                </Text>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
        {!username && (
          <Button
            title={LL.GaloyAddressScreen.buttonTitle({ bankName })}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={() => toggleChooseAddressModal()}
          />
        )}
        {username && (
          <>
            <View style={styles.usernameField}>
              <Text style={styles.usernameText}>{lightningAddress}</Text>
            </View>
            <View>
              <View style={styles.fieldContainer}>
                <View style={styles.modalToggleContainer}>
                  <TouchableWithoutFeedback
                    style={styles.visualBugFix}
                    onPress={() => togglePosExplainerModal()}
                  >
                    <View style={styles.fieldNameContainer}>
                      <View style={styles.fieldNameComponent}>
                        <CustomIcon
                          name="custom-info-icon"
                          color={theme.colors.primary}
                        />
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
                      <CustomIcon
                        name="custom-web-link-icon"
                        color={theme.colors.primary}
                      />
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
                      <CustomIcon name="custom-copy-icon" color={theme.colors.primary} />
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
                      <CustomIcon name="custom-share-icon" color={theme.colors.primary} />
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
                        <CustomIcon
                          name="custom-info-icon"
                          color={theme.colors.primary}
                        />
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
                      <CustomIcon
                        name="custom-web-link-icon"
                        color={theme.colors.primary}
                      />
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
                      <CustomIcon name="custom-copy-icon" color={theme.colors.primary} />
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
                      <CustomIcon name="custom-share-icon" color={theme.colors.primary} />
                    </Text>
                  </TouchableWithoutFeedback>
                </View>
              </View>
              <View style={styles.usernameField}>
                <Text style={styles.title} numberOfLines={1}>
                  {payCodeUrl}
                </Text>
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
          </>
        )}
      </View>
      <SetAddressModal
        modalVisible={chooseAddressModalVisible}
        toggleModal={toggleChooseAddressModal}
      />
      <AddressExplainerModal
        modalVisible={explainerModalVisible}
        toggleModal={toggleExplainerModal}
      />
    </Screen>
  )
}
