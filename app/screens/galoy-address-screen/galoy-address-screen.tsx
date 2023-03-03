import { CustomIcon } from "@app/components/custom-icon"
import { Screen } from "@app/components/screen"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { getLightningAddress } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-community/clipboard"
import React from "react"
import { Share, TouchableWithoutFeedback, View } from "react-native"
import { Button, Text } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { AddressExplainerModal } from "./address-explainer-modal"
import { MerchantsDropdown } from "./merchants-dropdown"
import { SetAddressModal } from "./set-address-modal"
import { useAddressScreenQuery } from "../../graphql/generated"
import { gql } from "@apollo/client"

const styles = EStyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
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
  fieldNameContainer: {
    flexDirection: "row",
  },
  fieldNameComponent: {
    justifyContent: "center",
  },
  title: {
    color: palette.lapisLazuli,
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: "500",
    flexWrap: "wrap",
  },
})

gql`
  query addressScreen {
    me {
      username
    }
  }
`

export const GaloyAddressScreen = () => {
  const { LL } = useI18nContext()
  const { data } = useAddressScreenQuery({ fetchPolicy: "cache-only" })

  const [chooseAddressModalVisible, setChooseAddressModalVisible] = React.useState(false)
  const {
    appConfig: { galoyInstance },
  } = useAppConfig()
  const [explainerModalVisible, setExplainerModalVisible] = React.useState(false)

  const username = data.me.username

  const lightningAddress = getLightningAddress(galoyInstance, username)
  const toggleChooseAddressModal = () => {
    setChooseAddressModalVisible(!chooseAddressModalVisible)
  }
  const toggleExplainerModal = () => {
    setExplainerModalVisible(!explainerModalVisible)
  }
  return (
    <Screen style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {LL.SettingsScreen.addressScreen({ bankName: "BBW" })}
        </Text>
        <View style={styles.addressInfoContainer}>
          <TouchableWithoutFeedback onPress={() => toggleExplainerModal()}>
            <View style={styles.fieldNameContainer}>
              <View style={styles.fieldNameComponent}>
                <View style={styles.fieldText}>
                  <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />
                </View>
              </View>
              <View style={styles.fieldNameComponent}>
                <Text style={styles.addressInfoText}>
                  {" " + LL.GaloyAddressScreen.yourAddress({ bankName: "BBW" })}
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
                        bankName: "BBW",
                      }),
                    type: "success",
                    currentTranslation: LL,
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
            title={LL.GaloyAddressScreen.buttonTitle({ bankName: "BBW" })}
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
