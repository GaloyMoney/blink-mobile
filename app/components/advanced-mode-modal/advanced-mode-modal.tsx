import React from "react"
import { Image, Linking, ScrollView, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
import { makeStyles, useTheme, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import Modal from "react-native-modal"

// assets
import StablesatsImage from "../../assets/images/stable-sats.png"

// components
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

// utils
import { RootStackParamList } from "@app/navigation/stack-param-lists"

const DOCS_LINK = "https://docs.getflash.io" // TODO: Need to update link to be the correct documentation for non-custodial wallets.
const FLASH_TERMS_LINK = "https://getflash.io/terms.html" // TODO: Need to update link to be the correct terms and conditions for Flash.

type Props = {
  hasRecoveryPhrase: boolean
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
  enableAdvancedMode: () => void
}

export const AdvancedModeModal: React.FC<Props> = ({
  hasRecoveryPhrase,
  isVisible,
  setIsVisible,
  enableAdvancedMode,
}) => {
  const { LL } = useI18nContext()
  const { colors } = useTheme().theme
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const acknowledgeModal = () => {
    setIsVisible(false)
    navigation.popToTop()
  }

  const goToBackupBTCWallet = () => {
    acknowledgeModal()
    navigation.navigate("BackupStart")
  }

  const onCreateNewWallet = () => {
    setIsVisible(false)
    enableAdvancedMode()
  }

  const goToImportBTCWallet = () => {
    setIsVisible(false)
    navigation.navigate("ImportWallet", {
      insideApp: true,
      onComplete: () => {
        setTimeout(() => {
          enableAdvancedMode()
        }, 5000)
      },
    })
  }

  return (
    <Modal isVisible={isVisible} backdropOpacity={0.3} backdropColor={colors.grey3}>
      <View style={styles.modalCard}>
        <ScrollView style={styles.scrollViewStyle}>
          <Image
            source={StablesatsImage}
            style={styles.stableSatsImage}
            resizeMode="contain"
          />
          <Text style={styles.cardTitle} type={"h2"}>
            {LL.AdvancedModeModal.header()}
          </Text>

          <Text style={styles.cardDescription} type="p2">
            {LL.AdvancedModeModal.body()}{" "}
            <Text
              style={styles.termsAndConditionsText}
              onPress={() => Linking.openURL(FLASH_TERMS_LINK)}
            >
              {LL.AdvancedModeModal.termsAndConditions()}
            </Text>
          </Text>

          <View style={styles.cardActionsContainer}>
            <View style={styles.marginBottom}>
              <GaloyPrimaryButton
                title={
                  hasRecoveryPhrase
                    ? LL.common.revealSeed()
                    : LL.AdvancedModeModal.importWallet()
                }
                onPress={hasRecoveryPhrase ? goToBackupBTCWallet : goToImportBTCWallet}
              />
            </View>

            <View style={styles.marginBottom}>
              <GaloyPrimaryButton
                title={
                  hasRecoveryPhrase
                    ? LL.common.backHome()
                    : LL.AdvancedModeModal.createWallet()
                }
                onPress={hasRecoveryPhrase ? acknowledgeModal : onCreateNewWallet}
              />
            </View>

            <GaloySecondaryButton
              title={LL.AdvancedModeModal.learnMore()}
              onPress={() => Linking.openURL(DOCS_LINK)}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  stableSatsImage: {
    width: "100%",
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
    marginVertical: 50,
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
