import { CustomIcon } from "@app/components/custom-icon"
import { Screen } from "@app/components/screen"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { getLightningAddress } from "@app/utils/pay-links"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import React from "react"
import { Share, StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import { Button, Text } from "@rneui/base"
import { AddressExplainerModal } from "./address-explainer-modal"
import { MerchantsDropdown } from "./merchants-dropdown"
import { SetAddressModal } from "./set-address-modal"
import { useAddressScreenQuery } from "../../graphql/generated"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const styles = StyleSheet.create({
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
    color: palette.lapisLazuli,
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
    fontWeight: "600",
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
    fontWeight: "600",
    flexWrap: "wrap",
  },
})

gql`
  query addressScreen {
    me {
      id
      username
    }
  }
`

export const GaloyAddressScreen = () => {
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

  const lightningAddress = getLightningAddress(appConfig.galoyInstance, username)
  const toggleChooseAddressModal = () => {
    setChooseAddressModalVisible(!chooseAddressModalVisible)
  }
  const toggleExplainerModal = () => {
    setExplainerModalVisible(!explainerModalVisible)
  }
  return (
    <Screen preset="scroll">
      <View style={styles.container}>
        <Text style={styles.title}>{LL.SettingsScreen.addressScreen({ bankName })}</Text>
        <View style={styles.addressInfoContainer}>
          <TouchableWithoutFeedback onPress={() => toggleExplainerModal()}>
            <View style={styles.fieldNameContainer}>
              <View style={styles.fieldNameComponent}>
                <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />
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
