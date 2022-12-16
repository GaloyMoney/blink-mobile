import * as React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Button } from "@rneui/themed"
import { testProps } from "../../../utils/testProps"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
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
  nextTitle: string
  action: () => void
  Svg: typeof React.Component
  header: string
  loading: boolean
}

export const OnboardingScreen: ScreenType = ({
  children,
  nextTitle,
  action,
  Svg,
  header = "",
  loading = false,
}: Props) => {
  return (
    <>
      <Text style={styles.header}>{header}</Text>
      <View style={styles.container}>
        <Svg style={styles.image} />
        {children}
      </View>
      {action && (
        <Button
          {...testProps(nextTitle)}
          title={nextTitle || "Next"}
          onPress={action}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          loading={loading}
          disabled={loading}
          titleStyle={styles.buttonTitle}
        />
      )}
    </>
  )
}
