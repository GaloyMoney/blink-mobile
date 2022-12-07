import { usePersistentStateContext } from "@app/store/persistent-state"
import { palette } from "@app/theme"
import * as React from "react"
import { Image, Linking, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Modal from "react-native-modal"
import StableSatsImage from "../../assets/images/stable-sats.png"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "../../../utils/testProps"

const styles = EStyleSheet.create({
  imageContainer: {
    height: "150rem",
    marginBottom: "16rem",
  },
  stableSatsImage: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: palette.white,
    borderRadius: "16rem",
    padding: "18rem",
  },
  cardTitleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: "16rem",
  },
  cardTitleText: {
    fontSize: "20rem",
    lineHeight: "28rem",
    color: palette.darkGrey,
  },
  cardBodyContainer: {
    marginBottom: "16rem",
  },
  cardBodyText: {
    lineHeight: "24rem",
    fontSize: "16rem",
  },
  termsAndConditionsText: {
    textDecorationLine: "underline",
  },
  cardActionsContainer: {
    flexDirection: "column",
  },
  homeButton: {
    backgroundColor: palette.blue,
    borderRadius: "12rem",
    padding: "16rem",
    marginBottom: "10rem",
  },
  learnMoreButton: {
    backgroundColor: palette.white,
  },
  learnMoreButtonText: {
    color: palette.blue,
  },
})

const STABLESATS_LINK = "https://www.stablesats.com"
const STABLESATS_TERMS_LINK = "https://www.bbw.sv/terms"

export const StableSatsModal: React.FC = () => {
  const persistentStateContext = usePersistentStateContext()
  const { LL } = useI18nContext()
  const isModalVisible = !persistentStateContext.persistentState.hasShownStableSatsWelcome
  const acknowledgeModal = () => {
    persistentStateContext.updateState((state) => ({
      ...state,
      hasShownStableSatsWelcome: true,
    }))
  }

  return (
    <Modal isVisible={isModalVisible} backdropOpacity={0.3}>
      <View style={styles.modalCard}>
        <View style={styles.imageContainer}>
          <Image
            source={StableSatsImage}
            style={styles.stableSatsImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitleText}>{LL.StablesatsModal.header()}</Text>
        </View>
        <View style={styles.cardBodyContainer}>
          <Text style={styles.cardBodyText}>
            {LL.StablesatsModal.body()}
            <Text
              style={styles.termsAndConditionsText}
              onPress={() => Linking.openURL(STABLESATS_TERMS_LINK)}
            >
              {" " + LL.StablesatsModal.termsAndConditions()}
            </Text>
          </Text>
        </View>
        <View style={styles.cardActionsContainer}>
          <Button
            {...testProps(LL.common.backHome())}
            title={LL.common.backHome()}
            onPress={acknowledgeModal}
            buttonStyle={styles.homeButton}
          />
          <Button
            title={LL.StablesatsModal.learnMore()}
            buttonStyle={styles.learnMoreButton}
            titleStyle={styles.learnMoreButtonText}
            onPress={() => Linking.openURL(STABLESATS_LINK)}
          />
        </View>
      </View>
    </Modal>
  )
}
