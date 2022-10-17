import { CustomIcon } from "@app/components/custom-icon"
import { Screen } from "@app/components/screen"
import useMainQuery from "@app/hooks/use-main-query"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { getLightningAddress } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-community/clipboard"
import React from "react"
import { Share, TouchableWithoutFeedback, View } from "react-native"
import { Button, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { AddressExplainerModal } from "./address-explainer-modal"
import { MerchantsDropdown } from "./merchants-dropdown"
import { SetAddressModal } from "./set-address-modal"

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: palette.lapisLazuli,
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: "500",
  },
  addressInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  addressInfoText: {
    color: palette.lapisLazuli,
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "500",
    flex: 4,
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
    backgroundColor: palette.primaryButtonColor,
    borderRadius: 8,
    height: 48,
  },
  merchantsSectionContainer: {
    marginTop: 20,
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
  usernameText: {
    color: palette.lapisLazuli,
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: "500",
  },
})

export const AddressScreen = () => {
  const { LL } = useI18nContext()
  const { username } = useMainQuery()
  const [chooseAddressModalVisible, setChooseAddressModalVisible] = React.useState(false)
  const { network } = useMainQuery()
  const [explainerModalVisible, setExplainerModalVisible] = React.useState(false)
  const lightningAddress = getLightningAddress(network, username)
  const toggleChooseAddressModal = () => {
    setChooseAddressModalVisible(!chooseAddressModalVisible)
  }
  const toggleExplainerModal = () => {
    setExplainerModalVisible(!explainerModalVisible)
  }
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>
          {LL.SettingsScreen.addressScreen({ bankName: "BBW" })}
        </Text>
        <View style={styles.addressInfoContainer}>
          <TouchableWithoutFeedback onPress={() => toggleExplainerModal()}>
            <Text style={styles.addressInfoText}>
              <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />{" "}
              {LL.AddressScreen.yourAddress({ bankName: "BBW" })}
            </Text>
          </TouchableWithoutFeedback>
          {username && (
            <View style={styles.iconContainer}>
              <TouchableWithoutFeedback
                onPress={() => {
                  Clipboard.setString(lightningAddress)
                  toastShow({
                    message: LL.AddressScreen.copiedAddressToClipboard({
                      bankName: "BBW",
                    }),
                    type: "success",
                  })
                }}
              >
                <Text style={styles.addressCopyIcon}>
                  <CustomIcon name="custom-copy-icon" color={palette.midGrey} />
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
                  <CustomIcon name="custom-share-icon" color={palette.midGrey} />
                </Text>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
        {!username && (
          <Button
            title={LL.AddressScreen.buttonTitle({ bankName: "BBW" })}
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
            <View style={styles.merchantsSectionContainer}>
              <MerchantsDropdown username={username} />
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
