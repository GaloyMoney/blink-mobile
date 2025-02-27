import React, { useEffect, useRef } from "react"
import { View, Text, Animated, Modal, Image } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { Button, makeStyles, useTheme } from "@rneui/themed"
import AppLogo from "../../assets/logo/blink-logo-icon.png"

interface WelcomeUserScreenProps {
  username: string
  visible: boolean
  onComplete: () => void
}

const WelcomeUserScreen: React.FC<WelcomeUserScreenProps> = ({
  username,
  visible,
  onComplete,
}) => {
  const translateY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const styles = useStyles()
  const { theme } = useTheme()

  useEffect(() => {
    if (visible) {
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.spring(translateY, {
            toValue: -20,
            friction: 2,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            friction: 2,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
      )
      const fadeAnimation = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })

      bounceAnimation.start()
      fadeAnimation.start()

      return () => {
        bounceAnimation.stop()
        fadeAnim.setValue(0)
      }
    }
  }, [visible])

  return (
    <View>
      <Modal visible={visible} animationType="fade" transparent={false}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.primary5]}
          style={styles.container}
        >
          <Image source={AppLogo} style={styles.logo} />
          <Animated.View
            style={[
              styles.bouncingText,
              { transform: [{ translateY }], opacity: fadeAnim },
            ]}
          >
            <Text style={styles.title}>Welcome {username}!</Text>
          </Animated.View>
          <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
            <Button
              color={theme.colors.primary}
              onPress={onComplete}
              style={styles.welcomeButton}
            >
              <Text style={{ color: theme.colors.primary3 }}>Let’s get started 🚀</Text>
            </Button>
          </Animated.Text>
        </LinearGradient>
      </Modal>
    </View>
  )
}

export default WelcomeUserScreen

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  bouncingText: {
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    color: theme.colors.primary3,
    textAlign: "center",
    textShadowColor: "rgba(40, 110, 12, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.primary3,
    marginTop: 20,
  },
  logo: {
    width: "30%",
    resizeMode: "contain",
    shadowColor: theme.colors.black, // Shadow color
    shadowOffset: { width: 0, height: 5 }, // Shadow position
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 8, // Shadow blur
  },
  welcomeButton: {
    elevation: 10,
    shadowRadius: 2,
    shadowColor: "black",
    shadowOpacity: 20,
  },
}))
