import { palette } from "@app/theme"
import * as React from "react"
import { Image, Linking, StyleSheet, Text, View } from "react-native"
import { Button } from "@rneui/base"
import Modal from "react-native-modal"
import StablesatsImage from "../../assets/images/stable-sats.png"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "../../utils/testProps"

const styles = StyleSheet.create({
  imageContainer: {
    height: 150,
    marginBottom: 16,
  },
  stableSatsImage: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 18,
  },
  cardTitleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardTitleText: {
    fontSize: 20,
    lineHeight: 28,
    color: palette.darkGrey,
  },
  cardBodyContainer: {
    marginBottom: 16,
  },
  cardBodyText: {
    lineHeight: 24,
    fontSize: 16,
  },
  termsAndConditionsText: {
    textDecorationLine: "underline",
  },
  cardActionsContainer: {
    flexDirection: "column",
  },
  homeButton: {
    backgroundColor: palette.blue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
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

export const StablesatsModal: React.FC = () => {
  const { LL } = useI18nContext()

  // no longer showing stablesats modal in new version
  // keeping the code around for the next modal we're going to show
  const isModalVisible = false
  const acknowledgeModal = () => {}

  return (
    <Modal isVisible={isModalVisible} backdropOpacity={0.3}>
      <View style={styles.modalCard}>
        <View style={styles.imageContainer}>
          <Image
            source={StablesatsImage}
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
