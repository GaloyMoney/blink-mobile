import * as React from "react"
import { Text } from "../../components/text"
import { StyleSheet, View, Image } from "react-native"
import { Button } from "react-native-elements"
import { withNavigation } from "react-navigation"
import { color } from "../../theme"

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
    paddingHorizontal: 80,
    paddingBottom: 60,
  },

  buttonStyle: {
    backgroundColor: color.primary,
  },
})

export const OnboardingScreen = withNavigation(
  ({ children, next, action, image, navigation, header = "" }) => {
    return (
      <>
        <Text style={styles.header}>{header}</Text>
        <View style={styles.container}>
          <Image source={image} style={styles.image} />
          {children}
        </View>
        <Button
          title="Next"
          onPress={next ? () => navigation.navigate(next) : action}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
        />
      </>
    )
  },
)
