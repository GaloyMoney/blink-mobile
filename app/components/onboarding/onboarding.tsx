import * as React from "react"
import { Text } from "../../components/text"
import { StyleSheet, View, Image } from "react-native"
import { Button } from "react-native-elements"
import { color } from "../../theme"
import { useNavigation } from '@react-navigation/native'
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },

  image: {
    alignSelf: "center",
    margin: 20,
  },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
  },

  buttonContainer: {
    marginVertical: 12,
    width: "60%",
    alignSelf: "center",
    paddingBottom: 48,
  },

  buttonStyle: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },

  buttonTitle: {
    color: color.primary,
    fontWeight: "bold",
  },


})

export const OnboardingScreen = 
({
  children,
  next /* screen */,
  nextTitle,
  action,
  Svg,
  header = "",
  loading = false,
}) => {
  const navigation = useNavigation()
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
        />
      )}
    </>
  )
}
