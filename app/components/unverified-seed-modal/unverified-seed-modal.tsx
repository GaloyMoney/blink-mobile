import * as React from "react"
import { Image, Linking, ScrollView, View } from "react-native"
import Modal from "react-native-modal"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import { useNavigation, NavigationProp } from "@react-navigation/native"

// assets
import StablesatsImage from "../../assets/images/unlocked.png"

// components
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

// utils
import { RootStackParamList } from "@app/navigation/stack-param-lists"

const useStyles = makeStyles(({ colors }) => ({
  stableSatsImage: {
    height: 150,
    marginBottom: 16,
  },
  scrollViewStyle: {
    paddingHorizontal: 12,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  cardDescription: {
    marginBottom: 16,
  },
  termsAndConditionsText: {
    textDecorationLine: "underline",
  },
  cardActionsContainer: {
    flexDirection: "column",
  },
  marginBottom: {
    marginBottom: 10,
  },
}))

const DOCS_LINK = "https://docs.getflash.io"

type Props = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}

export const UnVerifiedSeedModal: React.FC<Props> = ({ isVisible, setIsVisible }) => {
  const { LL } = useI18nContext()
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const acknowledgeModal = () => {
    setIsVisible(false)
  }

  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const goToBackupBTCWallet = () => {
    acknowledgeModal()
    navigation.navigate("BackupStart")
  }

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      onBackdropPress={acknowledgeModal}
    >
      <View style={styles.modalCard}>
        <ScrollView style={styles.scrollViewStyle}>
          <Image
            source={StablesatsImage}
            style={styles.stableSatsImage}
            resizeMode="contain"
          />

          <Text style={styles.cardTitle} type={"h2"}>
            {LL.UnVerifiedSeedModal.header()}
          </Text>

          <Text style={styles.cardDescription} type="p2">
            {LL.UnVerifiedSeedModal.body()}{" "}
          </Text>

          <View style={styles.cardActionsContainer}>
            <View style={styles.marginBottom}>
              <GaloyPrimaryButton
                title={LL.common.revealSeed()}
                onPress={goToBackupBTCWallet}
              />
            </View>
            <View style={styles.marginBottom}>
              <GaloyPrimaryButton
                title={LL.MapScreen.locationPermissionNeutral()}
                onPress={acknowledgeModal}
              />
            </View>

            <GaloySecondaryButton
              title={LL.UnVerifiedSeedModal.learnMore()}
              onPress={() => Linking.openURL(DOCS_LINK)}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}
