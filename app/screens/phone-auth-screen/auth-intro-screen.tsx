import React from "react"
import { Screen } from "../../components/screen"
import { Text, useTheme } from "@rneui/themed"
import { makeStyles } from "@rneui/base"
import { View } from "react-native"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { PhoneValidationStackParamList } from "@app/navigation/stack-param-lists"
import { AccountLevel, useLevel } from "@app/graphql/level-context"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { useI18nContext } from "@app/i18n/i18n-react"

export const AuthIntroScreen = () => {
  const styles = useStyles()
  const navigation =
    useNavigation<StackNavigationProp<PhoneValidationStackParamList, "authIntro">>()
  const { currentLevel } = useLevel()
  const { LL } = useI18nContext()

  const upgrading = currentLevel === AccountLevel.Zero

  const {
    theme: { colors },
  } = useTheme()

  const onContinue = () => {
    navigation.navigate("phoneInput")
  }
  return (
    <Screen>
      <View style={styles.screenStyle}>
        <View style={styles.contentContainer}>
          <GaloyIcon name="user" size={150} color={colors.primary3} />
          <Text type="h1">
            {upgrading
              ? LL.AuthIntroScreen.upgradeAccountRequirements()
              : LL.AuthIntroScreen.signInCreateAccountRequirements()}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            title={LL.AuthIntroScreen.continue()}
            onPress={onContinue}
          />
        </View>
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  screenStyle: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  buttonContainer: {},
}))
