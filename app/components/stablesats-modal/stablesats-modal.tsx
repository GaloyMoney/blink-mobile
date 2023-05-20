import * as React from "react"
import { Image, Linking, ScrollView, View } from "react-native"
import Modal from "react-native-modal"

import { useI18nContext } from "@app/i18n/i18n-react"
import { Button } from "@rneui/base"
import { makeStyles, useTheme, Text } from "@rneui/themed"

import StablesatsImage from "../../assets/images/stable-sats.png"
import { testProps } from "../../utils/testProps"

const useStyles = makeStyles(({ colors }) => ({
  imageContainer: {
    height: 150,
    marginBottom: 16,
  },
  stableSatsImage: {
    flex: 1,
  },
  scrollViewStyle: {
    paddingHorizontal: 18,
  },
  modalCard: {
    maxHeight: "80%",
    backgroundColor: colors.whiteOrDarkGrey,
    borderRadius: 16,
    paddingVertical: 18,
  },
  cardTitleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardTitleText: {
    fontSize: 20,
    lineHeight: 28,
    color: colors.lapisLazuliOrLightGrey,
  },
  cardBodyContainer: {
    marginBottom: 16,
  },
  cardBodyText: {
    lineHeight: 24,
    fontSize: 16,
    color: colors.grey0,
  },
  termsAndConditionsText: {
    textDecorationLine: "underline",
  },
  cardActionsContainer: {
    flexDirection: "column",
  },
  homeButton: {
    backgroundColor: colors.primary5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  learnMoreButton: {
    backgroundColor: colors.whiteOrDarkGrey,
  },
  learnMoreButtonText: {
    color: colors.primary5,
  },
}))

const STABLESATS_LINK = "https://www.stablesats.com"
const STABLESATS_TERMS_LINK = "https://www.bbw.sv/terms"

type Props = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}

export const StableSatsModal: React.FC<Props> = ({ isVisible, setIsVisible }) => {
  const { LL } = useI18nContext()
  const { theme } = useTheme()
  const styles = useStyles(theme)

  const acknowledgeModal = () => {
    setIsVisible(false)
  }

  return (
    <Modal isVisible={isVisible} backdropOpacity={0.3} onBackdropPress={acknowledgeModal}>
      <View style={styles.modalCard}>
        <ScrollView style={styles.scrollViewStyle} indicatorStyle="black">
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
        </ScrollView>
      </View>
    </Modal>
  )
}
