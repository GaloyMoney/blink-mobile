import * as React from "react"
import { Text, View } from "react-native"
import { Button } from "@rneui/base"
import { testProps } from "../../utils/testProps"
import { palette } from "../../theme/palette"
import { makeStyles } from "@rneui/themed"

const useStyles = makeStyles(({ colors }) => ({
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
    color: colors.primary,
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
}))

type Props = {
  children: React.ReactNode
  nextTitle: string
  action: () => void
  Svg: typeof React.Component
  header: string
  loading: boolean
}

export const OnboardingScreen: React.FC<Props> = ({
  children,
  nextTitle,
  action,
  Svg,
  header = "",
  loading = false,
}) => {
  const styles = useStyles()
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
