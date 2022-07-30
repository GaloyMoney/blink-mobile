import { useNavigation } from "@react-navigation/native"
import * as React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import type { ScreenType } from "../../types/jsx"

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: "center",
    marginVertical: 12,
    paddingBottom: 48,
    width: "60%",
  },

  buttonStyle: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },

  buttonTitle: {
    color: color.primary,
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 40,
    textAlign: "center",
  },

  image: {
    alignSelf: "center",
    margin: 20,
  },
})

type Props = {
  children: JSX.Element
  next: keyof RootStackParamList
  nextTitle: string
  action: () => void
  Svg: typeof React.Component
  header: string
  loading: boolean
}

export const OnboardingScreen: ScreenType = ({
  children,
  next /* screen */,
  nextTitle,
  action,
  Svg,
  header = "",
  loading = false,
}: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "welcomeFirst">>()
  return (
    <>
      <Text style={styles.header}>{header}</Text>
      <View style={styles.container}>
        <Svg style={styles.image} />
        {children}
      </View>
      {(next || action) && (
        <Button
          title={nextTitle || "Next"}
          onPress={next ? () => navigation.navigate(next) : action}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          loading={loading}
          disabled={loading}
          titleStyle={styles.buttonTitle}
          testID={nextTitle || "Next"}
          accessibilityLabel={nextTitle || "Next"}
        />
      )}
    </>
  )
}
