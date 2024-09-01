import React from "react"
import {
  ScrollView,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
} from "react-native"
import Modal from "react-native-modal"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, useTheme, Text, Input, Image } from "@rneui/themed"

// assets
import PinImage from "../../assets/images/pin-image-ln.png"

// components
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

type Props = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
  businessName: string
  setBusinessName: (title: string) => void
  onSubmit: () => void
  selectedLocation?: { latitude: number; longitude: number }
}

export const MerchantSuggestModal: React.FC<Props> = ({
  isVisible,
  setIsVisible,
  businessName,
  setBusinessName,
  onSubmit,
  selectedLocation,
}) => {
  const { LL } = useI18nContext()
  const { colors } = useTheme().theme
  const styles = useStyles()

  const closeModal = () => {
    setIsVisible(false)
  }

  // Function to open the location in Google Maps
  const openInGoogleMaps = () => {
    if (selectedLocation) {
      const url = `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`
      Linking.openURL(url)
    }
  }

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      onBackdropPress={closeModal}
      style={styles.topScreen}
    >
      <View style={styles.modalCard}>
        <ScrollView style={styles.scrollViewStyle} keyboardShouldPersistTaps="handled">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Image
                source={PinImage}
                style={styles.stableSatsImage}
                resizeMode="contain"
              />
              <Text style={styles.cardTitle} type={"h2"}>
                {LL.MerchantSuggestModal.header()}
              </Text>

              <Text style={styles.cardDescription} type="p2">
                {LL.MerchantSuggestModal.body()}{" "}
              </Text>

              {/* Display the selected coordinates */}
              {selectedLocation && (
                <View style={styles.marginBottom}>
                  <Text style={styles.cardDescription}>
                    {LL.MapScreen.selectedCoordinates()}
                    {"Latitude: "}
                    {selectedLocation.latitude.toPrecision(5)}
                    {"\n"}
                    {"Longitude: "}
                    {selectedLocation.longitude.toPrecision(5)}
                  </Text>
                  <Text
                    style={[styles.cardDescription, { color: colors._blue }]}
                    onPress={openInGoogleMaps}
                  >
                    {LL.MapScreen.viewInGoogleMaps()}
                  </Text>
                </View>
              )}

              <Input
                placeholder="Business Name"
                value={businessName}
                onChangeText={setBusinessName}
                containerStyle={styles.marginBottom}
              />
              <Text style={styles.cardDescription} type="p2">
                {LL.MerchantSuggestModal.learnMore()}
              </Text>
              <View style={styles.cardActionsContainer}>
                <GaloyPrimaryButton
                  style={styles.marginBottom}
                  title={LL.common.request()}
                  onPress={onSubmit}
                />
                <GaloySecondaryButton title={LL.common.cancel()} onPress={closeModal} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  stableSatsImage: {
    width: "100%",
    height: 75,
    marginBottom: 8,
  },
  scrollViewStyle: {
    paddingHorizontal: 12,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    marginVertical: 50,
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  cardDescription: {
    marginBottom: 12,
  },
  cardActionsContainer: {
    flexDirection: "column",
    paddingVertical: 12,
  },
  marginBottom: {
    marginBottom: 12,
  },
  topScreen: {
    justifyContent: "flex-start",
    margin: 0,
  },
}))
