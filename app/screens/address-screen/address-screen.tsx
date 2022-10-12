import { CustomIcon } from "@app/components/custom-icon"
import { Screen } from "@app/components/screen"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import React from "react"
import { View } from "react-native"
import { Button, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
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
})

export const AddressScreen = () => {
  const { LL } = useI18nContext()

  const [chooseAddressModalVisible, setChooseAddressModalVisible] = React.useState(false)

  const toggleChooseAddressModal = () => {
    setChooseAddressModalVisible(!chooseAddressModalVisible)
  }
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>
          {LL.SettingsScreen.addressScreen({ bankName: "BBW" })}
        </Text>
        <View style={styles.addressInfoContainer}>
          <Text style={styles.addressInfoText}>
            <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />{" "}
            {LL.AddressScreen.yourAddress({ bankName: "BBW" })}
          </Text>
          <View style={styles.iconContainer}>
            <Text style={styles.addressCopyIcon}>
              <CustomIcon name="custom-copy-icon" color={palette.midGrey} />
            </Text>
            <Text>
              <CustomIcon name="custom-share-icon" color={palette.midGrey} />
            </Text>
          </View>
        </View>
        <Button
          title={LL.AddressScreen.buttonTitle({ bankName: "BBW" })}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={() => toggleChooseAddressModal()}
        />
      </View>
      <SetAddressModal modalVisible={chooseAddressModalVisible} />
    </Screen>
  )
}
